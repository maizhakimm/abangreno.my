import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GalleryUploader from "@/components/vendor/GalleryUploader";
import GalleryImageGrid from "@/components/vendor/GalleryImageGrid";

export default async function DashboardGalleryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: vendor } = await supabase.from("vendors").select("id").eq("user_id", user.id).maybeSingle();
  const { data: images } = vendor
    ? await supabase.from("vendor_images").select("*").eq("vendor_id", vendor.id).neq("type", "profile").order("sort_order")
    : { data: [] };

  return (
    <div className="rounded-card bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold">Galeri Gambar</h1>
      <p className="mt-1 text-sm text-charcoal/60">Muat naik gambar projek, atau tandakan sebagai &ldquo;Sebelum&rdquo;/&ldquo;Selepas&rdquo; untuk tunjukkan hasil kerja anda.</p>
      {vendor && <GalleryUploader vendorId={vendor.id} />}
      <GalleryImageGrid images={images ?? []} />
    </div>
  );
}
