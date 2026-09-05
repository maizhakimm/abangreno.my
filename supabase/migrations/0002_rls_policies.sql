-- ============================================================================
-- AbangReno.my — Row Level Security Policies
-- Principle: public reads are narrow and explicit; writes go through
-- authenticated ownership checks or are restricted to service-role only
-- (used by Route Handlers for guest forum posts, admin actions, etc).
-- ============================================================================

alter table profiles enable row level security;
alter table vendors enable row level security;
alter table categories enable row level security;
alter table vendor_categories enable row level security;
alter table locations enable row level security;
alter table vendor_service_areas enable row level security;
alter table vendor_services enable row level security;
alter table vendor_images enable row level security;
alter table vendor_verifications enable row level security;
alter table reviews enable row level security;
alter table forum_posts enable row level security;
alter table forum_replies enable row level security;
alter table reports enable row level security;

-- Helper: is the current user an admin?
create function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- ---------------------------------------------------------------------------
-- PROFILES
-- ---------------------------------------------------------------------------
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id or public.is_admin());

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- CATEGORIES & LOCATIONS — fully public read, admin-only write
-- ---------------------------------------------------------------------------
create policy "Public can read active categories" on categories
  for select using (is_active = true or public.is_admin());

create policy "Admins manage categories" on categories
  for all using (public.is_admin()) with check (public.is_admin());

create policy "Public can read locations" on locations
  for select using (true);

create policy "Admins manage locations" on locations
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- VENDORS
-- ---------------------------------------------------------------------------
create policy "Public can read active vendors" on vendors
  for select using (is_active = true or auth.uid() = user_id or public.is_admin());

create policy "Vendor owner can insert own vendor profile" on vendors
  for insert with check (auth.uid() = user_id);

create policy "Vendor owner can update own vendor profile" on vendors
  for update using (auth.uid() = user_id or public.is_admin());

-- ---------------------------------------------------------------------------
-- VENDOR CATEGORIES / SERVICE AREAS / SERVICES / IMAGES
-- Readable whenever the parent vendor is readable; writable by vendor owner.
-- ---------------------------------------------------------------------------
create policy "Public can read vendor categories" on vendor_categories
  for select using (
    exists (select 1 from vendors v where v.id = vendor_id and (v.is_active or public.is_admin()))
  );

create policy "Vendor owner manages own categories" on vendor_categories
  for all using (
    exists (select 1 from vendors v where v.id = vendor_id and v.user_id = auth.uid())
  ) with check (
    exists (select 1 from vendors v where v.id = vendor_id and v.user_id = auth.uid())
  );

create policy "Public can read vendor service areas" on vendor_service_areas
  for select using (
    exists (select 1 from vendors v where v.id = vendor_id and (v.is_active or public.is_admin()))
  );

create policy "Vendor owner manages own service areas" on vendor_service_areas
  for all using (
    exists (select 1 from vendors v where v.id = vendor_id and v.user_id = auth.uid())
  ) with check (
    exists (select 1 from vendors v where v.id = vendor_id and v.user_id = auth.uid())
  );

create policy "Public can read active vendor services" on vendor_services
  for select using (
    is_active = true and exists (select 1 from vendors v where v.id = vendor_id and v.is_active)
  );

create policy "Vendor owner manages own services" on vendor_services
  for all using (
    exists (select 1 from vendors v where v.id = vendor_id and v.user_id = auth.uid())
  ) with check (
    exists (select 1 from vendors v where v.id = vendor_id and v.user_id = auth.uid())
  );

create policy "Public can read vendor images" on vendor_images
  for select using (
    exists (select 1 from vendors v where v.id = vendor_id and v.is_active)
  );

create policy "Vendor owner manages own images" on vendor_images
  for all using (
    exists (select 1 from vendors v where v.id = vendor_id and v.user_id = auth.uid())
  ) with check (
    exists (select 1 from vendors v where v.id = vendor_id and v.user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- VENDOR VERIFICATIONS — never public. Owner can view/insert own; only
-- admins can review/update status. Document paths point at a PRIVATE bucket.
-- ---------------------------------------------------------------------------
create policy "Vendor owner can view own verification" on vendor_verifications
  for select using (
    exists (select 1 from vendors v where v.id = vendor_id and v.user_id = auth.uid())
    or public.is_admin()
  );

create policy "Vendor owner can submit verification" on vendor_verifications
  for insert with check (
    exists (select 1 from vendors v where v.id = vendor_id and v.user_id = auth.uid())
  );

create policy "Only admins can review verification" on vendor_verifications
  for update using (public.is_admin());

-- ---------------------------------------------------------------------------
-- REVIEWS — visible reviews are public; one review per user per vendor;
-- users edit their own review; vendor owner can attach a reply.
-- ---------------------------------------------------------------------------
create policy "Public can read visible reviews" on reviews
  for select using (status = 'visible' or auth.uid() = user_id or public.is_admin());

create policy "Authenticated users can create own review" on reviews
  for insert with check (auth.uid() = user_id);

create policy "Users can update own review" on reviews
  for update using (auth.uid() = user_id);

create policy "Vendor owner can reply to review on their vendor" on reviews
  for update using (
    exists (select 1 from vendors v where v.id = reviews.vendor_id and v.user_id = auth.uid())
  );

create policy "Admins moderate reviews" on reviews
  for update using (public.is_admin());

-- ---------------------------------------------------------------------------
-- FORUM POSTS / REPLIES
-- Public reads visible content only. Guest writes are NOT done via direct
-- RLS insert from the anon client — they go through a Route Handler using
-- the service role so we can enforce rate limiting, Turnstile verification,
-- and keyword spam filtering server-side before the row is ever created.
-- Authenticated users may still read their own pending posts.
-- ---------------------------------------------------------------------------
create policy "Public can read visible forum posts" on forum_posts
  for select using (
    status = 'visible' or auth.uid() = user_id or public.is_admin()
  );

create policy "Admins moderate forum posts" on forum_posts
  for update using (public.is_admin());

create policy "Public can read visible forum replies" on forum_replies
  for select using (
    status = 'visible' or auth.uid() = user_id or public.is_admin()
  );

create policy "Admins moderate forum replies" on forum_replies
  for update using (public.is_admin());

-- Note: INSERT policies for forum_posts / forum_replies are intentionally
-- omitted here for the anon/authenticated roles. All creation happens via
-- the service-role client inside app/api/forum/post and app/api/forum/reply,
-- after server-side validation (see lib/moderation). This prevents guests
-- from bypassing spam checks by calling the Supabase client directly.

-- ---------------------------------------------------------------------------
-- REPORTS — anyone signed in can file a report; only admins can read/manage.
-- Anonymous reports are also routed through a Route Handler (service role)
-- so we can rate-limit them without granting broad anon insert access.
-- ---------------------------------------------------------------------------
create policy "Authenticated users can file reports" on reports
  for insert with check (auth.uid() = reporter_user_id);

create policy "Admins can read and manage reports" on reports
  for select using (public.is_admin());

create policy "Admins can update reports" on reports
  for update using (public.is_admin());
