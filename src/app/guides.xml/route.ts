import { guidesByDate } from "@/content/guides";
import { absoluteUrl, SITE } from "@/lib/site";

export const revalidate = 3600;

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const guides = guidesByDate();
  const lastBuildDate = new Date().toUTCString();
  const latest = guides[0]?.frontmatter.publishedAt;

  const items = guides
    .map((g) => {
      const link = absoluteUrl(`/guides/${g.frontmatter.slug}`);
      const pubDate = new Date(g.frontmatter.publishedAt).toUTCString();
      return `
    <item>
      <title>${xmlEscape(g.frontmatter.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${xmlEscape(g.frontmatter.summary)}</description>
      ${g.frontmatter.tags.map((t) => `<category>${xmlEscape(t)}</category>`).join("\n      ")}
    </item>`;
    })
    .join("");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(SITE.name)} — Guides</title>
    <link>${absoluteUrl("/guides")}</link>
    <atom:link href="${absoluteUrl("/guides.xml")}" rel="self" type="application/rss+xml" />
    <description>Editorial guides on visa policies that affect travellers worldwide.</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    ${latest ? `<pubDate>${new Date(latest).toUTCString()}</pubDate>` : ""}
    ${items}
  </channel>
</rss>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
