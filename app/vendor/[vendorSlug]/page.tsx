import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo/metadata";
import { vendorJsonLd, breadcrumbListJsonLd } from "@/lib/seo/jsonLd";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import VerifiedBadge, { SSM_VERIFIED_DISCLAIMER } from "@/components/vendor/VerifiedBadge";
import WhatsAppButton from "@/components/vendor/WhatsAppButton";
import ReportButton from "@/components/vendor/ReportButton";
import VendorCard from "@/components/vendor/VendorCard";
import { getVendorBySlugWithFullRelations, getRelatedVendors } from "@/lib/data/vendors";

export const revalidate = 3600;

interface PageProps { params: Promise<{ vendorSlug: string }>; }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { vendorSlug } = await params;
  const vendor = await getVendorBySlugWithFullRelations(vendorSlug);
  if (!vendor) return {};
  return buildMetadata({
    title: vendor.business_name,
    description: vendor.description?.slice(0, 155) ?? `Profil vendor ${vendor.business_name} di AbangReno.my`,
    path: `/vendor/${vendorSlug}`,
    imageUrl: vendor.profile_picture_url ?? undefined,
  });
}

export default async function VendorProfilePage({ params }: PageProps) {
  const { vendorSlug } = await params;
  const vendor = await getVendorBySlugWithFullRelations(vendorSlug);
  if (!vendor) notFound();
  const relatedVendors = await getRelatedVendors(vendor, 3);
  const jsonLd = vendorJsonLd(vendor, vendor.primary_category, vendor.service_areas);
  const breadcrumbCategoryName = vendor.primary_category?.name ?? "Vendor";
  const breadcrumbCategorySlug = vendor.primary_category?.slug ?? "";
  const breadcrumbs = breadcrumbListJsonLd([
    { name: "Utama", path: "/" },
    ...(breadcrumbCategorySlug ? [{ name: breadcrumbCategoryName, path: `/kategori/${breadcrumbCategorySlug}` }] : []),
    { name: vendor.business_name, path: `/vendor/${vendor.slug}` },
  ]);
  const galleryImages = (vendor.images ?? []).filter((img) => img.type === "gallery");
  const beforeAfterImages = (vendor.images ?? []).filter((img) => img.type === "before" || img.type === "after");

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <Breadcrumbs items={[
        { name: "Utama", path: "/" },
        ...(breadcrumbCategorySlug ? [{ name: breadcrumbCategoryName, path: `/kategori/${breadcrumbCategorySlug}` }] : []),
        { name: vendor.business_name, path: `/vendor/${vendor.slug}` },
      ]} />

      <section className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-light text-2xl font-bold text-brand-dark">
            {vendor.profile_picture_url ? (
              <Image src={vendor.profile_picture_url} alt={`${vendor.business_name} logo`} fill sizes="80px" className="object-cover" priority />
            ) : vendor.business_name.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold">{vendor.business_name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
              {vendor.verification_status === "verified_ssm" && <VerifiedBadge />}
              {vendor.total_reviews > 0 && <span>⭐ {vendor.avg_rating.toFixed(1)} ({vendor.total_reviews} ulasan)</span>}
              {breadcrumbCategorySlug && <Link href={`/kategori/${breadcrumbCategorySlug}`} className="text-brand hover:underline">{breadcrumbCategoryName}</Link>}
            </div>
            {(vendor.service_areas?.length ?? 0) > 0 && <p className="mt-1 text-sm text-charcoal/60">Kawasan servis: {(vendor.service_areas ?? []).map((a) => a.name).join(", ")}</p>}
          </div>
          {vendor.whatsapp && <WhatsAppButton phone={vendor.whatsapp} message={`Hi ${vendor.business_name}, saya jumpa perniagaan anda di AbangReno.my`} className="w-full sm:w-auto" />}
        </div>

        {vendor.verification_status === "verified_ssm" && <p className="mt-3 text-xs text-charcoal/50">{SSM_VERIFIED_DISCLAIMER}</p>}
        {vendor.description && <div className="mt-8"><h2 className="text-lg font-bold">Tentang Perniagaan</h2><p className="mt-2 text-sm leading-relaxed text-charcoal/70">{vendor.description}</p></div>}

        {vendor.categories.length > 1 && (
          <div className="mt-6"><h2 className="text-sm font-bold text-charcoal/60">Kategori Lain</h2><div className="mt-2 flex flex-wrap gap-2">{vendor.categories.filter((c) => c.slug !== breadcrumbCategorySlug).map((c) => <Link key={c.id} href={`/kategori/${c.slug}`} className="rounded-full bg-offwhite px-3 py-1 text-xs font-medium hover:text-brand">{c.name}</Link>)}</div></div>
        )}

        {(vendor.services?.length ?? 0) > 0 && (
          <div className="mt-8"><h2 className="text-lg font-bold">Servis Ditawarkan</h2><ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">{(vendor.services ?? []).map((service) => <li key={service.id} className="rounded-card border border-black/5 bg-white p-3 text-sm"><p className="font-semibold">{service.title}</p>{service.price_from != null && <p className="text-charcoal/60">Bermula RM{service.price_from} {service.price_unit ?? ""}</p>}</li>)}</ul></div>
        )}

        {galleryImages.length > 0 && (
          <div className="mt-8"><h2 className="text-lg font-bold">Galeri</h2><div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">{galleryImages.map((img) => <div key={img.id} className="relative aspect-square overflow-hidden rounded-lg"><Image src={img.image_url} alt={img.caption ?? vendor.business_name} fill sizes="(max-width: 640px) 33vw, 220px" className="object-cover" /></div>)}</div></div>
        )}

        {beforeAfterImages.length > 0 && (
          <div className="mt-8"><h2 className="text-lg font-bold">Before / After</h2><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{beforeAfterImages.map((img) => <div key={img.id} className="relative aspect-square overflow-hidden rounded-lg"><Image src={img.image_url} alt={img.caption ?? `${img.type} — ${vendor.business_name}`} fill sizes="(max-width: 640px) 50vw, 220px" className="object-cover" /><span className="absolute left-2 top-2 rounded-full bg-charcoal/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">{img.type === "before" ? "Sebelum" : "Selepas"}</span></div>)}</div></div>
        )}

        <div className="mt-8"><h2 className="text-lg font-bold">Ulasan Pelanggan</h2>{vendor.visibleReviews.length === 0 ? <p className="mt-2 text-sm text-charcoal/60">Belum ada ulasan lagi.</p> : <div className="mt-3 space-y-3">{vendor.visibleReviews.map((review) => <div key={review.id} className="rounded-card border border-black/5 bg-white p-4"><p className="text-sm font-semibold">{"⭐".repeat(review.rating)}</p>{review.comment && <p className="mt-1 text-sm text-charcoal/70">{review.comment}</p>}{review.vendor_reply && <div className="mt-3 rounded-lg bg-offwhite p-3 text-sm"><p className="text-xs font-semibold text-charcoal/60">Balasan Vendor:</p><p className="mt-1 text-charcoal/70">{review.vendor_reply}</p></div>}</div>)}</div>}</div>

        {relatedVendors.length > 0 && <div className="mt-10"><h2 className="text-lg font-bold">Vendor Berkaitan</h2><div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">{relatedVendors.map((v) => <VendorCard key={v.id} vendor={v} />)}</div></div>}

        <div className="mt-10 flex items-center justify-between border-t border-black/10 pt-6">
          {breadcrumbCategorySlug ? <Link href={`/kategori/${breadcrumbCategorySlug}`} className="text-sm text-brand hover:underline">← Kembali ke senarai {breadcrumbCategoryName}</Link> : <span />}
          <ReportButton targetType="vendor" targetId={vendor.id} />
        </div>
      </section>
    </div>
  );
}
