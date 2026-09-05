import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GalleryUploader from "@/components/vendor/GalleryUploader";

export default async function DashboardGalleryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: vendor } = await supabase.from("vendors").select("id").eq("user_id", user.id).maybeSingle();
  const { data: images } = vendor
    ? await supabase.from("vendor_images").select("*").eq("vendor_id", vendor.id).order("sort_order")
    : { data: [] };

  return (
    <div className="rounded-card bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold">Galeri Gambar</h1>
      <p className="mt-1 text-sm text-charcoal/60">
        Muat naik gambar profil, galeri kerja, dan gambar before/after. Disimpan dalam bucket
        awam Supabase Storage.
      </p>
      {vendor && <GalleryUploader vendorId={vendor.id} />}
      <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {(images ?? []).map((img) => (
          <div key={img.id} className="aspect-square rounded-lg bg-offwhite">
            {/* next/image would render img.image_url here once storage is connected */}
          </div>
        ))}
      </div>
    </div>
  );
}
