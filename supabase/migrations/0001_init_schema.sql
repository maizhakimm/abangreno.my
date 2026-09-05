-- ============================================================================
-- AbangReno.my — Initial Schema
-- Normalized directory + review + forum architecture.
-- Apply with: supabase db push  (or paste into Supabase SQL editor)
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- ENUM TYPES
-- ---------------------------------------------------------------------------
create type user_role as enum ('user', 'vendor', 'admin');
create type verification_status as enum ('unverified', 'pending', 'verified_ssm', 'rejected');
create type vendor_image_type as enum ('profile', 'gallery', 'before', 'after');
create type review_status as enum ('visible', 'flagged', 'removed');
create type moderation_status as enum ('pending', 'visible', 'flagged', 'removed');
create type location_type as enum ('state', 'city', 'district', 'area');
create type report_target_type as enum ('vendor', 'review', 'forum_post', 'forum_reply');
create type report_status as enum ('pending', 'reviewed', 'actioned');

-- ---------------------------------------------------------------------------
-- PROFILES  (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  phone text,
  phone_verified boolean not null default false,
  avatar_url text,
  auth_provider text,
  role user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up.
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, auth_provider)
  values (new.id, new.email, coalesce(new.raw_app_meta_data->>'provider', 'email'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- CATEGORIES
-- ---------------------------------------------------------------------------
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  parent_id uuid references categories(id) on delete set null,
  description text,
  seo_title text,
  seo_description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_categories_slug on categories(slug);
create index idx_categories_parent on categories(parent_id);

-- ---------------------------------------------------------------------------
-- LOCATIONS
-- ---------------------------------------------------------------------------
create table locations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  state text,
  state_slug text,
  parent_id uuid references locations(id) on delete set null,
  type location_type not null,
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now()
);

create index idx_locations_slug on locations(slug);
create index idx_locations_state_slug on locations(state_slug);
create index idx_locations_parent on locations(parent_id);

-- ---------------------------------------------------------------------------
-- VENDORS
-- ---------------------------------------------------------------------------
create table vendors (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  business_name text not null,
  slug text not null unique,
  primary_category_id uuid references categories(id) on delete set null,
  phone text,
  whatsapp text,
  description text,
  profile_picture_url text,
  verification_status verification_status not null default 'unverified',
  avg_rating numeric(3,2) not null default 0,
  total_reviews integer not null default 0,
  is_active boolean not null default true,
  profile_completeness integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_vendors_slug on vendors(slug);
create index idx_vendors_primary_category on vendors(primary_category_id);
create index idx_vendors_verification on vendors(verification_status);
create index idx_vendors_active on vendors(is_active);

-- ---------------------------------------------------------------------------
-- VENDOR <-> CATEGORIES (many-to-many)
-- ---------------------------------------------------------------------------
create table vendor_categories (
  vendor_id uuid not null references vendors(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  is_primary boolean not null default false,
  primary key (vendor_id, category_id)
);

create index idx_vendor_categories_category on vendor_categories(category_id);

-- ---------------------------------------------------------------------------
-- VENDOR SERVICE AREAS (many-to-many with locations)
-- ---------------------------------------------------------------------------
create table vendor_service_areas (
  vendor_id uuid not null references vendors(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,
  primary key (vendor_id, location_id)
);

create index idx_vendor_service_areas_location on vendor_service_areas(location_id);

-- ---------------------------------------------------------------------------
-- VENDOR SERVICES (line items offered)
-- ---------------------------------------------------------------------------
create table vendor_services (
  id uuid primary key default uuid_generate_v4(),
  vendor_id uuid not null references vendors(id) on delete cascade,
  title text not null,
  description text,
  price_from numeric(10,2),
  price_unit text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_vendor_services_vendor on vendor_services(vendor_id);

-- ---------------------------------------------------------------------------
-- VENDOR IMAGES
-- ---------------------------------------------------------------------------
create table vendor_images (
  id uuid primary key default uuid_generate_v4(),
  vendor_id uuid not null references vendors(id) on delete cascade,
  image_url text not null,
  thumbnail_url text,
  type vendor_image_type not null default 'gallery',
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index idx_vendor_images_vendor on vendor_images(vendor_id);

-- ---------------------------------------------------------------------------
-- VENDOR VERIFICATIONS (SSM / IC — private documents)
-- ---------------------------------------------------------------------------
create table vendor_verifications (
  id uuid primary key default uuid_generate_v4(),
  vendor_id uuid not null references vendors(id) on delete cascade,
  ssm_document_path text,
  ic_document_path text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references profiles(id),
  status verification_status not null default 'pending',
  admin_notes text
);

create index idx_vendor_verifications_vendor on vendor_verifications(vendor_id);
create index idx_vendor_verifications_status on vendor_verifications(status);

-- ---------------------------------------------------------------------------
-- REVIEWS
-- ---------------------------------------------------------------------------
create table reviews (
  id uuid primary key default uuid_generate_v4(),
  vendor_id uuid not null references vendors(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  vendor_reply text,
  status review_status not null default 'visible',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (vendor_id, user_id)
);

create index idx_reviews_vendor on reviews(vendor_id);

-- Keep vendors.avg_rating / total_reviews in sync without recomputing on read.
create function public.refresh_vendor_rating()
returns trigger as $$
declare
  target_vendor_id uuid;
begin
  target_vendor_id := coalesce(new.vendor_id, old.vendor_id);

  update vendors v
  set avg_rating = coalesce((
        select round(avg(r.rating)::numeric, 2)
        from reviews r
        where r.vendor_id = target_vendor_id and r.status = 'visible'
      ), 0),
      total_reviews = (
        select count(*) from reviews r
        where r.vendor_id = target_vendor_id and r.status = 'visible'
      )
  where v.id = target_vendor_id;

  return null;
end;
$$ language plpgsql security definer;

create trigger trg_reviews_after_change
  after insert or update or delete on reviews
  for each row execute procedure public.refresh_vendor_rating();

-- ---------------------------------------------------------------------------
-- FORUM POSTS  (guest-postable Q&A)
-- ---------------------------------------------------------------------------
create table forum_posts (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid references categories(id) on delete set null,
  slug text not null unique,
  title text not null,
  content text not null,
  location_tag text,
  guest_name text,
  guest_email text,
  user_id uuid references profiles(id) on delete set null,
  session_token text,
  ip_hash text,
  status moderation_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_forum_posts_category on forum_posts(category_id);
create index idx_forum_posts_slug on forum_posts(slug);
create index idx_forum_posts_status on forum_posts(status);
create index idx_forum_posts_session on forum_posts(session_token);
create index idx_forum_posts_ip_hash on forum_posts(ip_hash);

-- ---------------------------------------------------------------------------
-- FORUM REPLIES
-- ---------------------------------------------------------------------------
create table forum_replies (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references forum_posts(id) on delete cascade,
  guest_name text,
  guest_email text,
  user_id uuid references profiles(id) on delete set null,
  session_token text,
  ip_hash text,
  content text not null,
  is_vendor_reply boolean not null default false,
  vendor_id uuid references vendors(id) on delete set null,
  status moderation_status not null default 'pending',
  created_at timestamptz not null default now()
);

create index idx_forum_replies_post on forum_replies(post_id);
create index idx_forum_replies_status on forum_replies(status);

-- ---------------------------------------------------------------------------
-- REPORTS (generic — vendor / review / forum_post / forum_reply)
-- ---------------------------------------------------------------------------
create table reports (
  id uuid primary key default uuid_generate_v4(),
  target_type report_target_type not null,
  target_id uuid not null,
  reporter_user_id uuid references profiles(id) on delete set null,
  reason text not null,
  details text,
  status report_status not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references profiles(id)
);

create index idx_reports_target on reports(target_type, target_id);
create index idx_reports_status on reports(status);

-- ---------------------------------------------------------------------------
-- updated_at helper trigger, applied to key tables
-- ---------------------------------------------------------------------------
create function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at before update on profiles
  for each row execute procedure public.set_updated_at();
create trigger trg_vendors_updated_at before update on vendors
  for each row execute procedure public.set_updated_at();
create trigger trg_categories_updated_at before update on categories
  for each row execute procedure public.set_updated_at();
create trigger trg_reviews_updated_at before update on reviews
  for each row execute procedure public.set_updated_at();
create trigger trg_forum_posts_updated_at before update on forum_posts
  for each row execute procedure public.set_updated_at();
