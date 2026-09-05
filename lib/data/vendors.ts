import "server-only";
import { createClient } from "@/lib/supabase/server";
import { sortVendorsByRanking } from "@/lib/ranking/vendorRanking";
import type {
  Category,
  Location,
  Review,
  Vendor,
  VendorImage,
  VendorService,
  VendorWithRelations,
} from "@/types/database";

/**
 * Attaches primary_category + service_areas to a set of vendors in a small,
 * fixed number of queries (not N+1 per vendor) — suitable for listing pages
 * showing a page of results at a time.
 */
async function attachListingRelations(vendors: Vendor[]): Promise<VendorWithRelations[]> {
  if (vendors.length === 0) return [];
  const supabase = await createClient();

  const vendorIds = vendors.map((v) => v.id);
  const categoryIds = [...new Set(vendors.map((v) => v.primary_category_id).filter(Boolean))] as string[];

  const [{ data: categories }, { data: areaLinks }] = await Promise.all([
    categoryIds.length
      ? supabase.from("categories").select("*").in("id", categoryIds)
      : Promise.resolve({ data: [] as Category[] }),
    supabase
      .from("vendor_service_areas")
      .select("vendor_id, locations(*)")
      .in("vendor_id", vendorIds),
  ]);

  const categoryById = new Map((categories ?? []).map((c) => [c.id, c]));
  const areasByVendor = new Map<string, Location[]>();
  for (const link of (areaLinks ?? []) as unknown as { vendor_id: string; locations: Location | null }[]) {
    if (!link.locations) continue;
    const list = areasByVendor.get(link.vendor_id) ?? [];
    list.push(link.locations);
    areasByVendor.set(link.vendor_id, list);
  }

  return vendors.map((v) => ({
    ...v,
    primary_category: v.primary_category_id ? categoryById.get(v.primary_category_id) ?? null : null,
    service_areas: areasByVendor.get(v.id) ?? [],
  }));
}

/** §8 — vendors for a category page, ranked by the transparent weighted score. */
export async function getVendorsByCategory(categoryId: string, limit = 30): Promise<VendorWithRelations[]> {
  const supabase = await createClient();

  const { data: links } = await supabase
    .from("vendor_categories")
    .select("vendor_id")
    .eq("category_id", categoryId);

  const vendorIds = (links ?? []).map((l) => l.vendor_id);
  if (vendorIds.length === 0) return [];

  const { data: vendors } = await supabase
    .from("vendors")
    .select("*")
    .in("id", vendorIds)
    .eq("is_active", true)
    .limit(limit);

  return rankAndAttach(vendors ?? [], 1);
}

/**
 * §8 — vendors serving a specific category AND location. Joins through
 * vendor_categories and vendor_service_areas (intersection, computed in
 * application code — fine at MVP scale; move to a Postgres RPC/view if this
 * becomes a bottleneck at higher vendor counts).
 */
export async function getVendorsByCategoryAndLocation(
  categoryId: string,
  locationId: string,
  limit = 30
): Promise<VendorWithRelations[]> {
  const supabase = await createClient();

  const [{ data: categoryLinks }, { data: areaLinks }] = await Promise.all([
    supabase.from("vendor_categories").select("vendor_id").eq("category_id", categoryId),
    supabase.from("vendor_service_areas").select("vendor_id").eq("location_id", locationId),
  ]);

  const categoryVendorIds = new Set((categoryLinks ?? []).map((l) => l.vendor_id));
  const areaVendorIds = new Set((areaLinks ?? []).map((l) => l.vendor_id));
  const intersection = [...categoryVendorIds].filter((id) => areaVendorIds.has(id));

  if (intersection.length === 0) return [];

  const { data: vendors } = await supabase
    .from("vendors")
    .select("*")
    .in("id", intersection)
    .eq("is_active", true)
    .limit(limit);

  // Vendors explicitly serving this exact location get full relevance (1.0);
  // this function only returns exact matches, so relevance is always 1 here.
  return rankAndAttach(vendors ?? [], 1);
}

async function rankAndAttach(vendors: Vendor[], relevance: number): Promise<VendorWithRelations[]> {
  if (vendors.length === 0) return [];
  const supabase = await createClient();

  const vendorIds = vendors.map((v) => v.id);
  const [{ data: imageCounts }, { data: replyCounts }] = await Promise.all([
    supabase.from("vendor_images").select("vendor_id").in("vendor_id", vendorIds).eq("type", "gallery"),
    supabase.from("forum_replies").select("vendor_id").in("vendor_id", vendorIds).eq("is_vendor_reply", true),
  ]);

  const galleryCountByVendor = new Map<string, number>();
  for (const row of imageCounts ?? []) {
    galleryCountByVendor.set(row.vendor_id, (galleryCountByVendor.get(row.vendor_id) ?? 0) + 1);
  }
  const replyCountByVendor = new Map<string, number>();
  for (const row of replyCounts ?? []) {
    if (!row.vendor_id) continue;
    replyCountByVendor.set(row.vendor_id, (replyCountByVendor.get(row.vendor_id) ?? 0) + 1);
  }

  const ranked = sortVendorsByRanking(
    vendors.map((vendor) => ({
      vendor,
      galleryImageCount: galleryCountByVendor.get(vendor.id) ?? 0,
      forumReplyCount: replyCountByVendor.get(vendor.id) ?? 0,
      serviceAreaRelevance: relevance,
    }))
  );

  return attachListingRelations(ranked.map((r) => r.vendor));
}

/** §7 — full vendor profile with all relations for the vendor page. */
export async function getVendorBySlugWithFullRelations(slug: string): Promise<
  | (VendorWithRelations & {
      categories: Category[];
      visibleReviews: Review[];
    })
  | null
> {
  const supabase = await createClient();

  const { data: vendor } = await supabase
    .from("vendors")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!vendor) return null;

  const [
    { data: categoryLinks },
    { data: areaLinks },
    { data: images },
    { data: services },
    { data: reviews },
  ] = await Promise.all([
    supabase.from("vendor_categories").select("is_primary, categories(*)").eq("vendor_id", vendor.id),
    supabase.from("vendor_service_areas").select("locations(*)").eq("vendor_id", vendor.id),
    supabase
      .from("vendor_images")
      .select("*")
      .eq("vendor_id", vendor.id)
      .order("sort_order"),
    supabase.from("vendor_services").select("*").eq("vendor_id", vendor.id).eq("is_active", true),
    supabase
      .from("reviews")
      .select("*")
      .eq("vendor_id", vendor.id)
      .eq("status", "visible")
      .order("created_at", { ascending: false }),
  ]);

  const categoryRows = (categoryLinks ?? []) as unknown as { is_primary: boolean; categories: Category }[];
  const categories = categoryRows.map((c) => c.categories).filter(Boolean);
  const primaryCategory =
    categoryRows.find((c) => c.is_primary)?.categories ??
    (vendor.primary_category_id ? categories.find((c) => c.id === vendor.primary_category_id) : null) ??
    null;

  const serviceAreas = ((areaLinks ?? []) as unknown as { locations: Location | null }[])
    .map((a) => a.locations)
    .filter((l): l is Location => !!l);

  return {
    ...vendor,
    primary_category: primaryCategory,
    categories,
    service_areas: serviceAreas,
    images: (images ?? []) as VendorImage[],
    services: (services ?? []) as VendorService[],
    visibleReviews: (reviews ?? []) as Review[],
  };
}

/** Vendors related to the given vendor's primary category, excluding itself — for "related vendors". */
export async function getRelatedVendors(vendor: Vendor, limit = 3): Promise<VendorWithRelations[]> {
  if (!vendor.primary_category_id) return [];
  const supabase = await createClient();

  const { data: links } = await supabase
    .from("vendor_categories")
    .select("vendor_id")
    .eq("category_id", vendor.primary_category_id)
    .neq("vendor_id", vendor.id);

  const vendorIds = (links ?? []).map((l) => l.vendor_id);
  if (vendorIds.length === 0) return [];

  const { data: vendors } = await supabase
    .from("vendors")
    .select("*")
    .in("id", vendorIds)
    .eq("is_active", true)
    .limit(limit);

  return attachListingRelations(vendors ?? []);
}
