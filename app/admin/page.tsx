import { redirect } from "next/navigation";
import { checkAdminAuth } from "@/lib/auth/admin";

export default async function AdminOverviewPage() {
  const auth = await checkAdminAuth();
  if (!auth.ok) {
    redirect(auth.reason === "unauthenticated" ? "/login" : "/");
  }
  const supabase = auth.supabase;

  const [
    { count: totalVendors },
    { count: verifiedVendors },
    { count: pendingVerifications },
    { count: forumPosts },
    { count: pendingReports },
    { count: reviews },
  ] = await Promise.all([
    supabase.from("vendors").select("id", { count: "exact", head: true }),
    supabase.from("vendors").select("id", { count: "exact", head: true }).eq("verification_status", "verified_ssm"),
    supabase.from("vendor_verifications").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("forum_posts").select("id", { count: "exact", head: true }),
    supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("reviews").select("id", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Total Vendors", value: totalVendors ?? 0 },
    { label: "Verified Vendors", value: verifiedVendors ?? 0 },
    { label: "Pending Verifications", value: pendingVerifications ?? 0 },
    { label: "Forum Posts", value: forumPosts ?? 0 },
    { label: "Pending Reports", value: pendingReports ?? 0 },
    { label: "Reviews", value: reviews ?? 0 },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold">Admin Overview</h1>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-card bg-white p-4 shadow-sm">
            <p className="text-xs text-charcoal/50">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
