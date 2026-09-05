import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Tentang Kami",
  description: "Ketahui lebih lanjut tentang AbangReno.my, direktori vendor renovation Malaysia.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 text-sm leading-relaxed text-charcoal/80">
      <h1 className="text-2xl font-extrabold text-charcoal">Tentang AbangReno.my</h1>
      <p className="mt-4">
        AbangReno.my ialah platform direktori yang menghubungkan pemilik rumah di Malaysia dengan
        vendor renovation, repair dan maintenance yang dipercayai — daripada tukang paip dan
        waterproofing hingga kerja renovation penuh dan pemasangan kabinet dapur.
      </p>
      <p className="mt-4">
        Kami bukan kontraktor. Kami adalah platform perantara yang membantu anda mencari,
        membandingkan dan menghubungi vendor secara terus melalui WhatsApp — tanpa sebarang
        caj perantaraan.
      </p>
      <p className="mt-4">
        Penyenaraian vendor adalah percuma. Vendor yang mahu meningkatkan kredibiliti mereka
        boleh menghantar dokumen SSM untuk semakan dan mendapat lencana &ldquo;SSM
        Verified&rdquo;.
      </p>
    </article>
  );
}
