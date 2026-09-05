import { createClient } from "@/lib/supabase/server";

export default async function AdminVendorsPage() {
  const supabase = await createClient();
  const { data: vendors } = await supabase
    .from("vendors")
    .select("id, business_name, slug, verification_status, is_active, total_reviews, avg_rating")
    .order("created_at", { ascending: false });

  return (
    <div className="rounded-card bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold">Vendors</h1>
      <table className="mt-4 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-black/10 text-xs uppercase text-charcoal/40">
            <th className="py-2">Nama</th>
            <th>Status</th>
            <th>Aktif</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          {(vendors ?? []).map((v) => (
            <tr key={v.id} className="border-b border-black/5">
              <td className="py-2 font-medium">{v.business_name}</td>
              <td className="capitalize">{v.verification_status}</td>
              <td>{v.is_active ? "Ya" : "Tidak"}</td>
              <td>
                {v.avg_rating.toFixed(1)} ({v.total_reviews})
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
