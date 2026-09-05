-- ============================================================================
-- AbangReno.my — vendor_verifications Direct-Write Lockdown
--
-- Now that submission and review both go through atomic, trusted RPCs
-- (submit_vendor_verification, review_vendor_verification — see 0007), the
-- previous direct-table RLS policies for INSERT/UPDATE on vendor_verifications
-- are a bypass: a vendor calling the Supabase client directly could still
-- insert a verification row without the object-existence check or the
-- one-pending-request-at-a-time check; an admin session calling the table
-- directly could still perform the old two-write (inconsistent) approve/
-- reject flow instead of the atomic one. Remove both, so vendor_verifications
-- can only be written to via the two SECURITY DEFINER functions (which
-- bypass RLS by nature) or the service role.
-- ============================================================================

drop policy if exists "Vendor owner can submit verification" on vendor_verifications;
drop policy if exists "Only admins can review verification" on vendor_verifications;

-- Read access is unaffected — vendor owners and admins can still SELECT
-- their own / all verification records (see "Vendor owner can view own
-- verification" in 0002_rls_policies.sql), only direct writes are removed.
