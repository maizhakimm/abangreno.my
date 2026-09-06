"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { VendorImage } from "@/types/database";

const TYPE_LABELS: Record<string, string> = { gallery: "Umum", before: "Sebelum", after: "Selepas" };

export default function GalleryImageGrid({ images }: { images: VendorImage[] }) {
  const supabase = createClient();
  const [items, setItems] = useState(images);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(image: VendorImage) {
    setDeletingId(image.id);
    const { error } = await supabase.from("vendor_images").delete().eq("id", image.id);
    if (!error) {
      const marker = "/storage/v1/object/public/vendor-public-media/";
      const markerIndex = image.image_url.indexOf(marker);
      if (markerIndex >= 0) {
        const objectPath = decodeURIComponent(image.image_url.slice(markerIndex + marker.length));
        await supabase.storage.from("vendor-public-media").remove([objectPath]);
      }
      setItems((prev) => prev.filter((img) => img.id !== image.id));
    }
    setDeletingId(null);
  }

  if (items.length === 0) return <p className="mt-5 text-sm text-charcoal/60">Belum ada gambar dimuat naik.</p>;
  return (
    <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
      {items.map((img) => (
        <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg bg-offwhite">
          <Image src={img.image_url} alt={img.caption ?? "Gambar galeri vendor"} fill sizes="(max-width: 640px) 33vw, 200px" className="object-cover" />
          {img.type !== "gallery" && <span className="absolute left-1 top-1 rounded-full bg-charcoal/80 px-2 py-0.5 text-[10px] font-semibold text-white">{TYPE_LABELS[img.type] ?? img.type}</span>}
          <button onClick={() => handleDelete(img)} disabled={deletingId === img.id} className="focus-ring absolute right-1 top-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100 disabled:opacity-50">
            {deletingId === img.id ? "..." : "Padam"}
          </button>
        </div>
      ))}
    </div>
  );
}
