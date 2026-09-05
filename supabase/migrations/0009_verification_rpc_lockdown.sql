-- ============================================================================
-- AbangReno.my — Verification Submission RPC Lockdown
--
-- 0007 granted EXECUTE on submit_vendor_verification(text, text) to the
-- "authenticated" role. Since the function resolved ownership via auth.uid()
-- internally, any authenticated vendor could call it DIRECTLY via the
-- Supabase client, bypassing /api/verification/upload entirely — meaning
-- they could submit document paths that were never confirmed to exist in
-- Storage (the existence check lives only in the route, not the function).
--
-- Fix: revoke authenticated execute, change the function to accept a
-- trusted p_user_id parameter (supplied by the server after it has already
-- authenticated the caller with the normal client), and grant execute to
-- service_role only. The function still independently verifies that
-- p_user_id actually owns the vendor row — it does not trust that the
-- caller "must" be right just because it's coming from the service role;
-- the service-role credential establishes that the CALLER is trusted
-- infrastructure, not that the vendor_id itself is trusted, so ownership is
-- still resolved from p_user_id -> vendors.user_id inside the function.
-- ============================================================================

revoke execute on function public.submit_vendor_verification(text, text) from authenticated;

drop function if exists public.submit_vendor_verification(text, text);

create or replace function public.submit_vendor_verification(
  p_user_id uuid,
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
  -- Only trusted server-side callers (service_role) may invoke this at all
  -- — see the REVOKE/GRANT below. This check is a second, independent
  -- layer in case grants are ever misconfigured.
  if auth.role() <> 'service_role' then
    raise exception 'NOT_AUTHORIZED' using errcode = '42501';
  end if;

  if p_user_id is null then
    raise exception 'USER_ID_REQUIRED' using errcode = 'P0001';
  end if;

  select v.id, v.slug, v.verification_status
    into v_vendor
  from vendors v
  where v.user_id = p_user_id
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

  -- Path ownership re-checked here too (defense in depth — the route
  -- handler already checked this, and separately confirmed both objects
  -- actually exist in Storage, BEFORE ever calling this function).
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

-- Only the service role (i.e. our trusted server route, after it has
-- already authenticated the user, resolved ownership, and confirmed the
-- Storage objects exist) may call this function. No client-side Supabase
-- session — however authenticated — can invoke it directly.
grant execute on function public.submit_vendor_verification(uuid, text, text) to service_role;
revoke execute on function public.submit_vendor_verification(uuid, text, text) from authenticated, anon, public;
