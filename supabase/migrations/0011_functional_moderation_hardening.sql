-- ============================================================================
-- AbangReno.my — Functional Moderation Hardening (additive; does not modify
-- 0001-0010). Covers three concrete issues found during this audit:
--
--   1. Missing explicit Data API GRANTs on `reports` for the authenticated
--      role. RLS policies allowing admins to SELECT/UPDATE reports already
--      existed (0002), but because "Automatically expose new tables" is off,
--      PostgREST rejects the request before RLS is even evaluated without a
--      table-level GRANT. app/admin/reports/page.tsx uses the normal
--      (RLS-scoped) client, so it was silently returning nothing for admins.
--
--   2. A real bug in the rating-cache trigger: refresh_vendor_rating() (on
--      reviews) internally issues `update vendors set avg_rating = ...`,
--      which itself fires vendors' own BEFORE UPDATE trigger
--      (protect_vendor_system_columns, added in 0004/0007). That trigger
--      reverts avg_rating/total_reviews back to their OLD values for any
--      actor that isn't service_role or carrying the
--      app.trusted_verification_write flag — which a normal user submitting
--      a review is neither. So the rating cache was silently failing to
--      update for ordinary (non-service-role) review submissions. Fixed by
--      having refresh_vendor_rating() set the same trusted-write bypass flag
--      immediately before its internal vendors update.
--
--   3. No prevention of a vendor reviewing their own listing. Added as a
--      BEFORE INSERT trigger on reviews (defense in depth alongside the
--      app-level ownership check in app/api/review/route.ts).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Explicit Data API grants for reports. RLS (0002: "Admins can read and
--    manage reports", "Admins can update reports") remains the actual
--    authorization boundary — this GRANT only makes the table reachable
--    through PostgREST at all for the authenticated role. Anon gets nothing
--    here (no grant = no access, regardless of RLS), preserving "no anon
--    SELECT/INSERT on reports" exactly as before. No INSERT grant is added
--    for authenticated either — report creation remains /api/report
--    (service-role) only, per 0006.
-- ---------------------------------------------------------------------------
grant select, update on table public.reports to authenticated;

-- ---------------------------------------------------------------------------
-- 2. Fix the rating-cache trigger so it can actually write through the
--    vendor system-column protection trigger via the same transaction-local
--    bypass flag the verification RPCs use.
-- ---------------------------------------------------------------------------
create or replace function public.refresh_vendor_rating()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  target_vendor_id uuid;
begin
  target_vendor_id := coalesce(new.vendor_id, old.vendor_id);

  perform set_config('app.trusted_verification_write', 'true', true);

  update public.vendors v
  set avg_rating = coalesce((
        select round(avg(r.rating)::numeric, 2)
        from public.reviews r
        where r.vendor_id = target_vendor_id and r.status = 'visible'
      ), 0),
      total_reviews = (
        select count(*) from public.reviews r
        where r.vendor_id = target_vendor_id and r.status = 'visible'
      )
  where v.id = target_vendor_id;

  return null;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. Prevent a vendor from reviewing their own listing, at the database
--    level (defense in depth alongside the app-level check in
--    app/api/review/route.ts, which resolves this before even attempting
--    the insert so the user gets a clean 403 rather than this exception).
-- ---------------------------------------------------------------------------
create or replace function public.prevent_vendor_self_review()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if exists (
    select 1 from vendors v where v.id = new.vendor_id and v.user_id = new.user_id
  ) then
    raise exception 'VENDOR_SELF_REVIEW_NOT_ALLOWED' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_prevent_vendor_self_review on reviews;
create trigger trg_prevent_vendor_self_review
  before insert on reviews
  for each row execute procedure public.prevent_vendor_self_review();
