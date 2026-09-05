import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo/metadata";
import HeroSearch from "@/components/search/HeroSearch";
import VendorCard from "@/components/vendor/VendorCard";
import { getPopularCategories } from "@/lib/data/categories";
import { getPopularLocations } from "@/lib/data/locations";
import { createClient } from "@/lib/supabase/server";
import { sortVendorsByRanking } from "@/lib/ranking/vendorRanking";
import type { Category, Location, VendorWithRelations } from "@/types/database";

export const revalidate = 3600; // ISR: homepage refreshes hourly

export const metadata: Metadata = buildMetadata({
  title: "Cari Tukang & Servis Renovation Berdekatan Anda",
  description:
    "Bandingkan vendor renovation, repair dan maintenance di kawasan anda. Direktori vendor renovation Malaysia yang dipercayai.",
  path: "/",
});

async function getFeaturedVendors(limit = 6): Promise<VendorWithRelations[]> {
  const supabase = await createClient();
  const { data: vendors } = await supabase
    .from("vendors")
    .select("*")
    .eq("is_active", true)
    .order("avg_rating", { ascending: false })
    .limit(limit * 2); // over-fetch a bit before ranking/truncating

  if (!vendors || vendors.length === 0) return [];

  const ranked = sortVendorsByRanking(
    vendors.map((vendor) => ({
      vendor,
      galleryImageCount: 0,
      forumReplyCount: 0,
      serviceAreaRelevance: 1,
    }))
  ).slice(0, limit);

  const categoryIds = [...new Set(ranked.map((r) => r.vendor.primary_category_id).filter(Boolean))] as string[];
  const vendorIds = ranked.map((r) => r.vendor.id);

  const [{ data: categories }, { data: areaLinks }] = await Promise.all([
    categoryIds.length
      ? supabase.from("categories").select("*").in("id", categoryIds)
      : Promise.resolve({ data: [] as Category[] }),
    supabase.from("vendor_service_areas").select("vendor_id, locations(*)").in("vendor_id", vendorIds),
  ]);

  const categoryById = new Map((categories ?? []).map((c) => [c.id, c]));
  const areasByVendor = new Map<string, Location[]>();
  for (const link of (areaLinks ?? []) as unknown as { vendor_id: string; locations: Location | null }[]) {
    if (!link.locations) continue;
    const list = areasByVendor.get(link.vendor_id) ?? [];
    list.push(link.locations);
    areasByVendor.set(link.vendor_id, list);
  }

  return ranked.map(({ vendor }) => ({
    ...vendor,
    primary_category: vendor.primary_category_id ? categoryById.get(vendor.primary_category_id) ?? null : null,
    service_areas: areasByVendor.get(vendor.id) ?? [],
  }));
}

export default async function HomePage() {
  const [categories, locations, featuredVendors] = await Promise.all([
    getPopularCategories(8),
    getPopularLocations(6),
    getFeaturedVendors(6),
  ]);

  const defaultCategorySlug = categories[0]?.slug ?? "";

  return (
    <div>
      <section className="bg-gradient-to-b from-brand-light/40 to-offwhite px-4 py-14 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">
            Cari Tukang & Servis Renovation Berdekatan Anda
          </h1>
          <p className="mt-4 text-base text-charcoal/70 md:text-lg">
            Bandingkan vendor renovation, repair dan maintenance di kawasan anda.
          </p>
          <div className="mt-8">
            <HeroSearch />
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-xl font-bold">Kategori Popular</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/kategori/${cat.slug}`}
                className="focus-ring rounded-card border border-black/5 bg-white p-4 text-center text-sm font-semibold shadow-sm transition hover:border-brand hover:text-brand"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {locations.length > 0 && defaultCategorySlug && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-xl font-bold">Lokasi Popular</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {locations.map((loc) => (
              <Link
                key={loc.slug}
                href={`/kategori/${defaultCategorySlug}/${loc.slug}`}
                className="focus-ring rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium hover:border-brand hover:text-brand"
              >
                {loc.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {featuredVendors.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Vendor Terpilih</h2>
            {defaultCategorySlug && (
              <Link href={`/kategori/${defaultCategorySlug}`} className="text-sm font-semibold text-brand">
                Lihat semua →
              </Link>
            )}
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredVendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-xl font-bold">Bagaimana Ia Berfungsi</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { title: "1. Cari", body: "Pilih servis dan lokasi yang anda perlukan." },
            { title: "2. Bandingkan", body: "Lihat profil, rating dan ulasan vendor." },
            { title: "3. Hubungi", body: "Hubungi terus melalui WhatsApp untuk sebut harga." },
          ].map((step) => (
            <div key={step.title} className="rounded-card bg-white p-5 shadow-sm">
              <p className="font-bold text-brand">{step.title}</p>
              <p className="mt-1 text-sm text-charcoal/70">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded-card bg-charcoal p-8 text-center text-offwhite">
          <h2 className="text-xl font-bold">Anda seorang kontraktor atau vendor servis?</h2>
          <p className="mt-2 text-white/70">
            Senaraikan perniagaan anda di AbangReno.my secara percuma dan capai lebih ramai
            pelanggan.
          </p>
          <Link
            href="/daftar-vendor"
            className="focus-ring mt-5 inline-block rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Daftar Vendor Percuma
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 text-sm leading-relaxed text-charcoal/70">
        <h2 className="text-xl font-bold text-charcoal">Direktori Vendor Renovation Malaysia</h2>
        <p className="mt-3">
          AbangReno.my membantu anda mencari tukang dan vendor servis rumah yang dipercayai di
          seluruh Malaysia — daripada tukang paip dan waterproofing hingga renovation penuh dan
          pemasangan kabinet dapur. Setiap vendor boleh disemak melalui status SSM Verified,
          rating pelanggan sebenar dan kawasan servis yang jelas, supaya anda boleh membuat
          keputusan dengan yakin sebelum menghubungi mereka.
        </p>
      </section>
    </div>
  );
}
