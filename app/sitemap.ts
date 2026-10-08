import type { MetadataRoute } from "next";
import { BUSINESS } from "./site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: BUSINESS.url, changeFrequency: "monthly", priority: 1 }];
}
