import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReviewReplyForm from "@/components/vendor/ReviewReplyForm";

export default async function DashboardReviewsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: vendor } = await supabase.from("vendors").select("id").eq("user_id", user.id).maybeSingle();
  const { data: reviews } = vendor
    ? await supabase
        .from("reviews")
        .select("*")
        .eq("vendor_id", vendor.id)
        .eq("status", "visible")
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="rounded-card bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold">Ulasan Pelanggan</h1>
      <div className="mt-5 space-y-3">
        {(reviews ?? []).length === 0 && <p className="text-sm text-charcoal/60">Belum ada ulasan.</p>}
        {(reviews ?? []).map((r) => (
          <div key={r.id} className="rounded-lg border border-black/5 p-4">
            <p className="text-sm font-semibold">{"⭐".repeat(r.rating)}</p>
            {r.comment && <p className="mt-1 text-sm text-charcoal/70">{r.comment}</p>}
            {r.vendor_reply ? (
              <p className="mt-2 rounded bg-offwhite p-2 text-xs text-charcoal/60">
                Balasan anda: {r.vendor_reply}
              </p>
            ) : (
              <ReviewReplyForm reviewId={r.id} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
