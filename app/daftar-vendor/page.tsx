import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildMetadata } from "@/lib/seo/metadata";
import { createClient } from "@/lib/supabase/server";
import VendorRegistrationGate from "@/components/vendor/VendorRegistrationGate";

export const metadata: Metadata = buildMetadata({
  title: "Daftar Vendor Percuma",
  description:
    "Senaraikan perniagaan renovation atau servis rumah anda di AbangReno.my secara percuma dan capai lebih ramai pelanggan.",
  path: "/daftar-vendor",
});

export default async function VendorRegistrationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/daftar-vendor");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("phone, phone_verified")
    .eq("id", user.id)
    .single();

  const { data: existingVendor } = await supabase
    .from("vendors")
    .select("slug")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingVendor) {
    redirect("/dashboard");
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  const { data: locations } = await supabase.from("locations").select("id, name").order("name");

  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-extrabold">Daftar Vendor Percuma</h1>
      <p className="mt-2 text-sm text-charcoal/70">
        Penyenaraian asas adalah percuma. Pengesahan nombor telefon diperlukan terlebih dahulu.
        Pengesahan SSM adalah pilihan dan boleh dihantar kemudian selepas profil aktif.
      </p>
      <div className="mt-6 rounded-card bg-white p-5 shadow-sm">
        <VendorRegistrationGate
          phoneVerified={profile?.phone_verified ?? false}
          verifiedPhone={profile?.phone ?? null}
          categories={categories ?? []}
          locations={locations ?? []}
        />
      </div>
    </section>
  );
}
