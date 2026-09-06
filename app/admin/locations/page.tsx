import { redirect } from "next/navigation";
import { checkAdminAuth } from "@/lib/auth/admin";

export default async function AdminLocationsPage() {
  const auth = await checkAdminAuth();
  if (!auth.ok) {
    redirect(auth.reason === "unauthenticated" ? "/login" : "/");
  }
  const supabase = auth.supabase;
  const { data: locations } = await supabase.from("locations").select("*").order("name");

  return (
    <div className="rounded-card bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold">Locations</h1>
      <table className="mt-4 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-black/10 text-xs uppercase text-charcoal/40">
            <th className="py-2">Name</th>
            <th>Slug</th>
            <th>State</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {(locations ?? []).map((l) => (
            <tr key={l.id} className="border-b border-black/5">
              <td className="py-2 font-medium">{l.name}</td>
              <td className="text-charcoal/60">{l.slug}</td>
              <td>{l.state}</td>
              <td className="capitalize">{l.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
