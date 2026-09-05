import Link from "next/link";

const footerLinks = [
  { href: "/about", label: "Tentang Kami" },
  { href: "/privacy", label: "Privasi" },
  { href: "/terms", label: "Terma & Syarat" },
  { href: "/daftar-vendor", label: "Daftar Vendor" },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-black/5 bg-charcoal text-offwhite">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm">
        <div className="flex flex-col gap-6 md:flex-row md:justify-between">
          <div>
            <p className="text-lg font-extrabold">
              ABANG<span className="text-brand">RENO</span>
            </p>
            <p className="mt-2 max-w-sm text-white/60">
              AbangReno.my ialah platform direktori yang menghubungkan pemilik rumah dengan
              vendor renovation, repair dan maintenance di seluruh Malaysia.
            </p>
          </div>
          <nav className="flex flex-wrap gap-4">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-white/70 hover:text-brand">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-8 text-xs text-white/40">
          © {new Date().getFullYear()} AbangReno.my. AbangReno.my adalah platform direktori
          perantara dan bukan pihak dalam transaksi antara pelanggan dan vendor.
        </p>
      </div>
    </footer>
  );
}
