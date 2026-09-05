import { SITE_URL } from "./metadata";
import type { Category, ForumPost, ForumReply, Location, Vendor } from "@/types/database";

/**
 * All builders below only include fields that actually exist on the record
 * (per §33: "Do not add fake structured data"). Callers should omit optional
 * blocks (e.g. AggregateRating) entirely when there's no underlying data.
 */

export function breadcrumbListJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function vendorJsonLd(vendor: Vendor, category?: Category | null, areas?: Location[]) {
  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: vendor.business_name,
    url: `${SITE_URL}/vendor/${vendor.slug}`,
    description: vendor.description ?? undefined,
    image: vendor.profile_picture_url ?? undefined,
    telephone: vendor.phone ?? undefined,
    areaServed: areas?.map((a) => a.name) ?? undefined,
  };

  if (category) {
    base.additionalType = category.name;
  }

  if (vendor.total_reviews > 0) {
    base.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: vendor.avg_rating,
      reviewCount: vendor.total_reviews,
    };
  }

  return base;
}

export function categoryCollectionJsonLd(params: {
  name: string;
  description: string;
  path: string;
  vendorSlugs: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: params.name,
    description: params.description,
    url: `${SITE_URL}${params.path}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: params.vendorSlugs.map((slug, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE_URL}/vendor/${slug}`,
      })),
    },
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  if (faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function forumThreadJsonLd(post: ForumPost, replies: ForumReply[]) {
  const visibleReplies = replies.filter((r) => r.status === "visible");

  return {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: post.title,
      text: post.content,
      answerCount: visibleReplies.length,
      dateCreated: post.created_at,
      suggestedAnswer: visibleReplies.map((reply) => ({
        "@type": "Answer",
        text: reply.content,
        dateCreated: reply.created_at,
      })),
    },
  };
}
