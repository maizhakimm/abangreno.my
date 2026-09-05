import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo/metadata";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { getAllActiveCategories } from "@/lib/data/categories";

export const revalidate = 1800;

export const metadata: Metadata = buildMetadata({
  title: "Forum Soal Jawab Renovation & Servis Rumah",
  description:
    "Tanya soalan dan dapatkan jawapan tentang renovation, pembaikan dan penyelenggaraan rumah daripada komuniti dan vendor berdaftar.",
  path: "/forum",
});

export default async function ForumIndexPage() {
  const categories = await getAllActiveCategories();

  return (
    <div>
      <Breadcrumbs items={[{ name: "Utama", path: "/" }, { name: "Forum", path: "/forum" }]} />
      <section className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-extrabold">Forum Soal Jawab</h1>
        <p className="mt-2 text-sm text-charcoal/70">
          Tanya soalan tentang renovation, pembaikan atau penyelenggaraan rumah anda. Tidak perlu
          daftar akaun untuk bertanya.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/forum/${cat.slug}`}
              className="focus-ring rounded-card border border-black/5 bg-white p-4 font-semibold shadow-sm hover:border-brand hover:text-brand"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
