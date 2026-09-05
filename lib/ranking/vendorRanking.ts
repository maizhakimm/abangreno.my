import type { Vendor } from "@/types/database";

/**
 * Transparent, weighted vendor ranking score — intentionally NOT ML-based.
 * Higher score = higher placement in category/location listings.
 *
 * Weights are tunable constants below. SSM verification and profile quality
 * are weighted deliberately higher than raw star rating so that new,
 * verified vendors aren't buried under old vendors with a handful of reviews.
 */
const WEIGHTS = {
  ssmVerified: 25,
  profileCompleteness: 20, // scaled 0-100 -> 0-20
  galleryImages: 10, // capped contribution
  avgRating: 20, // scaled 0-5 -> 0-20
  reviewVolume: 10, // logarithmic, capped
  recentActivity: 10,
  forumContributions: 5,
};

export interface RankingInput {
  vendor: Pick<
    Vendor,
    "verification_status" | "profile_completeness" | "avg_rating" | "total_reviews" | "updated_at"
  >;
  galleryImageCount: number;
  forumReplyCount: number;
  serviceAreaRelevance: number; // 1 if vendor explicitly serves the queried location, else a decayed value
}

export function computeVendorRankingScore(input: RankingInput): number {
  const { vendor, galleryImageCount, forumReplyCount, serviceAreaRelevance } = input;

  const ssmScore = vendor.verification_status === "verified_ssm" ? WEIGHTS.ssmVerified : 0;

  const completenessScore =
    (Math.min(Math.max(vendor.profile_completeness, 0), 100) / 100) * WEIGHTS.profileCompleteness;

  const galleryScore = Math.min(galleryImageCount / 6, 1) * WEIGHTS.galleryImages;

  const ratingScore = (Math.min(Math.max(vendor.avg_rating, 0), 5) / 5) * WEIGHTS.avgRating;

  // log scale so a vendor with 200 reviews doesn't drown out one with 15
  const reviewVolumeScore =
    Math.min(Math.log10(vendor.total_reviews + 1) / Math.log10(101), 1) * WEIGHTS.reviewVolume;

  const daysSinceUpdate =
    (Date.now() - new Date(vendor.updated_at).getTime()) / (1000 * 60 * 60 * 24);
  const recentActivityScore = Math.max(0, 1 - daysSinceUpdate / 90) * WEIGHTS.recentActivity;

  const forumScore = Math.min(forumReplyCount / 10, 1) * WEIGHTS.forumContributions;

  const baseScore =
    ssmScore +
    completenessScore +
    galleryScore +
    ratingScore +
    reviewVolumeScore +
    recentActivityScore +
    forumScore;

  return baseScore * Math.min(Math.max(serviceAreaRelevance, 0), 1);
}

export function sortVendorsByRanking<T extends RankingInput & { vendor: Vendor }>(
  items: T[]
): (T & { rankingScore: number })[] {
  return items
    .map((item) => ({ ...item, rankingScore: computeVendorRankingScore(item) }))
    .sort((a, b) => b.rankingScore - a.rankingScore);
}
