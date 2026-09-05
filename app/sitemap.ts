import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/metadata";
import { createClient } from "@/lib/supabase/server";
import { getValidCategoryLocationPairs } from "@/lib/data/category-locations";

/**
 * §32 / §10 — automated sitemap covering homepage, categories, VALID
 * category/location combinations only (not a full Cartesian product —
 * getValidCategoryLocationPairs only returns pairs backed by at least one
 * active vendor), vendor pages, visible forum threads, and legal pages.
 *
 * Explicitly excluded: /admin, /dashboard, /api, pending/removed forum
 * content, inactive vendors, inactive categories.
 *
 * NOTE: Next.js caps a single sitemap.ts at 50,000 URLs. If the platform
 * grows beyond that, split into per-entity sitemap indexes — the
 * one-query-per-entity-type structure here makes that split straightforward.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/forum`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/daftar-vendor`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/about`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const [{ data: categories }, { data: vendors }, { data: forumPosts }, categoryLocationPairs] =
    await Promise.all([
      supabase.from("categories").select("slug").eq("is_active", true),
      supabase.from("vendors").select("slug, updated_at").eq("is_active", true),
      supabase
        .from("forum_posts")
        .select("slug, category_id, updated_at, categories(slug)")
        .eq("status", "visible"),
      getValidCategoryLocationPairs(),
    ]);

  const categoryPages: MetadataRoute.Sitemap = (categories ?? []).map((c) => ({
    url: `${SITE_URL}/kategori/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Only pairs with at least one active vendor — no Cartesian product.
  const categoryLocationPages: MetadataRoute.Sitemap = categoryLocationPairs.map((pair) => ({
    url: `${SITE_URL}/kategori/${pair.categorySlug}/${pair.locationSlug}`,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const vendorPages: MetadataRoute.Sitemap = (vendors ?? []).map((v) => ({
    url: `${SITE_URL}/vendor/${v.slug}`,
    lastModified: v.updated_at,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  type ForumPostRow = { slug: string; updated_at: string; categories: { slug: string } | null };
  const forumThreadPages: MetadataRoute.Sitemap = ((forumPosts ?? []) as unknown as ForumPostRow[])
    .filter((p) => p.categories?.slug)
    .map((p) => ({
      url: `${SITE_URL}/forum/${p.categories!.slug}/${p.slug}`,
      lastModified: p.updated_at,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));

  return [
    ...staticPages,
    ...categoryPages,
    ...categoryLocationPages,
    ...vendorPages,
    ...forumThreadPages,
  ];
}
