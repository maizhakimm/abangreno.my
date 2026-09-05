import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata, categoryTitle } from "@/lib/seo/metadata";
import { categoryCollectionJsonLd, faqJsonLd } from "@/lib/seo/jsonLd";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import VendorCard from "@/components/vendor/VendorCard";
import { getCategoryBySlug } from "@/lib/data/categories";
import { getVendorsByCategory } from "@/lib/data/vendors";
import { getRelatedLocationsForCategory } from "@/lib/data/category-locations";
import { getRecentForumThreadsForCategory } from "@/lib/data/forum";

export const revalidate = 3600; // ISR

interface PageProps {
  params: Promise<{ kategoriSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { kategoriSlug } = await params;
  const category = await getCategoryBySlug(kategoriSlug);
  if (!category) return {};

  return buildMetadata({
    title: category.seo_title || categoryTitle(category.name),
    description:
      category.seo_description || category.description || `${category.name} berdekatan anda di Malaysia.`,
    path: `/kategori/${kategoriSlug}`,
  });
}

export default async function CategoryPage({ params }: PageProps) {
  const { kategoriSlug } = await params;
  const category = await getCategoryBySlug(kategoriSlug);
  if (!category) notFound();

  const [vendors, relatedLocations, forumThreads] = await Promise.all([
    getVendorsByCategory(category.id),
    getRelatedLocationsForCategory(category.id),
    getRecentForumThreadsForCategory(category.id, 3),
  ]);

  // §8 — category-aware FAQ copy generated from the category's own name,
  // never hardcoded plumbing-specific language.
  const faqs = [
    {
      question: `Berapa kos purata untuk ${category.name.toLowerCase()} di Malaysia?`,
      answer:
        "Kos bergantung kepada skop kerja dan lokasi. Dapatkan sebut harga percuma daripada beberapa vendor melalui WhatsApp untuk perbandingan tepat.",
    },
    {
      question: `Bagaimana saya tahu vendor ${category.name.toLowerCase()} ini boleh dipercayai?`,
      answer:
        "Semak status SSM Verified, bilangan ulasan pelanggan sebenar dan rating vendor sebelum membuat keputusan.",
    },
  ];

  const jsonLd = categoryCollectionJsonLd({
    name: categoryTitle(category.name),
    description: category.description ?? `${category.name} berdekatan anda di Malaysia.`,
    path: `/kategori/${kategoriSlug}`,
    vendorSlugs: vendors.map((v) => v.slug),
  });
  const faqSchema = faqJsonLd(faqs);

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

      <Breadcrumbs
        items={[
          { name: "Utama", path: "/" },
          { name: category.name, path: `/kategori/${kategoriSlug}` },
        ]}
      />

      <section className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-extrabold md:text-3xl">{categoryTitle(category.name)}</h1>
        {category.description && (
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-charcoal/70">
            {category.description}
          </p>
        )}
      </section>

      {relatedLocations.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-4">
          <h2 className="text-sm font-bold text-charcoal/70">Pilih Lokasi</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {relatedLocations.map((loc) => (
              <Link
                key={loc.slug}
                href={`/kategori/${kategoriSlug}/${loc.slug}`}
                className="focus-ring rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-medium hover:border-brand hover:text-brand"
              >
                {loc.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-6">
        <h2 className="text-lg font-bold">
          Vendor {category.name} ({vendors.length})
        </h2>
        {vendors.length === 0 ? (
          <p className="mt-4 text-sm text-charcoal/60">
            Belum ada vendor berdaftar untuk kategori ini lagi. Semak semula tidak lama lagi.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="text-lg font-bold">Soalan Lazim</h2>
        <div className="mt-4 space-y-4">
          {faqs.map((faq) => (
            <div key={faq.question}>
              <p className="font-semibold">{faq.question}</p>
              <p className="mt-1 text-sm text-charcoal/70">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {forumThreads.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <h2 className="text-lg font-bold">Soalan Forum Berkaitan</h2>
          <ul className="mt-3 space-y-2">
            {forumThreads.map((thread) => (
              <li key={thread.id}>
                <Link
                  href={`/forum/${kategoriSlug}/${thread.slug}`}
                  className="text-sm font-medium text-brand hover:underline"
                >
                  {thread.title}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={`/forum/${kategoriSlug}`}
            className="mt-3 inline-block text-sm font-semibold text-brand"
          >
            Lihat semua soalan forum {category.name} →
          </Link>
        </section>
      )}
    </div>
  );
}
