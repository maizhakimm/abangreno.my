import Link from "next/link";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/profile", label: "Profil Perniagaan" },
  { href: "/dashboard/services", label: "Servis" },
  { href: "/dashboard/gallery", label: "Galeri" },
  { href: "/dashboard/verification", label: "Pengesahan SSM" },
  { href: "/dashboard/reviews", label: "Ulasan" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row">
      <aside className="shrink-0 md:w-56">
        <nav className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="focus-ring whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium hover:bg-white hover:text-brand"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
