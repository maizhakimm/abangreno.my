// Hand-authored types mirroring supabase/migrations/0001_init_schema.sql.
// Once the project is connected to a live Supabase instance, regenerate with:
//   npx supabase gen types typescript --project-id <id> > types/database.ts
// and re-apply any manual annotations below.

export type UserRole = "user" | "vendor" | "admin";
export type VerificationStatus = "unverified" | "pending" | "verified_ssm" | "rejected";
export type VendorImageType = "profile" | "gallery" | "before" | "after";
export type ReviewStatus = "visible" | "flagged" | "removed";
export type ModerationStatus = "pending" | "visible" | "flagged" | "removed";
export type LocationType = "state" | "city" | "district" | "area";
export type ReportTargetType = "vendor" | "review" | "forum_post" | "forum_reply";
export type ReportStatus = "pending" | "reviewed" | "actioned";

export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  phone_verified: boolean;
  avatar_url: string | null;
  auth_provider: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  description: string | null;
  seo_title: string | null;
  seo_description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  name: string;
  slug: string;
  state: string | null;
  state_slug: string | null;
  parent_id: string | null;
  type: LocationType;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export interface Vendor {
  id: string;
  user_id: string;
  business_name: string;
  slug: string;
  primary_category_id: string | null;
  phone: string | null;
  whatsapp: string | null;
  description: string | null;
  profile_picture_url: string | null;
  verification_status: VerificationStatus;
  avg_rating: number;
  total_reviews: number;
  is_active: boolean;
  profile_completeness: number;
  created_at: string;
  updated_at: string;
}

export interface VendorService {
  id: string;
  vendor_id: string;
  title: string;
  description: string | null;
  price_from: number | null;
  price_unit: string | null;
  is_active: boolean;
  created_at: string;
}

export interface VendorImage {
  id: string;
  vendor_id: string;
  image_url: string;
  thumbnail_url: string | null;
  type: VendorImageType;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export interface VendorVerification {
  id: string;
  vendor_id: string;
  ssm_document_path: string | null;
  ic_document_path: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  status: VerificationStatus;
  admin_notes: string | null;
}

export interface Review {
  id: string;
  vendor_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  vendor_reply: string | null;
  status: ReviewStatus;
  created_at: string;
  updated_at: string;
}

export interface ForumPost {
  id: string;
  category_id: string | null;
  slug: string;
  title: string;
  content: string;
  location_tag: string | null;
  guest_name: string | null;
  guest_email: string | null;
  user_id: string | null;
  session_token: string | null;
  ip_hash: string | null;
  status: ModerationStatus;
  created_at: string;
  updated_at: string;
}

export interface ForumReply {
  id: string;
  post_id: string;
  guest_name: string | null;
  guest_email: string | null;
  user_id: string | null;
  session_token: string | null;
  ip_hash: string | null;
  content: string;
  is_vendor_reply: boolean;
  vendor_id: string | null;
  status: ModerationStatus;
  created_at: string;
}

export interface Report {
  id: string;
  target_type: ReportTargetType;
  target_id: string;
  reporter_user_id: string | null;
  reason: string;
  details: string | null;
  status: ReportStatus;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

/** Vendor joined with its primary category + service areas, as used on cards and profile pages. */
export interface VendorWithRelations extends Vendor {
  primary_category?: Category | null;
  service_areas?: Location[];
  images?: VendorImage[];
  services?: VendorService[];
}
