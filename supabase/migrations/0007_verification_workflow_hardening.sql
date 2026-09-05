-- ============================================================================
-- AbangReno.my — Verification Workflow Hardening (V3 audit fixes)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Protect vendors.is_active as a full system field, and REMOVE the
--    previous unverified/rejected -> pending self-service exception for
--    verification_status. Vendors can no longer change verification_status
--    through a raw table UPDATE at all — submission now happens exclusively
--    through submit_vendor_verification() below.
--
--    IMPORTANT: SECURITY DEFINER changes which role's PRIVILEGES a function
--    runs with, but it does NOT change what auth.role()/auth.uid() report —
--    those reflect the calling request's JWT regardless of function
--    ownership, and BEFORE UPDATE triggers always fire regardless of the
--    executing role. So a trusted RPC that needs to perform an update this
--    trigger would otherwise block must explicitly signal that intent via a
--    transaction-local setting, which the trigger checks below. This bypass
--    is only ever set from inside submit_vendor_verification() and
--    review_vendor_verification() themselves — never by client code — and
--    is scoped `true` (local to the current transaction), so it cannot leak
--    into any other statement or session.
-- ---------------------------------------------------------------------------
create or replace function public.protect_vendor_system_columns()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.role() <> 'service_role'
     and coalesce(current_setting('app.trusted_verification_write', true), '') <> 'true' then
    new.verification_status := old.verification_status;
    new.avg_rating := old.avg_rating;
    new.total_reviews := old.total_reviews;
    new.profile_completeness := old.profile_completeness;
    new.user_id := old.user_id;
    new.slug := old.slug;
    new.is_active := old.is_active;
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 2. submit_vendor_verification() — atomic, trusted submission path.
--    Runs as SECURITY DEFINER so it can perform the vendors.verification_status
--    transition that the trigger above otherwise blocks for ordinary clients,
--    but only after checking ownership, current state, and no existing
--    pending request — all inside one transaction.
--
--    Called from app/api/verification/upload/route.ts using the caller's own
--    JWT context (supabase-js `rpc()` from the regular server client, not
--    the admin client), so auth.uid() inside this function is the real
--    authenticated user — ownership is verified against that, not a
--    client-supplied vendor_id.
-- ---------------------------------------------------------------------------
create or replace function public.submit_vendor_verification(
  p_ssm_document_path text,
  p_ic_document_path text
)
returns table (verification_id uuid, vendor_id uuid, vendor_slug text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_vendor record;
  v_verification_id uuid;
begin
  select v.id, v.slug, v.verification_status
    into v_vendor
  from vendors v
  where v.user_id = auth.uid()
  for update; -- lock the vendor row for the duration of this transaction

  if v_vendor.id is null then
    raise exception 'VENDOR_NOT_FOUND' using errcode = 'P0002';
  end if;

  if v_vendor.verification_status not in ('unverified', 'rejected') then
    raise exception 'VERIFICATION_NOT_ALLOWED_IN_CURRENT_STATE' using errcode = 'P0001';
  end if;

  if exists (
    select 1 from vendor_verifications
    where vendor_verifications.vendor_id = v_vendor.id and status = 'pending'
  ) then
    raise exception 'PENDING_VERIFICATION_ALREADY_EXISTS' using errcode = 'P0001';
  end if;

  -- Path ownership is re-checked here too (defense in depth — the route
  -- handler also checks this against storage.objects before calling in).
  if p_ssm_document_path !~ ('^' || v_vendor.id::text || '/')
     or p_ic_document_path !~ ('^' || v_vendor.id::text || '/') then
    raise exception 'DOCUMENT_PATH_OWNERSHIP_MISMATCH' using errcode = 'P0001';
  end if;

  insert into vendor_verifications (vendor_id, ssm_document_path, ic_document_path, status)
  values (v_vendor.id, p_ssm_document_path, p_ic_document_path, 'pending')
  returning id into v_verification_id;

  perform set_config('app.trusted_verification_write', 'true', true);
  update vendors set verification_status = 'pending' where id = v_vendor.id;

  return query select v_verification_id, v_vendor.id, v_vendor.slug;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. review_vendor_verification() — atomic admin approve/reject.
--    Called via the admin route using the SERVICE ROLE client, but the
--    route independently checks the caller's admin status before invoking
--    this — this function additionally re-checks is_admin() itself so it is
--    never safe to call with anything less than a verified admin session or
--    the service role.
-- ---------------------------------------------------------------------------
create or replace function public.review_vendor_verification(
  p_verification_id uuid,
  p_vendor_id uuid,
  p_decision verification_status,
  p_admin_id uuid,
  p_admin_notes text default null
)
returns table (vendor_id uuid, vendor_slug text, primary_category_id uuid)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_verification record;
  v_vendor record;
begin
  if auth.role() <> 'service_role' and not public.is_admin() then
    raise exception 'NOT_AUTHORIZED' using errcode = '42501';
  end if;

  if p_decision not in ('verified_ssm', 'rejected') then
    raise exception 'INVALID_DECISION' using errcode = 'P0001';
  end if;

  select * into v_verification
  from vendor_verifications
  where id = p_verification_id
  for update;

  if v_verification.id is null then
    raise exception 'VERIFICATION_NOT_FOUND' using errcode = 'P0002';
  end if;

  if v_verification.vendor_id <> p_vendor_id then
    raise exception 'VERIFICATION_VENDOR_MISMATCH' using errcode = 'P0001';
  end if;

  if v_verification.status <> 'pending' then
    raise exception 'VERIFICATION_NOT_PENDING' using errcode = 'P0001';
  end if;

  update vendor_verifications
  set status = p_decision,
      reviewed_at = now(),
      reviewed_by = p_admin_id,
      admin_notes = p_admin_notes
  where id = p_verification_id;

  perform set_config('app.trusted_verification_write', 'true', true);
  update vendors
  set verification_status = p_decision
  where id = p_vendor_id
  returning id, slug, primary_category_id into v_vendor;

  if v_vendor.id is null then
    raise exception 'VENDOR_NOT_FOUND' using errcode = 'P0002';
  end if;

  return query select v_vendor.id, v_vendor.slug, v_vendor.primary_category_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. Storage size/MIME restrictions at the bucket level (§5). Supabase
--    Storage supports per-bucket file_size_limit and allowed_mime_types
--    columns on storage.buckets (available on current hosted + self-hosted
--    versions). This is enforced by the Storage API itself on every upload,
--    independent of any client-side validation.
-- ---------------------------------------------------------------------------
update storage.buckets
set file_size_limit = 5242880, -- 5 MB
    allowed_mime_types = array['application/pdf', 'image/jpeg', 'image/png']
where id = 'vendor-private-documents';

update storage.buckets
set file_size_limit = 5242880, -- 5 MB
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'vendor-public-media';

-- ---------------------------------------------------------------------------
-- 5. Explicit execute grants — Postgres grants EXECUTE on new functions to
--    PUBLIC by default, but we state this explicitly for clarity and so it
--    survives a stricter default-privilege setup. Each function still does
--    its own internal authorization check regardless of who can call it.
-- ---------------------------------------------------------------------------
grant execute on function public.submit_vendor_verification(text, text) to authenticated;
grant execute on function public.review_vendor_verification(uuid, uuid, verification_status, uuid, text)
  to authenticated, service_role;
