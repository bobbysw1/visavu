/**
 * RSS 2.0 feed for visa-policy updates at /updates.xml.
 *
 * Subscribers (feed readers, email-digest tools, custom Slack
 * webhooks) get push-style notification of catalogue changes without
 * needing a Visavu account. RSS is the lowest-friction notification
 * surface — no signup, works with every reader since 2002.
 *
 * Data source: src/data/recent_updates.json, regenerated nightly by
 * the buildRecentUpdates script. One <item> per update entry, oldest
 * → newest at the bottom, with the GitHub commit URL as the
 * <guid> so feed readers de-dupe correctly across regenerations.
 *
 * Discovery: src/app/layout.tsx adds an <link rel="alternate"
 * type="application/rss+xml"> pointing here so browsers + RSS-aware
 * tools auto-detect the feed.
 */
import data from "@/data/recent_updates.json";
import { SITE, absoluteUrl } from "@/lib/site";
import { nameFor } from "@/lib/countries";

type Update = {
  kind: "adapter_change" | "new_adapter" | "fee_correction";
  date: string;
  destinationIso2: string | null;
  destinationName: string | null;
  title: string;
  detail: string;
  sourceSha?: string;
};

type Payload = {
  generatedAt: string;
  windowDays: number;
  updates: Update[];
};

const KIND_LABEL: Record<Update["kind"], string> = {
  adapter_change: "Catalogue updated",
  new_adapter: "New destination",
  fee_correction: "Fee corrected",
};

// XML-safe escape for &, <, >, ", '. Conservative — RSS readers vary
// in how strictly they enforce, so encode the full set.
function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function rfc822(iso: string): string {
  // RSS spec requires RFC-822 dates. Date.toUTCString() emits the
  // close-enough form ("Wed, 02 Jun 2026 12:00:00 GMT") that every
  // reader accepts.
  return new Date(iso).toUTCString();
}

export const dynamic = "force-static";
export const revalidate = 3600; // 1h cache — feed readers poll hourly typically

export function GET() {
  const payload = data as Payload;
  const items = [...payload.updates].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  const channelLink = absoluteUrl("/updates");
  const feedLink = absoluteUrl("/updates.xml");
  const lastBuild = rfc822(payload.generatedAt);

  const itemsXml = items
    .map((u) => {
      const destLink = u.destinationIso2
        ? absoluteUrl(`/destination/${u.destinationIso2.toLowerCase()}`)
        : channelLink;
      const guidValue = u.sourceSha
        ? `https://github.com/bobbysw1/visavu/commit/${u.sourceSha}`
        : `${channelLink}#${u.date}-${u.title.slice(0, 30).replace(/\s+/g, "-")}`;
      const titlePrefix = u.destinationIso2
        ? `[${u.destinationIso2}] `
        : "";
      const title = `${titlePrefix}${u.title}`;
      const description = `${KIND_LABEL[u.kind]}${u.destinationName ? ` — ${nameFor(u.destinationIso2!)}` : ""}. ${u.detail}`;
      return `    <item>
      <title>${xmlEscape(title)}</title>
      <link>${xmlEscape(destLink)}</link>
      <guid isPermaLink="${u.sourceSha ? "true" : "false"}">${xmlEscape(guidValue)}</guid>
      <pubDate>${rfc822(u.date)}</pubDate>
      <description>${xmlEscape(description)}</description>
      <category>${xmlEscape(KIND_LABEL[u.kind])}</category>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(SITE.name)} — Visa policy updates</title>
    <link>${xmlEscape(channelLink)}</link>
    <atom:link href="${xmlEscape(feedLink)}" rel="self" type="application/rss+xml" />
    <description>${xmlEscape(`Rolling ${payload.windowDays}-day digest of visa-fee corrections, new visa programmes, and catalogue expansions on ${SITE.name}.`)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <ttl>60</ttl>
${itemsXml}
  </channel>
</rss>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      // 1h cache on Vercel's edge, browsers re-validate
      "cache-control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
