import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: vendor } = await supabase
    .from("vendors")
    .select("business_name, slug, verification_status, profile_completeness, avg_rating, total_reviews")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!vendor) {
    return (
      <div className="rounded-card bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold">Anda belum mempunyai profil vendor</h1>
        <p className="mt-2 text-sm text-charcoal/70">
          Daftarkan perniagaan anda untuk mula menerima pertanyaan pelanggan.
        </p>
        <Link
          href="/daftar-vendor"
          className="focus-ring mt-4 inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Daftar Vendor
        </Link>
      </div>
    );
  }

  const stats = [
    { label: "Status Pengesahan", value: vendor.verification_status },
    { label: "Kelengkapan Profil", value: `${vendor.profile_completeness}%` },
    { label: "Rating Purata", value: vendor.avg_rating.toFixed(1) },
    { label: "Jumlah Ulasan", value: vendor.total_reviews },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold">Selamat Kembali, {vendor.business_name}</h1>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-card bg-white p-4 shadow-sm">
            <p className="text-xs text-charcoal/50">{stat.label}</p>
            <p className="mt-1 text-lg font-bold capitalize">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <Link href={`/vendor/${vendor.slug}`} className="text-sm font-semibold text-brand hover:underline">
          Lihat profil awam anda →
        </Link>
      </div>
    </div>
  );
}
