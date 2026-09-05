/**
 * Slug generation per §43: lowercase, hyphenated, unique, safe for Malay
 * names (diacritics stripped), duplicates suffixed with -2, -3, etc.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Given a desired base slug and a checker function that returns whether a
 * slug is already taken, produce a guaranteed-unique slug by appending
 * -2, -3, ... as needed.
 *
 * Example: "Ahmad Plumbing Services" -> "ahmad-plumbing-services"
 *          (if taken) -> "ahmad-plumbing-services-2"
 */
export async function generateUniqueSlug(
  name: string,
  isTaken: (slug: string) => Promise<boolean>
): Promise<string> {
  const base = slugify(name) || "vendor";
  let candidate = base;
  let suffix = 2;

  while (await isTaken(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}
