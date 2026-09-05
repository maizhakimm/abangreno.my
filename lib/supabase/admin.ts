import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Privileged Supabase client using the SERVICE ROLE key.
 * BYPASSES Row Level Security entirely.
 *
 * NEVER import this file into a Client Component or expose it to the browser.
 * Only use inside:
 *  - Route Handlers (app/api/**)
 *  - Server Actions
 *  - Admin-only server logic (SSM/IC document review, moderation actions)
 *
 * The `server-only` import above will throw a build error if this file is
 * ever pulled into client-side bundle, as a safety net.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars."
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Generate a short-lived signed URL for a private document (SSM/IC).
 * Documents in `vendor-private-documents` must never be made public.
 */
export async function getSignedDocumentUrl(path: string, expiresInSeconds = 300) {
  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from("vendor-private-documents")
    .createSignedUrl(path, expiresInSeconds);

  if (error) throw error;
  return data.signedUrl;
}
