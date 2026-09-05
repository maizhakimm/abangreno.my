import { createClient } from "@/lib/supabase/server";

export default async function AdminReportsPage() {
  const supabase = await createClient();
  const { data: reports } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="rounded-card bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold">Reports</h1>
      <div className="mt-5 space-y-3">
        {(reports ?? []).length === 0 && <p className="text-sm text-charcoal/60">No reports.</p>}
        {(reports ?? []).map((r) => (
          <div key={r.id} className="rounded-lg border border-black/5 p-4 text-sm">
            <p className="font-semibold capitalize">
              {r.target_type} — {r.reason}
            </p>
            {r.details && <p className="mt-1 text-charcoal/60">{r.details}</p>}
            <p className="mt-1 text-xs text-charcoal/40">status: {r.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
