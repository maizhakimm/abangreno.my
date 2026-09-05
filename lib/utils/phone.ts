/**
 * Normalizes a Malaysian phone number to a consistent E.164-ish form
 * (+60XXXXXXXXX) so that comparisons between what the user submitted, what
 * they sent an OTP to, and what Supabase Auth reports as verified are all
 * comparing the same canonical string — not relying on incidental formatting
 * matches (e.g. "0123456789" vs "+60123456789" vs "60123456789").
 */
export function normalizeMalaysianPhone(raw: string): string | null {
  const digitsOnly = raw.replace(/[^\d+]/g, "");

  let national: string;
  if (digitsOnly.startsWith("+60")) {
    national = digitsOnly.slice(3);
  } else if (digitsOnly.startsWith("60")) {
    national = digitsOnly.slice(2);
  } else if (digitsOnly.startsWith("0")) {
    national = digitsOnly.slice(1);
  } else {
    national = digitsOnly;
  }

  // Malaysian mobile numbers: 1 followed by 8-9 digits (01XXXXXXXX / 01XXXXXXXXX).
  if (!/^1\d{8,9}$/.test(national)) {
    return null;
  }

  return `+60${national}`;
}
