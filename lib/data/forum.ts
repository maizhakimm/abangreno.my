import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ForumPost, ForumReply, Vendor } from "@/types/database";

/** §9 — only 'visible' posts may be publicly rendered/indexed. */
export async function getVisibleForumPostsByCategory(categoryId: string, limit = 30): Promise<ForumPost[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("forum_posts")
    .select("*")
    .eq("category_id", categoryId)
    .eq("status", "visible")
    .order("created_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}

export async function getForumThreadBySlug(
  slug: string
): Promise<{ post: ForumPost; replies: (ForumReply & { vendor: Vendor | null })[] } | null> {
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("forum_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "visible")
    .maybeSingle();

  if (!post) return null;

  const { data: replies } = await supabase
    .from("forum_replies")
    .select("*, vendors(*)")
    .eq("post_id", post.id)
    .eq("status", "visible")
    .order("created_at", { ascending: true });

  const repliesWithVendor = ((replies ?? []) as unknown as (ForumReply & { vendors: Vendor | null })[]).map(
    (r) => ({ ...r, vendor: r.vendors })
  );

  return { post, replies: repliesWithVendor };
}

/** A handful of recent visible threads for a category page's "related questions" block. */
export async function getRecentForumThreadsForCategory(categoryId: string, limit = 5): Promise<ForumPost[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("forum_posts")
    .select("*")
    .eq("category_id", categoryId)
    .eq("status", "visible")
    .order("created_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}
