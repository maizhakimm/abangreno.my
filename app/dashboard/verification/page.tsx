import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import VerificationUploadForm from "@/components/vendor/VerificationUploadForm";
import { SSM_VERIFIED_DISCLAIMER } from "@/components/vendor/VerifiedBadge";
import type { VerificationStatus } from "@/types/database";

const STATUS_LABELS: Record<VerificationStatus, { label: string; className: string }> = {
  unverified: { label: "Belum Disahkan", className: "bg-offwhite text-charcoal/70" },
  pending: { label: "Menunggu Semakan", className: "bg-amber-100 text-amber-800" },
  verified_ssm: { label: "Disahkan SSM ✓", className: "bg-green-100 text-green-800" },
  rejected: { label: "Ditolak", className: "bg-red-100 text-red-700" },
};

function asVerificationStatus(value: unknown): VerificationStatus {
  return value === "pending" || value === "verified_ssm" || value === "rejected"
    ? value
    : "unverified";
}

export default async function DashboardVerificationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: vendor } = await supabase.from("vendors").select("id, verification_status").eq("user_id", user.id).maybeSingle();
  const status = asVerificationStatus(vendor?.verification_status);
  const statusInfo = STATUS_LABELS[status];
  const canSubmit = status === "unverified" || status === "rejected";

  return (
    <div className="rounded-card bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold">Pengesahan SSM</h1>
      <p className="mt-1 text-sm text-charcoal/60">
        Pengesahan SSM adalah pilihan untuk penyenaraian Tier 1 asas, tetapi diperlukan untuk mendapat lencana &ldquo;Disahkan SSM&rdquo;. Muat naik dokumen SSM dan IC anda untuk semakan admin. Dokumen ini disimpan secara peribadi dan hanya boleh diakses oleh pasukan admin untuk tujuan semakan.
      </p>
      <p className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.className}`}>Status semasa: {statusInfo.label}</p>
      {status === "verified_ssm" && <p className="mt-3 text-xs text-charcoal/50">{SSM_VERIFIED_DISCLAIMER}</p>}
      {status === "pending" && <p className="mt-3 text-sm text-charcoal/70">Dokumen anda sedang disemak oleh pasukan admin.</p>}
      {status === "rejected" && <p className="mt-3 text-sm text-red-700">Permohonan sebelum ini tidak diluluskan. Sila semak semula dokumen anda dan hantar permohonan baharu di bawah.</p>}
      {vendor && canSubmit && <VerificationUploadForm vendorId={vendor.id} />}
    </div>
  );
}
