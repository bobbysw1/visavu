import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// Bulk AI-training crawlers don't drive any traffic back — they just
// download every page they can find to build training datasets. With
// ~235k unique URLs on this site, these bots are the most likely cause
// of runaway bandwidth usage. Blocking them has no SEO impact
// (Googlebot/Bingbot are untouched below).
//
// Deliberately NOT blocked: OAI-SearchBot, PerplexityBot, Perplexity-User,
// ChatGPT-User, ClaudeBot. These fetch pages live in response to a user's
// question, so blocking them would stop AI assistants from citing/
// referencing this site for visa questions. They're low-volume (one fetch
// per real question asked), so they're not meaningful bandwidth drivers.
const AI_SCRAPER_BOTS = [
  "GPTBot",
  "anthropic-ai",
  "Claude-Web",
  "CCBot",
  "Bytespider",
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
