"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const EXTENSION_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

function storagePathFromPublicUrl(url: string | null) {
  if (!url) return null;
  const marker = "/storage/v1/object/public/vendor-public-media/";
  const index = url.indexOf(marker);
  if (index < 0) return null;
  return decodeURIComponent(url.slice(index + marker.length));
}

export default function ProfileImageUploader({ vendorId, currentUrl }: { vendorId: string; currentUrl: string | null }) {
  const supabase = createClient();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setError("Hanya PNG, JPG, atau WEBP dibenarkan.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError("Saiz fail melebihi had 5MB.");
      e.target.value = "";
      return;
    }

    setUploading(true);
    setError(null);
    const extension = EXTENSION_BY_MIME[file.type];
    const path = `${vendorId}/profile-${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("vendor-public-media")
      .upload(path, file, { contentType: file.type });
    if (uploadError) {
      setError("Gagal memuat naik logo. Sila cuba lagi.");
      setUploading(false);
      e.target.value = "";
      return;
    }

    const { data } = supabase.storage.from("vendor-public-media").getPublicUrl(path);
    const res = await fetch("/api/vendor/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile_picture_url: data.publicUrl }),
    });
    if (!res.ok) {
      await supabase.storage.from("vendor-public-media").remove([path]);
      setError("Logo dimuat naik tetapi gagal disimpan. Sila cuba lagi.");
      setUploading(false);
      e.target.value = "";
      return;
    }

    const oldPath = storagePathFromPublicUrl(currentUrl);
    if (oldPath && oldPath.startsWith(`${vendorId}/`)) {
      await supabase.storage.from("vendor-public-media").remove([oldPath]);
    }
    setUploading(false);
    e.target.value = "";
    router.refresh();
  }

  return (
    <div className="mt-5 flex items-center gap-4">
      <div className="relative h-20 w-20 overflow-hidden rounded-full bg-offwhite">
        {currentUrl ? (
          <Image src={currentUrl} alt="Logo perniagaan" fill sizes="80px" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-charcoal/40">Tiada logo</div>
        )}
      </div>
      <div>
        <label className="focus-ring inline-block cursor-pointer rounded-lg border border-dashed border-black/20 px-4 py-2 text-sm font-medium hover:border-brand">
          {uploading ? "Memuat naik..." : currentUrl ? "Tukar Logo / Gambar" : "Muat Naik Logo / Gambar"}
          <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" disabled={uploading} onChange={handleUpload} />
        </label>
        <p className="mt-1 text-xs text-charcoal/40">PNG, JPG atau WEBP. Maksimum 5MB.</p>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
