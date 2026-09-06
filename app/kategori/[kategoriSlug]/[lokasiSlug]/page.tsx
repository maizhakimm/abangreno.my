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

  const vendors = await getVendorsByCategoryAndLocation(category.id, location.id);
  const metadata = buildMetadata({
    title: categoryLocationTitle(category.name, location.name),
    description: `Cari vendor ${category.name.toLowerCase()} di ${location.name}. Bandingkan profil, kawasan servis, rating dan ulasan yang tersedia sebelum menghubungi vendor.`,
    path: `/kategori/${kategoriSlug}/${lokasiSlug}`,
  });

  // The route remains useful for humans as a nearby-location fallback, but
  // empty combinations must not become thin indexable SEO pages.
  if (vendors.length === 0) {
    return {
      ...metadata,
      robots: { index: false, follow: true },
    };
  }

  return metadata;
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

  const categoryContext = category.description
    ? category.description.charAt(0).toLowerCase() + category.description.slice(1)
    : `pelbagai servis berkaitan ${category.name.toLowerCase()}`;

  const shortAnswer = `${category.name} di ${location.name} biasanya merangkumi ${categoryContext} Bandingkan profil vendor, kawasan servis, rating dan ulasan yang tersedia sebelum meminta sebut harga.`;

  const faqs = [
    {
      question: `Bagaimana cara mendapatkan vendor ${category.name.toLowerCase()} di ${location.name}?`,
      answer:
        `Semak vendor yang menyenaraikan ${location.name} sebagai kawasan servis, bandingkan profil dan ulasan yang tersedia, kemudian hubungi beberapa vendor untuk mengesahkan jadual serta mendapatkan sebut harga.`,
    },
    {
      question: `Adakah vendor di ${location.name} ini disahkan SSM?`,
      answer:
        "Vendor yang telah melalui semakan dokumen perniagaan akan memaparkan lencana Disahkan SSM pada profil. Lencana tersebut mengesahkan dokumen yang dikemukakan dan bukan jaminan kualiti kerja.",
    },
  ];

  const jsonLd = categoryCollectionJsonLd({
    name: categoryLocationTitle(category.name, location.name),
    description: shortAnswer,
    path: `/kategori/${kategoriSlug}/${lokasiSlug}`,
    vendorSlugs: vendors.map((v) => v.slug),
  });
  const faqSchema = vendors.length > 0 ? faqJsonLd(faqs) : null;

  return (
    <div>
      {vendors.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
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
        {vendors.length > 0 && (
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-charcoal/70">{shortAnswer}</p>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-4">
        <h2 className="text-lg font-bold">
          {vendors.length} Vendor Ditemui di {location.name}
        </h2>
        {vendors.length === 0 ? (
          <p className="mt-4 text-sm text-charcoal/60">
            Belum ada vendor {category.name.toLowerCase()} yang menyenaraikan {location.name} sebagai
            kawasan servis. Cuba kawasan berdekatan di bawah atau semak semula kemudian.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        )}
      </section>

      {vendors.length > 0 && (
        <>
          <section className="mx-auto max-w-6xl px-4 py-8">
            <h2 className="text-lg font-bold">Cara Memilih Vendor {category.name} yang Sesuai</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-charcoal/70">
              <li>Semak status Disahkan SSM jika tersedia pada profil vendor.</li>
              <li>Baca ulasan pelanggan dan lihat rating purata jika vendor sudah menerima ulasan.</li>
              <li>Dapatkan sebut harga daripada beberapa vendor untuk membuat perbandingan.</li>
              <li>Sahkan terus dengan vendor bahawa alamat anda termasuk dalam kawasan servis mereka.</li>
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
        </>
      )}

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
