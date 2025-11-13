import { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.PUBLIC_SITE_URL ||
  "https://hypehatchevents.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteUrl;
  const now = new Date();

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    // Note: Admin routes are excluded as they're in robots.txt disallow
  ];
}

