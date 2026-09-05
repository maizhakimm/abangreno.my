-- ============================================================================
-- AbangReno.my — Security Hardening Pass
-- Fixes privilege-escalation and system-field-tampering issues found in an
-- independent audit of migrations 0001-0003. Applied additively (no destructive
-- rewrites of prior migrations) so this can be reviewed/rolled back on its own.
--
-- Core technique: RLS decides WHICH ROWS a role may touch; it cannot restrict
-- WHICH COLUMNS change within an allowed row. So for every table where a
-- non-admin actor is allowed to UPDATE their own row, we add a BEFORE UPDATE
-- trigger that forcibly reverts any system/privileged column back to its OLD
-- value UNLESS the request is running as the service_role (i.e. one of our
-- trusted server-side admin/verification/rating code paths, which always use
-- lib/supabase/admin.ts). This means privilege escalation is blocked even if
-- a client crafts a raw PostgREST/Supabase-js call directly against the table.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 0. Harden SECURITY DEFINER functions: pin search_path so they cannot be
--    tricked by a session-level search_path manipulation into resolving
--    "profiles" or other identifiers from an attacker-controlled schema.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, email, auth_provider)
  values (new.id, new.email, coalesce(new.raw_app_meta_data->>'provider', 'email'));
  return new;
end;
$$;

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

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. PROFILES — block self-escalation of role / phone_verified / email /
--    auth_provider. A normal authenticated user may only ever change name,
--    phone (re-verification resets phone_verified — see below), avatar_url.
-- ---------------------------------------------------------------------------
create or replace function public.protect_profile_privileged_columns()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- service_role (our trusted server-side code in lib/supabase/admin.ts) is
  -- the only actor allowed to change these columns directly.
  if auth.role() <> 'service_role' then
    new.role := old.role;
    new.email := old.email;
    new.auth_provider := old.auth_provider;

    -- Changing the phone number always resets verification — a user must
    -- never be able to set phone_verified = true themselves. Re-verification
    -- happens through the OTP flow, which runs as service_role and can set
    -- phone_verified explicitly (see /api/profile/verify-phone).
    if new.phone is distinct from old.phone then
      new.phone_verified := false;
    else
      new.phone_verified := old.phone_verified;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_protect_profile_columns on profiles;
create trigger trg_protect_profile_columns
  before update on profiles
  for each row execute procedure public.protect_profile_privileged_columns();

-- Replace the old "users can update everything on their own row" policy with
-- an explicitly-scoped one. Column protection above is the real backstop;
-- this just keeps row-level access correct (own row, or admin).
drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- ---------------------------------------------------------------------------
-- 2. VENDORS — block vendor owners from writing system/computed fields:
--    avg_rating, total_reviews, profile_completeness, user_id, slug (slug
--    changes would break existing inbound links/SEO and must go through a
--    controlled re-slugging path if ever needed).
--
--    verification_status gets a narrower rule rather than a blanket lock:
--    a vendor legitimately triggers unverified/rejected -> pending
--    themselves when submitting documents for review (see
--    app/api/verification/upload/route.ts, which runs as the authenticated
--    user, not service_role). But they can NEVER set it to verified_ssm —
--    only the admin approval endpoint (service_role) can do that — and they
--    can never move it backward out of 'pending' once submitted.
-- ---------------------------------------------------------------------------
create or replace function public.protect_vendor_system_columns()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.role() <> 'service_role' then
    if new.verification_status is distinct from old.verification_status then
      if new.verification_status = 'pending' and old.verification_status in ('unverified', 'rejected') then
        -- Allowed: vendor submitting (or re-submitting) for review.
        null;
      else
        new.verification_status := old.verification_status;
      end if;
    end if;

    new.avg_rating := old.avg_rating;
    new.total_reviews := old.total_reviews;
    new.profile_completeness := old.profile_completeness;
    new.user_id := old.user_id;
    new.slug := old.slug;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_protect_vendor_columns on vendors;
create trigger trg_protect_vendor_columns
  before update on vendors
  for each row execute procedure public.protect_vendor_system_columns();

-- ---------------------------------------------------------------------------
-- 3. REVIEWS — split editing rights by actor:
--      reviewer (auth.uid() = user_id):   may change rating, comment only
--      vendor owner (owns vendor_id):     may change vendor_reply only
--      admin / service_role:              unrestricted (moderation, status)
-- ---------------------------------------------------------------------------
create or replace function public.protect_review_columns()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  is_reviewer boolean;
  is_vendor_owner boolean;
begin
  if auth.role() = 'service_role' or public.is_admin() then
    return new; -- admin / trusted server code: unrestricted
  end if;

  is_reviewer := auth.uid() = old.user_id;
  is_vendor_owner := exists (
    select 1 from public.vendors v where v.id = old.vendor_id and v.user_id = auth.uid()
  );

  if is_reviewer then
    -- Reviewer may only touch rating/comment; everything else reverts.
    new.status := old.status;
    new.vendor_reply := old.vendor_reply;
    new.vendor_id := old.vendor_id;
    new.user_id := old.user_id;
  elsif is_vendor_owner then
    -- Vendor may only touch vendor_reply; everything else reverts.
    new.rating := old.rating;
    new.comment := old.comment;
    new.status := old.status;
    new.vendor_id := old.vendor_id;
    new.user_id := old.user_id;
  else
    -- Shouldn't be reachable (RLS should have already blocked this row),
    -- but as defense in depth, revert everything.
    new := old;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_protect_review_columns on reviews;
create trigger trg_protect_review_columns
  before update on reviews
  for each row execute procedure public.protect_review_columns();

-- Tighten the review UPDATE policies: the previous "vendor owner can reply"
-- policy had no WITH CHECK and no column restriction — replace both
-- reviewer and vendor-reply policies with explicit, narrower ones. The
-- trigger above is the real enforcement; these just fix the row-level scope.
drop policy if exists "Users can update own review" on reviews;
create policy "Reviewer can update own review" on reviews
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Vendor owner can reply to review on their vendor" on reviews;
create policy "Vendor owner can reply to review on their vendor" on reviews
  for update using (
    exists (select 1 from vendors v where v.id = reviews.vendor_id and v.user_id = auth.uid())
  ) with check (
    exists (select 1 from vendors v where v.id = reviews.vendor_id and v.user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- 4. One vendor listing per user for this MVP (no deliberate multi-business
--    ownership model yet). Prevents accidental/abusive unlimited listings.
-- ---------------------------------------------------------------------------
alter table vendors add constraint vendors_user_id_unique unique (user_id);

-- ---------------------------------------------------------------------------
-- 5. Only one primary category per vendor.
-- ---------------------------------------------------------------------------
create unique index if not exists idx_vendor_categories_one_primary
  on vendor_categories (vendor_id)
  where is_primary = true;

-- ---------------------------------------------------------------------------
-- 6. Verification workflow consistency: a vendor cannot have more than one
--    OPEN (pending) verification request in flight at once.
-- ---------------------------------------------------------------------------
create unique index if not exists idx_vendor_verifications_one_pending
  on vendor_verifications (vendor_id)
  where status = 'pending';

-- ---------------------------------------------------------------------------
-- 7. Additional indexes for the SEO read paths (category/location listing
--    queries, forum visibility filtering).
-- ---------------------------------------------------------------------------
create index if not exists idx_forum_posts_category_status on forum_posts(category_id, status);
create index if not exists idx_forum_replies_post_status on forum_replies(post_id, status);
create index if not exists idx_vendors_active_verification on vendors(is_active, verification_status);
create index if not exists idx_reviews_vendor_status on reviews(vendor_id, status);
