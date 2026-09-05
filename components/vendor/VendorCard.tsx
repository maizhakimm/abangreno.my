import Link from "next/link";
import type { VendorWithRelations } from "@/types/database";
import VerifiedBadge from "./VerifiedBadge";
import WhatsAppButton from "./WhatsAppButton";

/** §37 — vendor card: image, name, badge, rating, category, area, short summary, CTA. Nothing more. */
export default function VendorCard({ vendor }: { vendor: VendorWithRelations }) {
  const topArea = vendor.service_areas?.[0]?.name;

  return (
    <div className="flex flex-col rounded-card border border-black/5 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-light text-lg font-bold text-brand-dark">
          {vendor.business_name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <Link
            href={`/vendor/${vendor.slug}`}
            className="focus-ring block truncate font-bold hover:text-brand"
          >
            {vendor.business_name}
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-charcoal/60">
            {vendor.verification_status === "verified_ssm" && <VerifiedBadge size="sm" />}
            {vendor.total_reviews > 0 && (
              <span>
                ⭐ {vendor.avg_rating.toFixed(1)} ({vendor.total_reviews})
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1 text-xs text-charcoal/60">
        {vendor.primary_category?.name && (
          <span className="rounded-full bg-offwhite px-2 py-1">{vendor.primary_category.name}</span>
        )}
        {topArea && <span className="rounded-full bg-offwhite px-2 py-1">{topArea}</span>}
      </div>

      {vendor.description && (
        <p className="mt-3 line-clamp-2 text-sm text-charcoal/70">{vendor.description}</p>
      )}

      <div className="mt-4 flex items-center gap-2">
        {vendor.whatsapp && <WhatsAppButton phone={vendor.whatsapp} className="flex-1" />}
        <Link
          href={`/vendor/${vendor.slug}`}
          className="focus-ring flex-1 rounded-lg border border-black/10 px-3 py-2 text-center text-sm font-semibold hover:border-brand hover:text-brand"
        >
          Lihat Profil
        </Link>
      </div>
    </div>
  );
}
