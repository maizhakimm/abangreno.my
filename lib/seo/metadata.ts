import type { Metadata } from "next";

export const SITE_NAME = "AbangReno.my";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://abangreno.my";

interface BuildMetadataParams {
  title: string;
  description: string;
  path: string;
  imageUrl?: string;
}

/** Central metadata builder — guarantees canonical URL + OpenGraph on every page. */
export function buildMetadata({
  title,
  description,
  path,
  imageUrl,
}: BuildMetadataParams): Metadata {
  const url = `${SITE_URL}${path}`;

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "ms_MY",
      type: "website",
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export function categoryTitle(categoryName: string) {
  return `${categoryName} Berdekatan Anda`;
}

export function categoryLocationTitle(categoryName: string, locationName: string) {
  return `${categoryName} di ${locationName}`;
}
