import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Terma & Syarat",
  description: "Terma dan syarat penggunaan platform AbangReno.my.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 text-sm leading-relaxed text-charcoal/80">
      <h1 className="text-2xl font-extrabold text-charcoal">Terma & Syarat</h1>

      <p className="mt-4">
        AbangReno.my adalah platform direktori perantara dan bukan pihak dalam transaksi antara
        pelanggan dan vendor servis. Kami tidak menyediakan sebarang perkhidmatan renovation atau
        pembaikan secara langsung.
      </p>

      <h2 className="mt-6 text-lg font-bold text-charcoal">Status &ldquo;SSM Verified&rdquo;</h2>
      <p className="mt-2">
        Lencana &ldquo;SSM Verified&rdquo; menandakan bahawa dokumen pendaftaran perniagaan yang
        dikemukakan telah disemak oleh pasukan kami. Ia bukan jaminan atau endorsan terhadap
        kualiti kerja vendor tersebut.
      </p>

      <h2 className="mt-6 text-lg font-bold text-charcoal">Tanggungjawab Pengguna</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>Pelanggan bertanggungjawab menilai dan memilih vendor mengikut budi bicara sendiri.</li>
        <li>Vendor bertanggungjawab terhadap ketepatan maklumat yang disiarkan pada profil mereka.</li>
        <li>Kandungan forum yang disiarkan tertakluk kepada semakan moderasi.</li>
      </ul>

      <h2 className="mt-6 text-lg font-bold text-charcoal">Had Liabiliti</h2>
      <p className="mt-2">
        AbangReno.my tidak bertanggungjawab ke atas sebarang pertikaian, kerugian atau kerosakan
        yang timbul daripada urusan antara pelanggan dan vendor.
      </p>

      <p className="mt-6 text-xs text-charcoal/50">
        Terma ini bukan nasihat undang-undang muktamad dan mungkin dikemas kini dari semasa ke
        semasa.
      </p>
    </article>
  );
}
