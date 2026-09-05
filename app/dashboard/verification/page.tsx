import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import VerificationUploadForm from "@/components/vendor/VerificationUploadForm";

export default async function DashboardVerificationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id, verification_status")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="rounded-card bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold">Pengesahan SSM</h1>
      <p className="mt-1 text-sm text-charcoal/60">
        Muat naik dokumen SSM dan IC anda untuk mendapatkan lencana &ldquo;SSM Verified&rdquo;.
        Dokumen ini disimpan secara peribadi dan hanya boleh diakses oleh pasukan admin untuk
        semakan.
      </p>

      <p className="mt-3 inline-block rounded-full bg-offwhite px-3 py-1 text-xs font-semibold capitalize">
        Status semasa: {vendor?.verification_status ?? "unverified"}
      </p>

      {vendor && vendor.verification_status !== "verified_ssm" && (
        <VerificationUploadForm vendorId={vendor.id} />
      )}
    </div>
  );
}
