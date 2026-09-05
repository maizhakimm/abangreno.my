import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata, categoryLocationTitle } from "@/lib/seo/metadata";
import { categoryCollectionJsonLd, faqJsonLd } from "@/lib/seo/jsonLd";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import VendorCard from "@/components/vendor/VendorCard";
import { getCategoryBySlug } from "@/lib/data/categories";
import { getLocationBySlug, getRelatedLocations } from "@/lib/data/locations";
import { getVendorsByCategoryAndLocation } from "@/lib/data/vendors";

export const revalidate = 3600; // ISR

interface PageProps {
  params: Promise<{ kategoriSlug: string; lokasiSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { kategoriSlug, lokasiSlug } = await params;
  const [category, location] = await Promise.all([
    getCategoryBySlug(kategoriSlug),
    getLocationBySlug(lokasiSlug),
  ]);
  if (!category || !location) return {};

  return buildMetadata({
    title: categoryLocationTitle(category.name, location.name),
    description: `Cari dan bandingkan vendor ${category.name.toLowerCase()} di ${location.name} yang telah disemak dan diulas oleh pelanggan sebenar.`,
    path: `/kategori/${kategoriSlug}/${lokasiSlug}`,
  });
}

export default async function CategoryLocationPage({ params }: PageProps) {
  const { kategoriSlug, lokasiSlug } = await params;
  const [category, location] = await Promise.all([
    getCategoryBySlug(kategoriSlug),
    getLocationBySlug(lokasiSlug),
  ]);
  if (!category || !location) notFound();

  const [vendors, relatedLocations] = await Promise.all([
    getVendorsByCategoryAndLocation(category.id, location.id),
    getRelatedLocations(location),
  ]);

  // §8 — category-aware short-answer copy. Built from the category's own
  // description rather than a fixed plumbing-specific sentence, so it never
  // says something false for e.g. Painting or Waterproofing categories.
  const categoryContext = category.description
    ? category.description.charAt(0).toLowerCase() + category.description.slice(1)
    : `pelbagai servis berkaitan ${category.name.toLowerCase()}`;

  const shortAnswer = `${category.name} di ${location.name} biasanya menawarkan ${categoryContext} Anda boleh membandingkan beberapa vendor berdekatan sebelum membuat pilihan.`;

  const faqs = [
    {
      question: `Berapa lama masa yang diambil untuk ${category.name.toLowerCase()} sampai ke lokasi di ${location.name}?`,
      answer:
        "Kebanyakan vendor tempatan boleh sampai dalam masa 1-2 jam untuk kes kecemasan, bergantung kepada jarak dan waktu panggilan.",
    },
    {
      question: `Adakah vendor di ${location.name} ini disahkan SSM?`,
      answer:
        "Sesetengah vendor memaparkan lencana SSM Verified selepas dokumen perniagaan mereka disemak oleh pasukan AbangReno. Sentiasa semak status ini pada profil vendor.",
    },
  ];

  const jsonLd = categoryCollectionJsonLd({
    name: categoryLocationTitle(category.name, location.name),
    description: shortAnswer,
    path: `/kategori/${kategoriSlug}/${lokasiSlug}`,
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
          {
            name: location.name,
            path: `/kategori/${kategoriSlug}/${lokasiSlug}`,
          },
        ]}
      />

      <section className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-extrabold md:text-3xl">
          {categoryLocationTitle(category.name, location.name)}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-charcoal/70">{shortAnswer}</p>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-4">
        <h2 className="text-lg font-bold">
          {vendors.length} Vendor Ditemui di {location.name}
        </h2>
        {vendors.length === 0 ? (
          <p className="mt-4 text-sm text-charcoal/60">
            Belum ada vendor {category.name.toLowerCase()} berdaftar di {location.name} lagi. Semak
            kawasan berdekatan atau semak semula tidak lama lagi.
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
        <h2 className="text-lg font-bold">Cara Memilih Vendor {category.name} yang Sesuai</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-charcoal/70">
          <li>Semak status SSM Verified pada profil vendor.</li>
          <li>Baca ulasan pelanggan sebenar dan lihat rating purata.</li>
          <li>Dapatkan sebut harga daripada 2-3 vendor melalui WhatsApp untuk perbandingan.</li>
          <li>Pastikan kawasan servis vendor meliputi lokasi anda.</li>
        </ul>
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

      {relatedLocations.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <h2 className="text-lg font-bold">Lokasi Berkaitan</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {relatedLocations.map((loc) => (
              <Link
                key={loc.slug}
                href={`/kategori/${kategoriSlug}/${loc.slug}`}
                className="focus-ring rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-medium hover:border-brand hover:text-brand"
              >
                {category.name} di {loc.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
