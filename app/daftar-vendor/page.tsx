import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildMetadata } from "@/lib/seo/metadata";
import { isEmailVerified } from "@/lib/auth/email";
import { createClient } from "@/lib/supabase/server";
import VendorRegistrationForm from "@/components/vendor/VendorRegistrationForm";
import UnverifiedEmailNotice from "@/components/auth/UnverifiedEmailNotice";

export const metadata: Metadata = buildMetadata({
  title: "Daftar Vendor Percuma",
  description:
    "Senaraikan perniagaan renovation atau servis rumah anda di AbangReno.my secara percuma dan capai lebih ramai pelanggan.",
  path: "/daftar-vendor",
});

export default async function VendorRegistrationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/daftar-vendor");

  const { data: existingVendor } = await supabase.from("vendors").select("slug").eq("user_id", user.id).maybeSingle();
  if (existingVendor) redirect("/dashboard");

  const { data: categories } = await supabase.from("categories").select("id, name").eq("is_active", true).order("name");
  const { data: locations } = await supabase.from("locations").select("id, name").order("name");

  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-extrabold">Daftar Vendor Percuma</h1>
      <p className="mt-2 text-sm text-charcoal/70">
        Penyenaraian asas adalah percuma. Pengesahan SSM adalah pilihan dan boleh dihantar kemudian selepas profil aktif untuk mendapatkan lencana &ldquo;Disahkan SSM&rdquo;.
      </p>
      <div className="mt-6 rounded-card bg-white p-5 shadow-sm">
        {isEmailVerified(user) ? (
          <VendorRegistrationForm categories={categories ?? []} locations={locations ?? []} />
        ) : (
          <UnverifiedEmailNotice email={user.email ?? null} />
        )}
      </div>
    </section>
  );
}
