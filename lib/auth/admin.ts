import "server-only";
import { createClient } from "@/lib/supabase/server";

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

export type AdminAuthResult =
  | { ok: true; user: { id: string }; supabase: ServerSupabaseClient }
  | { ok: false; reason: "unauthenticated" | "forbidden" };

/**
 * Server-only admin authorization check, meant to be called independently
 * by every admin page AND every admin API route — never relying solely on
 * app/admin/layout.tsx (which only gates page rendering) or on the client
 * having hidden the relevant navigation.
 *
 * Returns a discriminated result rather than throwing/redirecting itself,
 * so callers can choose the right response for their context:
 *   - a Server Component page typically calls redirect("/login") or
 *     redirect("/") based on the `reason`
 *   - an API route typically returns a 401 or 403 JSON response
 *
 * This performs the two checks every admin surface needs:
 *   1. Is there an authenticated user at all?
 *   2. Does that user's profiles.role actually equal 'admin'?
 * Authentication alone (a valid session) is NOT sufficient — an
 * authenticated non-admin must never be treated as authorized here.
 */
export async function checkAdminAuth(): Promise<AdminAuthResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, reason: "unauthenticated" };
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  if (profile?.role !== "admin") {
    return { ok: false, reason: "forbidden" };
  }

  return { ok: true, user: { id: user.id }, supabase };
}
