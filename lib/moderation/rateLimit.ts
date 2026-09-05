import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Enforces "max 3 posts per hour per IP hash" (§22) by counting recent
 * forum_posts + forum_replies rows for the given ip_hash.
 *
 * NOTE: For a single-region MVP this DB-based check is sufficient. If the
 * platform scales significantly, move this to a fast KV/edge store
 * (e.g. Cloudflare KV, Upstash Redis) to avoid hammering Postgres.
 */
export async function isRateLimited(ipHash: string): Promise<boolean> {
  const admin = createAdminClient();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const [{ count: postCount }, { count: replyCount }] = await Promise.all([
    admin
      .from("forum_posts")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", oneHourAgo),
    admin
      .from("forum_replies")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", oneHourAgo),
  ]);

  const total = (postCount ?? 0) + (replyCount ?? 0);
  return total >= 3;
}

/**
 * §13 — reports anti-abuse: max 5 reports per hour per IP hash. Looser than
 * the forum's 3/hour since legitimate users may need to report several
 * pieces of content in one session (e.g. a spam wave), but still bounded.
 */
export async function isReportRateLimited(ipHash: string): Promise<boolean> {
  const admin = createAdminClient();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count } = await admin
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", oneHourAgo);

  return (count ?? 0) >= 5;
}

/** Hash an IP address before storing — never persist raw IPs (privacy). */
export async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + (process.env.IP_HASH_SALT ?? "abangreno-default-salt"));
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
