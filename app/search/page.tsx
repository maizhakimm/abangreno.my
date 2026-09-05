import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildMetadata } from "@/lib/seo/metadata";
import { slugify } from "@/lib/utils/slug";
import HeroSearch from "@/components/search/HeroSearch";

export const metadata: Metadata = buildMetadata({
  title: "Cari Vendor",
  description: "Cari dan bandingkan vendor renovation dan servis rumah di Malaysia.",
  path: "/search",
});

/**
 * §4/§29 — this is an escape hatch, not the primary discovery path.
 * If a category+location combination is present in the query string we
 * redirect straight to the canonical /kategori/[slug]/[lokasi] page so this
 * route never becomes a thin, unindexed duplicate of that content.
 */
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; lokasi?: string }>;
}) {
  const params = await searchParams;
  if (params.q && params.lokasi) {
    redirect(`/kategori/${slugify(params.q)}/${slugify(params.lokasi)}`);
  }
  if (params.q) {
    redirect(`/kategori/${slugify(params.q)}`);
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-2xl font-extrabold">Cari Vendor</h1>
      <p className="mt-2 text-sm text-charcoal/70">
        Pilih servis dan lokasi untuk melihat senarai vendor berdekatan anda.
      </p>
      <div className="mt-6">
        <HeroSearch />
      </div>
    </section>
  );
}
