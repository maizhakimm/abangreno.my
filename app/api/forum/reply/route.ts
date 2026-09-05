import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { forumReplySchema } from "@/lib/validation/schemas";
import { containsSpamKeywords, decideInitialStatus } from "@/lib/moderation/spamFilter";
import { hashIp, isRateLimited } from "@/lib/moderation/rateLimit";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import { getOrCreateSessionToken } from "@/lib/security/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = forumReplySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const turnstileOk = await verifyTurnstileToken(parsed.data.turnstile_token, ip);
  if (!turnstileOk) {
    return NextResponse.json({ error: "Pengesahan captcha gagal. Sila cuba lagi." }, { status: 400 });
  }

  const ipHash = await hashIp(ip);

  if (await isRateLimited(ipHash)) {
    return NextResponse.json(
      { error: "Terlalu banyak hantaran. Sila cuba lagi sejam lagi." },
      { status: 429 }
    );
  }

  const admin = createAdminClient();

  // §8 — public replies may only target a VISIBLE thread. Pending, flagged,
  // and removed threads must not accept new public replies.
  const { data: post } = await admin
    .from("forum_posts")
    .select("id, slug, category_id, status, categories(slug)")
    .eq("id", parsed.data.post_id)
    .eq("status", "visible")
    .single();

  if (!post) {
    return NextResponse.json({ error: "Soalan tidak ditemui" }, { status: 404 });
  }

  const { count: priorVisibleCount } = await admin
    .from("forum_replies")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .eq("status", "visible");

  const status = decideInitialStatus({
    hasSpamKeyword: containsSpamKeywords(parsed.data.content),
    hasPriorVisiblePostsFromIp: (priorVisibleCount ?? 0) > 0,
  });

  const supabaseServer = await createClient();
  const {
    data: { user },
  } = await supabaseServer.auth.getUser();

  let vendorId: string | null = null;
  if (user) {
    const { data: vendor } = await admin
      .from("vendors")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    vendorId = vendor?.id ?? null;
  }

  const sessionToken = await getOrCreateSessionToken();

  const { data: reply, error } = await admin
    .from("forum_replies")
    .insert({
      post_id: parsed.data.post_id,
      content: parsed.data.content,
      guest_name: user ? null : parsed.data.guest_name ?? null,
      guest_email: user ? null : parsed.data.guest_email || null,
      user_id: user?.id ?? null,
      session_token: sessionToken,
      ip_hash: ipHash,
      is_vendor_reply: !!vendorId,
      vendor_id: vendorId,
      status,
    })
    .select()
    .single();

  if (error || !reply) {
    return NextResponse.json({ error: "Gagal menghantar jawapan" }, { status: 500 });
  }

  const categorySlug = (post as unknown as { categories: { slug: string } | null }).categories?.slug;
  if (status === "visible" && categorySlug) {
    revalidatePath(`/forum/${categorySlug}/${post.slug}`);
  }

  return NextResponse.json({ reply, status }, { status: 201 });
}
