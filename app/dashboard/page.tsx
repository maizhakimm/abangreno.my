import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const MIN_DESCRIPTION_WORDS = 120;
function countWords(text: string | null): number { if (!text) return 0; return text.trim().split(/\s+/).filter(Boolean).length; }

export default async function DashboardOverviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: vendor } = await supabase.from("vendors").select("id, business_name, slug, verification_status, avg_rating, total_reviews, description, phone, whatsapp, profile_picture_url").eq("user_id", user.id).maybeSingle();
  if (!vendor) {
    return <div className="rounded-card bg-white p-8 text-center shadow-sm"><h1 className="text-xl font-bold">Anda belum mempunyai profil vendor</h1><p className="mt-2 text-sm text-charcoal/70">Daftarkan perniagaan anda untuk mula menerima pertanyaan pelanggan.</p><Link href="/daftar-vendor" className="focus-ring mt-4 inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">Daftar Vendor</Link></div>;
  }

  const [{ count: serviceAreaCount }, { count: serviceCount }, { count: galleryCount }] = await Promise.all([
    supabase.from("vendor_service_areas").select("vendor_id", { count: "exact", head: true }).eq("vendor_id", vendor.id),
    supabase.from("vendor_services").select("id", { count: "exact", head: true }).eq("vendor_id", vendor.id),
    supabase.from("vendor_images").select("id", { count: "exact", head: true }).eq("vendor_id", vendor.id).neq("type", "profile"),
  ]);

  const checklist = [
    { label: "Penerangan perniagaan lengkap", done: countWords(vendor.description) >= MIN_DESCRIPTION_WORDS },
    { label: "Nombor telefon", done: !!vendor.phone },
    { label: "Nombor WhatsApp", done: !!vendor.whatsapp },
    { label: "Sekurang-kurangnya satu kawasan servis", done: (serviceAreaCount ?? 0) > 0 },
    { label: "Sekurang-kurangnya satu servis disenaraikan", done: (serviceCount ?? 0) > 0 },
    { label: "Gambar profil / logo", done: !!vendor.profile_picture_url },
    { label: "Gambar galeri / portfolio", done: (galleryCount ?? 0) > 0 },
  ];
  const completedCount = checklist.filter((c) => c.done).length;
  const completenessPercent = Math.round((completedCount / checklist.length) * 100);
  const stats = [
    { label: "Status Pengesahan", value: vendor.verification_status },
    { label: "Kelengkapan Profil", value: `${completenessPercent}%` },
    { label: "Rating Purata", value: vendor.avg_rating.toFixed(1) },
    { label: "Jumlah Ulasan", value: vendor.total_reviews },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold">Selamat Kembali, {vendor.business_name}</h1>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">{stats.map((stat) => <div key={stat.label} className="rounded-card bg-white p-4 shadow-sm"><p className="text-xs text-charcoal/50">{stat.label}</p><p className="mt-1 text-lg font-bold capitalize">{stat.value}</p></div>)}</div>
      {completedCount < checklist.length && (
        <div className="mt-6 rounded-card border border-black/5 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-bold">Lengkapkan Profil Anda</h2>
          <p className="mt-1 text-xs text-charcoal/50">Profil yang lebih lengkap membantu pelanggan memahami perniagaan anda.</p>
          <ul className="mt-3 space-y-1.5 text-sm">{checklist.map((item) => <li key={item.label} className="flex items-center gap-2"><span className={item.done ? "text-green-600" : "text-charcoal/30"}>{item.done ? "✓" : "○"}</span><span className={item.done ? "text-charcoal/50 line-through" : ""}>{item.label}</span></li>)}</ul>
        </div>
      )}
      <div className="mt-6"><Link href={`/vendor/${vendor.slug}`} className="text-sm font-semibold text-brand hover:underline">Lihat profil awam anda →</Link></div>
    </div>
  );
}
