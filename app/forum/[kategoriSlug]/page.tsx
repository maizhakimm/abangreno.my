import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo/metadata";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import NewQuestionForm from "@/components/forum/NewQuestionForm";
import { getCategoryBySlug } from "@/lib/data/categories";
import { getVisibleForumPostsByCategory } from "@/lib/data/forum";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 900; // ISR, frequent since threads are added often

interface PageProps {
  params: Promise<{ kategoriSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { kategoriSlug } = await params;
  const category = await getCategoryBySlug(kategoriSlug);
  if (!category) return {};

  return buildMetadata({
    title: `Forum ${category.name} — Soal Jawab`,
    description: `Soalan dan jawapan komuniti tentang ${category.name.toLowerCase()} di Malaysia.`,
    path: `/forum/${kategoriSlug}`,
  });
}

export default async function ForumCategoryPage({ params }: PageProps) {
  const { kategoriSlug } = await params;
  const category = await getCategoryBySlug(kategoriSlug);
  if (!category) notFound();

  const threads = await getVisibleForumPostsByCategory(category.id);

  // Reply counts per thread, fetched in one query rather than N+1.
  const supabase = await createClient();
  const threadIds = threads.map((t) => t.id);
  const { data: replyRows } = threadIds.length
    ? await supabase.from("forum_replies").select("post_id").in("post_id", threadIds).eq("status", "visible")
    : { data: [] };
  const replyCountByPost = new Map<string, number>();
  for (const row of replyRows ?? []) {
    replyCountByPost.set(row.post_id, (replyCountByPost.get(row.post_id) ?? 0) + 1);
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { name: "Utama", path: "/" },
          { name: "Forum", path: "/forum" },
          { name: category.name, path: `/forum/${kategoriSlug}` },
        ]}
      />
      <section className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold">Forum {category.name}</h1>
        </div>

        <div className="mt-6 space-y-3">
          {threads.length === 0 && (
            <p className="text-sm text-charcoal/60">Belum ada soalan untuk kategori ini lagi.</p>
          )}
          {threads.map((thread) => (
            <Link
              key={thread.id}
              href={`/forum/${kategoriSlug}/${thread.slug}`}
              className="focus-ring block rounded-card border border-black/5 bg-white p-4 shadow-sm hover:border-brand"
            >
              <p className="font-semibold">{thread.title}</p>
              <p className="mt-1 text-xs text-charcoal/50">
                {replyCountByPost.get(thread.id) ?? 0} jawapan
                {thread.location_tag && ` · ${thread.location_tag}`}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-8 rounded-card border border-black/5 bg-white p-5">
          <h2 className="text-lg font-bold">Tanya Soalan Baru</h2>
          <p className="mt-1 text-xs text-charcoal/50">
            Anda boleh bertanya tanpa mendaftar akaun. Soalan pertama akan disemak sebelum
            dipaparkan secara umum.
          </p>
          <NewQuestionForm categorySlug={kategoriSlug} />
        </div>
      </section>
    </div>
  );
}
