import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { forumPostSchema } from "@/lib/validation/schemas";
import { containsSpamKeywords, decideInitialStatus } from "@/lib/moderation/spamFilter";
import { hashIp, isRateLimited } from "@/lib/moderation/rateLimit";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import { getOrCreateSessionToken } from "@/lib/security/session";
import { generateUniqueSlug } from "@/lib/utils/slug";
import { safeJsonBody } from "@/lib/utils/safeJson";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Guest-postable forum question endpoint.
 * Uses the SERVICE ROLE client (bypassing RLS) because forum_posts has no
 * anon INSERT policy — all validation, spam filtering, rate limiting, and
 * Turnstile verification happens here, server-side, before a row is ever
 * created.
 */
export async function POST(req: NextRequest) {
  const parsedBody = await safeJsonBody(req);
  if ("errorResponse" in parsedBody) return parsedBody.errorResponse;

  // §B2 — category_slug is now part of the Zod schema itself (slug-shaped
  // string), rather than being pulled out of the raw body untyped and
  // trusted. Anything malformed (wrong type, empty, not slug-shaped) is
  // rejected here before it ever reaches a database query.
  const parsed = forumPostSchema.safeParse(parsedBody.data);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  // Real Turnstile verification. Reject missing/invalid/expired tokens
  // BEFORE touching the database.
  const turnstileOk = await verifyTurnstileToken(parsed.data.turnstile_token, ip);
  if (!turnstileOk) {
    return NextResponse.json({ error: "Pengesahan captcha gagal. Sila cuba lagi." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: category } = await admin
    .from("categories")
    .select("id")
    .eq("slug", parsed.data.category_slug)
    .eq("is_active", true)
    .maybeSingle();

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

  // §B3 — an authenticated user's own identity is already captured via
  // user_id; guest_name/guest_email are only ever stored for genuine guests.
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
    console.error("Failed to create forum post:", error?.message);
    return NextResponse.json({ error: "Gagal menghantar soalan" }, { status: 500 });
  }

  if (status === "visible") {
    revalidatePath(`/forum/${parsed.data.category_slug}`);
  }

  return NextResponse.json({ post, status }, { status: 201 });
}
