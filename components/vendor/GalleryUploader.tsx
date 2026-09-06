"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { VendorImageType } from "@/types/database";

const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const EXTENSION_BY_MIME: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };
const TYPE_OPTIONS: { value: VendorImageType; label: string }[] = [
  { value: "gallery", label: "Umum / Projek" },
  { value: "before", label: "Sebelum" },
  { value: "after", label: "Selepas" },
];

export default function GalleryUploader({ vendorId }: { vendorId: string }) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageType, setImageType] = useState<VendorImageType>("gallery");

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_MIME_TYPES.includes(file.type)) { setError("Hanya PNG, JPG, atau WEBP dibenarkan."); e.target.value = ""; return; }
    if (file.size > MAX_FILE_SIZE_BYTES) { setError("Saiz fail melebihi had 5MB."); e.target.value = ""; return; }

    setError(null);
    setUploading(true);
    const extension = EXTENSION_BY_MIME[file.type];
    const path = `${vendorId}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("vendor-public-media").upload(path, file, { contentType: file.type });
    if (uploadError) { setError("Gagal memuat naik gambar. Sila cuba lagi."); setUploading(false); e.target.value = ""; return; }

    const { data } = supabase.storage.from("vendor-public-media").getPublicUrl(path);
    const { error: insertError } = await supabase.from("vendor_images").insert({ vendor_id: vendorId, image_url: data.publicUrl, type: imageType });
    if (insertError) {
      await supabase.storage.from("vendor-public-media").remove([path]);
      setError("Gagal menyimpan gambar. Sila cuba lagi.");
    } else {
      window.location.reload();
    }
    setUploading(false);
    e.target.value = "";
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center gap-2">
        <select value={imageType} onChange={(e) => setImageType(e.target.value as VendorImageType)} className="focus-ring rounded-lg border border-black/10 px-2 py-2 text-sm">
          {TYPE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <label className="focus-ring inline-block cursor-pointer rounded-lg border border-dashed border-black/20 px-4 py-2 text-sm font-medium hover:border-brand">
          {uploading ? "Memuat naik..." : "+ Muat Naik Gambar"}
          <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
