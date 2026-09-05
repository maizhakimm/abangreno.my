import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Location } from "@/types/database";

/**
 * §8 / §10 — returns only locations that actually have at least one active
 * vendor serving this category. This is what both the category page's
 * "Pilih Lokasi" links AND the sitemap generator use, so we never link to
 * (or index) a thin, empty category/location combination.
 */
export async function getRelatedLocationsForCategory(categoryId: string, limit = 12): Promise<Location[]> {
  const supabase = await createClient();

  const { data: categoryVendorLinks } = await supabase
    .from("vendor_categories")
    .select("vendor_id")
    .eq("category_id", categoryId);

  const vendorIds = (categoryVendorLinks ?? []).map((l) => l.vendor_id);
  if (vendorIds.length === 0) return [];

  const { data: activeVendors } = await supabase
    .from("vendors")
    .select("id")
    .in("id", vendorIds)
    .eq("is_active", true);

  const activeVendorIds = (activeVendors ?? []).map((v) => v.id);
  if (activeVendorIds.length === 0) return [];

  const { data: areaLinks } = await supabase
    .from("vendor_service_areas")
    .select("location_id, locations(*)")
    .in("vendor_id", activeVendorIds);

  const seen = new Map<string, Location>();
  for (const link of (areaLinks ?? []) as unknown as { location_id: string; locations: Location | null }[]) {
    if (link.locations && !seen.has(link.location_id)) {
      seen.set(link.location_id, link.locations);
    }
  }

  return [...seen.values()].slice(0, limit);
}

/**
 * §10 — every (category, location) pair that has at least one active vendor.
 * Used exclusively by app/sitemap.ts to avoid a Cartesian product of every
 * category × every location.
 */
export async function getValidCategoryLocationPairs(): Promise<
  { categorySlug: string; locationSlug: string }[]
> {
  const supabase = await createClient();

  const { data: vendorCategoryVendors } = await supabase
    .from("vendor_categories")
    .select("vendor_id, categories(slug, is_active), vendors!inner(is_active)")
    .eq("vendors.is_active", true);

  type VCRow = {
    vendor_id: string;
    categories: { slug: string; is_active: boolean } | null;
  };

  const vendorToCategories = new Map<string, string[]>();
  for (const row of (vendorCategoryVendors ?? []) as unknown as VCRow[]) {
    if (!row.categories?.is_active) continue;
    const list = vendorToCategories.get(row.vendor_id) ?? [];
    list.push(row.categories.slug);
    vendorToCategories.set(row.vendor_id, list);
  }

  const vendorIds = [...vendorToCategories.keys()];
  if (vendorIds.length === 0) return [];

  const { data: areaLinks } = await supabase
    .from("vendor_service_areas")
    .select("vendor_id, locations(slug)")
    .in("vendor_id", vendorIds);

  type AreaRow = { vendor_id: string; locations: { slug: string } | null };

  const pairSet = new Set<string>();
  for (const link of (areaLinks ?? []) as unknown as AreaRow[]) {
    if (!link.locations) continue;
    const categorySlugs = vendorToCategories.get(link.vendor_id) ?? [];
    for (const categorySlug of categorySlugs) {
      pairSet.add(`${categorySlug}::${link.locations.slug}`);
    }
  }

  return [...pairSet].map((pair) => {
    const [categorySlug, locationSlug] = pair.split("::");
    return { categorySlug, locationSlug };
  });
}
