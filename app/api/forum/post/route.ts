import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { forumPostSchema } from "@/lib/validation/schemas";
import { containsSpamKeywords, decideInitialStatus } from "@/lib/moderation/spamFilter";
import { hashIp, isRateLimited } from "@/lib/moderation/rateLimit";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import { getOrCreateSessionToken } from "@/lib/security/session";
import { generateUniqueSlug } from "@/lib/utils/slug";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Guest-postable forum question endpoint (§20, §22, §5).
 * Uses the SERVICE ROLE client (bypassing RLS) because forum_posts has no
 * anon INSERT policy — all validation, spam filtering, rate limiting, and
 * Turnstile verification happens here, server-side, before a row is ever
 * created.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { category_slug, ...rest } = body;

  const parsed = forumPostSchema.safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  // §5 — real Turnstile verification. Reject missing/invalid/expired tokens
  // BEFORE touching the database.
  const turnstileOk = await verifyTurnstileToken(parsed.data.turnstile_token, ip);
  if (!turnstileOk) {
    return NextResponse.json({ error: "Pengesahan captcha gagal. Sila cuba lagi." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: category } = await admin
    .from("categories")
    .select("id")
    .eq("slug", category_slug)
    .eq("is_active", true)
    .single();

  if (!category) {
    return NextResponse.json({ error: "Kategori tidak sah" }, { status: 400 });
  }

  const ipHash = await hashIp(ip);

  if (await isRateLimited(ipHash)) {
    return NextResponse.json(
      { error: "Terlalu banyak hantaran. Sila cuba lagi sejam lagi." },
      { status: 429 }
    );
  }

  const { count: priorVisibleCount } = await admin
    .from("forum_posts")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .eq("status", "visible");

  const status = decideInitialStatus({
    hasSpamKeyword: containsSpamKeywords(`${parsed.data.title} ${parsed.data.content}`),
    hasPriorVisiblePostsFromIp: (priorVisibleCount ?? 0) > 0,
  });

  const supabaseServer = await createClient();
  const {
    data: { user },
  } = await supabaseServer.auth.getUser();

  // §14 — mint/read the guest session cookie so this post can later be
  // claimed after the guest registers.
  const sessionToken = await getOrCreateSessionToken();

  const slug = await generateUniqueSlug(parsed.data.title, async (candidate) => {
    const { data } = await admin.from("forum_posts").select("id").eq("slug", candidate).maybeSingle();
    return !!data;
  });

  const { data: post, error } = await admin
    .from("forum_posts")
    .insert({
      category_id: category.id,
      slug,
      title: parsed.data.title,
      content: parsed.data.content,
      location_tag: parsed.data.location_tag ?? null,
      guest_name: user ? null : parsed.data.guest_name ?? null,
      guest_email: user ? null : parsed.data.guest_email || null,
      user_id: user?.id ?? null,
      session_token: sessionToken,
      ip_hash: ipHash,
      status,
    })
    .select()
    .single();

  if (error || !post) {
    return NextResponse.json({ error: "Gagal menghantar soalan" }, { status: 500 });
  }

  if (status === "visible") {
    revalidatePath(`/forum/${category_slug}`);
  }

  return NextResponse.json({ post, status }, { status: 201 });
}
