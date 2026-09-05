import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo/metadata";
import { forumThreadJsonLd } from "@/lib/seo/jsonLd";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import ReplyForm from "@/components/forum/ReplyForm";
import { getCategoryBySlug } from "@/lib/data/categories";
import { getForumThreadBySlug } from "@/lib/data/forum";

export const revalidate = 900;

interface PageProps {
  params: Promise<{ kategoriSlug: string; threadSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { kategoriSlug, threadSlug } = await params;
  const data = await getForumThreadBySlug(threadSlug);
  if (!data) return {};

  return buildMetadata({
    title: data.post.title,
    description: data.post.content.slice(0, 155),
    path: `/forum/${kategoriSlug}/${threadSlug}`,
  });
}

export default async function ForumThreadPage({ params }: PageProps) {
  const { kategoriSlug, threadSlug } = await params;
  const [category, data] = await Promise.all([
    getCategoryBySlug(kategoriSlug),
    getForumThreadBySlug(threadSlug),
  ]);

  if (!category || !data) notFound();
  const { post, replies } = data;

  // Defense in depth: confirm the thread actually belongs to this category
  // slug (in case of stale/incorrect links), otherwise 404 rather than
  // silently rendering it under the wrong URL.
  if (post.category_id !== category.id) notFound();

  const jsonLd = forumThreadJsonLd(post, replies);

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs
        items={[
          { name: "Utama", path: "/" },
          { name: "Forum", path: "/forum" },
          { name: category.name, path: `/forum/${kategoriSlug}` },
          { name: post.title, path: `/forum/${kategoriSlug}/${threadSlug}` },
        ]}
      />

      <article className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-xl font-extrabold md:text-2xl">{post.title}</h1>
        <p className="mt-1 text-xs text-charcoal/50">
          Ditanya oleh {post.guest_name ?? "Pengguna"} {post.location_tag && `· ${post.location_tag}`}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-charcoal/80">{post.content}</p>

        <h2 className="mt-10 text-lg font-bold">{replies.length} Jawapan</h2>
        <div className="mt-4 space-y-4">
          {replies.length === 0 && (
            <p className="text-sm text-charcoal/60">Belum ada jawapan. Jadi yang pertama menjawab!</p>
          )}
          {replies.map((reply) => (
            <div key={reply.id} className="rounded-card border border-black/5 bg-white p-4">
              {reply.is_vendor_reply && (
                <p className="mb-2 inline-block rounded-full bg-brand-light px-2 py-0.5 text-xs font-semibold text-brand-dark">
                  Jawapan daripada Vendor Berdaftar
                </p>
              )}
              <p className="text-sm text-charcoal/80">{reply.content}</p>
              <p className="mt-2 text-xs text-charcoal/40">
                {reply.is_vendor_reply && reply.vendor ? (
                  <Link href={`/vendor/${reply.vendor.slug}`} className="text-brand hover:underline">
                    {reply.vendor.business_name}
                  </Link>
                ) : (
                  reply.guest_name ?? "Pengguna"
                )}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-card border border-black/5 bg-white p-5">
          <h2 className="text-lg font-bold">Hantar Jawapan Anda</h2>
          <ReplyForm postId={post.id} />
        </div>
      </article>
    </div>
  );
}
