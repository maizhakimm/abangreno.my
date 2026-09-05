import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const moderationSchema = z.object({
  table: z.enum(["forum_posts", "forum_replies"]),
  id: z.string().uuid(),
  status: z.enum(["visible", "removed"]),
});

/** §20/§21 — independent admin check, Zod validation, and revalidation of the affected thread. */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sila log masuk" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 403 });

  const body = await req.json();
  const parsed = moderationSchema.safeParse(body);
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
    return NextResponse.json({ error: "Gagal mengemas kini status" }, { status: 500 });
  }
  if (!updated) {
    return NextResponse.json({ error: "Rekod tidak ditemui" }, { status: 404 });
  }

  // Resolve the thread's category slug + post slug so we can revalidate the
  // exact forum pages affected, whether a post or a reply was moderated.
  const postId = table === "forum_posts" ? id : (await admin.from("forum_replies").select("post_id").eq("id", id).single()).data?.post_id;

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
