-- Explicit Data API privileges for AbangReno.my.
-- RLS remains authoritative; these GRANTs only make permitted operations
-- reachable through PostgREST when "Automatically expose new tables" is off.

grant usage on schema public to anon, authenticated;

-- Public directory/forum reads (RLS further restricts visible/active rows).
grant select on table
  public.categories,
  public.locations,
  public.vendors,
  public.vendor_categories,
  public.vendor_service_areas,
  public.vendor_services,
  public.vendor_images,
  public.reviews,
  public.forum_posts,
  public.forum_replies
  to anon, authenticated;

-- Signed-in users may read/update their own profile via RLS.
grant select, update on table public.profiles to authenticated;

-- Vendor self-service writes; ownership is enforced by RLS and hardening triggers.
grant insert, update on table public.vendors to authenticated;
grant insert, update, delete on table
  public.vendor_categories,
  public.vendor_service_areas,
  public.vendor_services,
  public.vendor_images
  to authenticated;

-- Verification writes remain RPC-only after migrations 0008/0009.
grant select on table public.vendor_verifications to authenticated;

-- Authenticated users create/edit their own reviews; vendor replies are constrained
-- by RLS and the review hardening trigger.
grant insert, update on table public.reviews to authenticated;

-- Forum creation and reports intentionally remain server-route/service-role only.