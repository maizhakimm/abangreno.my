import "server-only";
import type { User } from "@supabase/supabase-js";

/**
 * Email-first vendor onboarding (replaces the old mandatory phone-OTP gate).
 *
 * Checks Supabase Auth's own `email_confirmed_at` field on the authenticated
 * user — never a client-submitted boolean. This is set by Supabase itself:
 *   - Google OAuth: set automatically once Google's own verified email is
 *     linked, no extra step needed on our side.
 *   - Email magic link: set the moment the user successfully clicks the
 *     link (a magic-link session cannot exist without this being set, but
 *     we check explicitly anyway rather than assuming that invariant holds
 *     forever elsewhere in the codebase).
 *
 * A user object with no email at all is treated as not satisfying the email
 * requirement. The MVP login UI itself is email/Google only.
 */
export function isEmailVerified(user: Pick<User, "email" | "email_confirmed_at">): boolean {
  return !!user.email && !!user.email_confirmed_at;
}
