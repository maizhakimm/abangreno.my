import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ServiceManager from "@/components/vendor/ServiceManager";

export default async function DashboardServicesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: vendor } = await supabase.from("vendors").select("id").eq("user_id", user.id).maybeSingle();
  const { data: services } = vendor
    ? await supabase.from("vendor_services").select("*").eq("vendor_id", vendor.id).order("created_at")
    : { data: [] };

  return (
    <div className="rounded-card bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold">Servis Ditawarkan</h1>
      <ServiceManager initialServices={services ?? []} />
    </div>
  );
}
