import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ServiceAreaManager from "@/components/vendor/ServiceAreaManager";

export default async function DashboardServiceAreasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: vendor } = await supabase.from("vendors").select("id").eq("user_id", user.id).maybeSingle();

  const [{ data: allLocations }, { data: currentAreas }] = await Promise.all([
    supabase.from("locations").select("id, name, state").order("name"),
    vendor
      ? supabase.from("vendor_service_areas").select("location_id").eq("vendor_id", vendor.id)
      : Promise.resolve({ data: [] }),
  ]);

  const selectedIds = new Set((currentAreas ?? []).map((a) => a.location_id));

  return (
    <div className="rounded-card bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold">Kawasan Servis</h1>
      <p className="mt-1 text-sm text-charcoal/60">
        Pilih kawasan yang perniagaan anda liputi. Kawasan ini menentukan halaman kategori +
        lokasi di mana profil anda akan muncul.
      </p>
      {vendor ? (
        <ServiceAreaManager locations={allLocations ?? []} initialSelectedIds={[...selectedIds]} />
      ) : (
        <p className="mt-4 text-sm text-charcoal/60">Tiada profil vendor ditemui.</p>
      )}
    </div>
  );
}
