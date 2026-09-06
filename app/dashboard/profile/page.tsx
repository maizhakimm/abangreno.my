import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import VendorProfileEditForm from "@/components/vendor/VendorProfileEditForm";
import ProfileImageUploader from "@/components/vendor/ProfileImageUploader";

export default async function DashboardProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: vendor } = await supabase.from("vendors")
    .select("id, business_name, phone, whatsapp, description, profile_picture_url")
    .eq("user_id", user.id).maybeSingle();

  return (
    <div className="rounded-card bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold">Profil Perniagaan</h1>
      <p className="mt-1 text-sm text-charcoal/60">Kemas kini maklumat perniagaan anda. Perubahan akan dipaparkan pada profil awam anda.</p>
      {vendor ? (
        <>
          <ProfileImageUploader vendorId={vendor.id} currentUrl={vendor.profile_picture_url} />
          <VendorProfileEditForm vendor={vendor} />
        </>
      ) : (
        <p className="mt-4 text-sm text-charcoal/60">Tiada profil vendor ditemui.</p>
      )}
    </div>
  );
}
