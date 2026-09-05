import { NextRequest, NextResponse } from "next/server";
import { reportSchema } from "@/lib/validation/schemas";
import { hashIp, isReportRateLimited } from "@/lib/moderation/rateLimit";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * §13 — reports never auto-remove content; this only ever creates a
 * 'pending' record for admin review. Anonymous reporting is allowed, but
 * rate-limited by hashed IP (5/hour, see lib/moderation/rateLimit.ts) the
 * same way guest forum posts are. All writes go through the SERVICE ROLE
 * client — reports has no client-facing INSERT policy at all (see
 * 0006_reports_insert_lockdown.sql), so this Route Handler is the only path
 * that can create a report, which is what makes the rate limit actually
 * enforceable (a direct browser call to Supabase would be rejected by RLS).
 * The service-role key itself never leaves the server.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = reportSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = await hashIp(ip);

  if (await isReportRateLimited(ipHash)) {
    return NextResponse.json(
      { error: "Terlalu banyak laporan dihantar. Sila cuba lagi sejam lagi." },
      { status: 429 }
    );
  }

  // Validate the reported target actually exists, so reports can't pile up
  // against a fabricated id.
  const admin = createAdminClient();
  const targetTableByType: Record<string, string> = {
    vendor: "vendors",
    review: "reviews",
    forum_post: "forum_posts",
    forum_reply: "forum_replies",
  };
  const { data: targetExists } = await admin
    .from(targetTableByType[parsed.data.target_type])
    .select("id")
    .eq("id", parsed.data.target_id)
    .maybeSingle();

  if (!targetExists) {
    return NextResponse.json({ error: "Kandungan yang dilaporkan tidak ditemui" }, { status: 404 });
  }

  const supabaseServer = await createClient();
  const {
    data: { user },
  } = await supabaseServer.auth.getUser();

  const { error } = await admin.from("reports").insert({
    target_type: parsed.data.target_type,
    target_id: parsed.data.target_id,
    reporter_user_id: user?.id ?? null,
    reason: parsed.data.reason,
    details: parsed.data.details ?? null,
    status: "pending",
    ip_hash: ipHash,
  });

  if (error) {
    return NextResponse.json({ error: "Gagal menghantar laporan" }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
