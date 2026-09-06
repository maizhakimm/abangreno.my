import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { checkAdminAuth } from "@/lib/auth/admin";
import { safeJsonBody } from "@/lib/utils/safeJson";
import { createAdminClient } from "@/lib/supabase/admin";

const moderationSchema = z.object({
  table: z.enum(["forum_posts", "forum_replies"]),
  id: z.string().uuid(),
  status: z.enum(["pending", "visible", "removed"]),
});

/** Independent admin check, Zod validation, affected-row check, and revalidation of the affected thread. */
export async function POST(req: NextRequest) {
  const auth = await checkAdminAuth();
  if (!auth.ok) {
    return NextResponse.json(
      { error: "Tidak dibenarkan" },
      { status: auth.reason === "unauthenticated" ? 401 : 403 }
    );
  }

  const parsedBody = await safeJsonBody(req);
  if ("errorResponse" in parsedBody) return parsedBody.errorResponse;

  const parsed = moderationSchema.safeParse(parsedBody.data);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { table, id, status } = parsed.data;

  const admin = createAdminClient();
  const { data: updated, error } = await admin
    .from(table)
    .update({ status })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Failed to update forum moderation status:", error.message);
    return NextResponse.json({ error: "Gagal mengemas kini status" }, { status: 500 });
  }
  if (!updated) {
    return NextResponse.json({ error: "Rekod tidak ditemui" }, { status: 404 });
  }

  // Resolve the thread's category slug + post slug so we can revalidate the
  // exact forum pages affected, whether a post or a reply was moderated.
  const postId =
    table === "forum_posts"
      ? id
      : (await admin.from("forum_replies").select("post_id").eq("id", id).single()).data?.post_id;

  if (postId) {
    const { data: post } = await admin
      .from("forum_posts")
      .select("slug, categories(slug)")
      .eq("id", postId)
      .single();

    const categorySlug = (post as unknown as { categories: { slug: string } | null } | null)?.categories?.slug;
    if (categorySlug && post?.slug) {
      revalidatePath(`/forum/${categorySlug}`);
      revalidatePath(`/forum/${categorySlug}/${post.slug}`);
    }
  }

  return NextResponse.json({ success: true });
}
