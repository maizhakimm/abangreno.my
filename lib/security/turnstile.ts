import "server-only";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Verifies a Cloudflare Turnstile token server-side (§5). Must be called
 * from every endpoint that accepts guest-submitted content (forum posts,
 * replies) BEFORE any database write happens. Rejects missing, invalid, and
 * expired tokens uniformly — Cloudflare's siteverify response already
 * distinguishes these via error-codes, but callers only need the boolean.
 */
export async function verifyTurnstileToken(token: string | undefined | null, remoteIp?: string): Promise<boolean> {
  if (!token) return false;

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // Fail closed: if the secret isn't configured, we cannot verify anything,
    // so we must not treat unverified submissions as trusted.
    console.error("TURNSTILE_SECRET_KEY is not configured — rejecting submission.");
    return false;
  }

  const formData = new URLSearchParams();
  formData.append("secret", secret);
  formData.append("response", token);
  if (remoteIp) formData.append("remoteip", remoteIp);

  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) return false;

    const data = (await res.json()) as { success: boolean; "error-codes"?: string[] };
    return data.success === true;
  } catch (err) {
    console.error("Turnstile verification request failed:", err);
    return false;
  }
}
