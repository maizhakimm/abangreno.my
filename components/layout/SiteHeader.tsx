import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-offwhite/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-extrabold tracking-tight">
          ABANG<span className="text-brand">RENO</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href="/kategori/tukang-paip" className="hover:text-brand">
            Kategori
          </Link>
          <Link href="/forum" className="hover:text-brand">
            Forum
          </Link>
          <Link href="/daftar-vendor" className="hover:text-brand">
            Daftar Vendor
          </Link>
        </nav>
        <Link
          href="/daftar-vendor"
          className="focus-ring rounded-full bg-charcoal px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand"
        >
          Daftar Percuma
        </Link>
      </div>
    </header>
  );
}
