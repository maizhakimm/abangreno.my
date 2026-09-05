import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Dasar Privasi",
  description: "Dasar privasi AbangReno.my mengenai pengumpulan dan penggunaan data pengguna.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 text-sm leading-relaxed text-charcoal/80">
      <h1 className="text-2xl font-extrabold text-charcoal">Dasar Privasi</h1>
      <p className="mt-4">
        AbangReno.my ialah platform direktori perantara dan bukan pihak dalam transaksi antara
        pelanggan dan vendor servis. Dasar ini menerangkan bagaimana kami mengumpul, menggunakan
        dan melindungi maklumat anda.
      </p>

      <h2 className="mt-6 text-lg font-bold text-charcoal">Maklumat Yang Kami Kumpul</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>Nama dan maklumat hubungan (nombor telefon, emel)</li>
        <li>Maklumat akaun (kaedah log masuk, peranan pengguna)</li>
        <li>
          Bagi vendor: dokumen perniagaan (SSM) dan kad pengenalan (IC) yang dihantar untuk
          pengesahan
        </li>
        <li>Data penggunaan asas seperti alamat IP (di-hash) untuk mencegah spam forum</li>
      </ul>

      <h2 className="mt-6 text-lg font-bold text-charcoal">Bagaimana Dokumen SSM/IC Dilindungi</h2>
      <p className="mt-2">
        Dokumen SSM dan IC disimpan dalam storan peribadi yang tidak boleh diakses secara umum.
        Hanya pasukan admin AbangReno.my yang disahkan boleh mengakses dokumen ini bagi tujuan
        pengesahan perniagaan, melalui pautan sementara yang selamat.
      </p>

      <h2 className="mt-6 text-lg font-bold text-charcoal">Perkongsian Data</h2>
      <p className="mt-2">
        Kami tidak menjual data peribadi anda kepada pihak ketiga. Maklumat hubungan vendor
        dipaparkan secara umum pada profil vendor bagi membolehkan pelanggan menghubungi mereka
        terus.
      </p>

      <p className="mt-6 text-xs text-charcoal/50">
        Dasar ini bukan nasihat undang-undang muktamad dan mungkin dikemas kini dari semasa ke
        semasa.
      </p>
    </article>
  );
}
