import "server-only";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "ar_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year — long-lived enough for later claiming

/**
 * §14 — ensures every guest browser gets a cryptographically random session
 * token, persisted in a cookie, so forum posts/replies they create can later
 * be claimed after registration (session_token column already exists on
 * forum_posts/forum_replies — this is what actually populates it).
 *
 * Returns the existing token if the cookie is already set, otherwise mints
 * a new one and sets the cookie for future requests. Next.js 15 made
 * cookies() asynchronous, so this helper is async too.
 */
export async function getOrCreateSessionToken(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (existing) return existing;

  const token = crypto.randomUUID() + "-" + crypto.randomUUID();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });

  return token;
}
