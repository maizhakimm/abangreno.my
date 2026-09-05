"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/** §12 — uploads go into the public `vendor-public-media` bucket under {vendor_id}/... */
export default function GalleryUploader({ vendorId }: { vendorId: string }) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setError("Hanya PNG, JPG, atau WEBP dibenarkan.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError("Saiz fail melebihi had 5MB.");
      return;
    }

    setError(null);
    setUploading(true);

    const path = `${vendorId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("vendor-public-media")
      .upload(path, file);

    if (!uploadError) {
      const { data } = supabase.storage.from("vendor-public-media").getPublicUrl(path);
      await supabase.from("vendor_images").insert({
        vendor_id: vendorId,
        image_url: data.publicUrl,
        type: "gallery",
      });
    }

    setUploading(false);
  }

  return (
    <div className="mt-4">
      <label className="focus-ring inline-block cursor-pointer rounded-lg border border-dashed border-black/20 px-4 py-2 text-sm font-medium hover:border-brand">
        {uploading ? "Memuat naik..." : "+ Muat Naik Gambar"}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleUpload}
          disabled={uploading}
        />
      </label>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
