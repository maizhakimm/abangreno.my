-- ============================================================================
-- AbangReno.my — Reports must go through the rate-limited server route
-- §13 — if authenticated users can INSERT into reports directly via RLS,
-- they can bypass the IP-hash rate limiter in app/api/report/route.ts by
-- calling the Supabase client directly from the browser. Remove that direct
-- insert policy entirely; ALL report creation now goes through the service
-- role client inside the Route Handler, matching the guest-forum pattern.
-- ============================================================================

drop policy if exists "Authenticated users can file reports" on reports;

-- No replacement INSERT policy is added: reports has zero INSERT policies
-- for anon/authenticated roles, so only the service-role client (used
-- exclusively by app/api/report/route.ts, after validation + rate limiting)
-- can create a report row.
