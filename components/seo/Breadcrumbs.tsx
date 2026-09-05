import Link from "next/link";
import { breadcrumbListJsonLd } from "@/lib/seo/jsonLd";

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const jsonLd = breadcrumbListJsonLd(items);

  return (
    <nav aria-label="Breadcrumb" className="mx-auto max-w-6xl px-4 pt-4 text-xs text-charcoal/60">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => (
          <li key={item.path} className="flex items-center gap-1">
            {index > 0 && <span>/</span>}
            {index === items.length - 1 ? (
              <span className="font-medium text-charcoal">{item.name}</span>
            ) : (
              <Link href={item.path} className="hover:text-brand">
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
