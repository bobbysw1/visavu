import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// AI-training crawlers don't drive search traffic — they just download every
// page they can find for model training. With ~235k unique URLs on this
// site, these bots are the most likely cause of runaway bandwidth usage.
// Blocking them has no SEO impact (Googlebot/Bingbot are untouched below).
const AI_SCRAPER_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "CCBot",
  "Bytespider",
  "PerplexityBot",
  "Perplexity-User",
  "Amazonbot",
  "Applebot-Extended",
  "Google-Extended",
  "Meta-ExternalAgent",
  "Meta-ExternalFetcher",
  "FacebookBot",
  "Diffbot",
  "ImagesiftBot",
  "Timpibot",
  "Bytedance",
  "YouBot",
  "Cohere-ai",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/"],
      },
      ...AI_SCRAPER_BOTS.map((userAgent) => ({
        userAgent,
        disallow: "/",
      })),
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
