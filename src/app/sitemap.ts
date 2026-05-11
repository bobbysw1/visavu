import type { MetadataRoute } from "next";
import { COUNTRY_LIST } from "@/lib/countries";
import { SITE } from "@/lib/site";

// One chunk per origin passport — keeps each sitemap well under Google's 50k
// URL limit and lets crawlers prioritize popular origins.
export async function generateSitemaps() {
  return COUNTRY_LIST.map((_, i) => ({ id: i }));
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const origin = COUNTRY_LIST[id];
  if (!origin) return [];

  const lastModified = new Date();
  const entries: MetadataRoute.Sitemap = [];

  // Origin's passport index page (only emitted in chunk 0 for the home + chunk i for each origin).
  if (id === 0) {
    entries.push(
      { url: `${SITE.url}/`, lastModified, changeFrequency: "weekly", priority: 1.0 },
      { url: `${SITE.url}/about`, lastModified, changeFrequency: "monthly", priority: 0.4 },
      { url: `${SITE.url}/sources`, lastModified, changeFrequency: "monthly", priority: 0.4 },
      { url: `${SITE.url}/disclaimer`, lastModified, changeFrequency: "monthly", priority: 0.3 },
    );
  }

  // Passport and destination index for this country.
  entries.push(
    {
      url: `${SITE.url}/passport/${origin.iso2.toLowerCase()}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE.url}/destination/${origin.iso2.toLowerCase()}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  );

  // All passport→destination pages from this origin. Skip identity (X→X).
  for (const dest of COUNTRY_LIST) {
    if (dest.iso2 === origin.iso2) continue;
    entries.push({
      url: `${SITE.url}/${origin.iso2.toLowerCase()}/${dest.iso2.toLowerCase()}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  return entries;
}
