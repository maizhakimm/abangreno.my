/**
 * Basic keyword spam filter for guest forum posts/replies.
 * This is a first line of defense only — flagged content still goes to
 * manual moderation, it is never auto-deleted (see project constraint §22/§55).
 */
const SPAM_KEYWORDS = [
  "casino",
  "judi",
  "slot",
  "betting",
  "gambling",
  "loan spam",
  "pinjaman segera", // common Malay loan-spam phrasing
  "viagra",
  "adult",
  "porn",
];

export function containsSpamKeywords(text: string): boolean {
  const normalized = text.toLowerCase();
  return SPAM_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

/**
 * Decide the initial moderation status for a new guest forum submission.
 *
 * Rules (per §22):
 *  - Any spam keyword hit -> 'flagged' (never silently removed)
 *  - First submission from a new ip_hash -> 'pending' (manual review)
 *  - Clean history (has prior visible posts from same ip_hash) -> 'visible'
 */
export function decideInitialStatus(params: {
  hasSpamKeyword: boolean;
  hasPriorVisiblePostsFromIp: boolean;
}): "pending" | "visible" | "flagged" {
  if (params.hasSpamKeyword) return "flagged";
  if (!params.hasPriorVisiblePostsFromIp) return "pending";
  return "visible";
}
