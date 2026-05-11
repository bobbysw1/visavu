/**
 * oEmbed discovery endpoint.
 *
 *   GET /api/oembed?url=https://visavu.com/de/jp?purpose=tourism
 *
 * Returns a `rich` oEmbed JSON response with an iframe pointing at our
 * /embed/[passport]/[destination] route. Travel blogs, CMSs, and aggregators
 * that auto-detect oEmbed (Substack, WordPress, Notion, Medium) can embed
 * a result card by pasting the public URL.
 *
 * The result card page also advertises this discovery endpoint via a
 * <link rel="alternate" type="application/json+oembed" href="..." /> tag.
 */
import { NextResponse } from "next/server";
import { COUNTRY_LIST, nameFor } from "@/lib/countries";
import { isValidPurpose, type Purpose, PURPOSE_LABEL } from "@/lib/types";
import { SITE, absoluteUrl } from "@/lib/site";

const VALID_FORMATS = new Set(["json", "xml"]);

function parseTargetUrl(url: string): {
  passport: string;
  destination: string;
  purpose: Purpose;
} | null {
  try {
    const parsed = new URL(url);
    // Accept both production and arbitrary hostnames (so development links work);
    // we only care about the path segments.
    const segments = parsed.pathname.split("/").filter(Boolean);
    if (segments.length !== 2) return null;
    const passport = segments[0].toUpperCase();
    const destination = segments[1].toUpperCase();
    if (!COUNTRY_LIST.some((c) => c.iso2 === passport)) return null;
    if (!COUNTRY_LIST.some((c) => c.iso2 === destination)) return null;
    const purposeParam = parsed.searchParams.get("purpose");
    const purpose: Purpose =
      purposeParam && isValidPurpose(purposeParam) ? purposeParam : "tourism";
    return { passport, destination, purpose };
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const target = url.searchParams.get("url");
  const format = (url.searchParams.get("format") ?? "json").toLowerCase();
  const maxWidth = parseInt(url.searchParams.get("maxwidth") ?? "640", 10) || 640;
  const maxHeight = parseInt(url.searchParams.get("maxheight") ?? "560", 10) || 560;

  if (!target) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }
  if (!VALID_FORMATS.has(format)) {
    return NextResponse.json({ error: "Unsupported format" }, { status: 501 });
  }
  // Per spec, only json is required; xml support is optional.
  if (format === "xml") {
    return NextResponse.json({ error: "XML not supported" }, { status: 501 });
  }

  const parsed = parseTargetUrl(target);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid or unsupported URL" }, { status: 404 });
  }

  const embedUrl = absoluteUrl(
    `/embed/${parsed.passport.toLowerCase()}/${parsed.destination.toLowerCase()}?purpose=${parsed.purpose}`,
  );
  const title = `${nameFor(parsed.passport)} → ${nameFor(parsed.destination)} (${PURPOSE_LABEL[parsed.purpose]})`;

  const html = `<iframe src="${embedUrl}" width="${maxWidth}" height="${maxHeight}" frameborder="0" loading="lazy" referrerpolicy="no-referrer-when-downgrade" style="border:0;width:100%;max-width:${maxWidth}px;" title="${title.replace(/"/g, "&quot;")}"></iframe>`;

  return NextResponse.json({
    version: "1.0",
    type: "rich",
    provider_name: SITE.name,
    provider_url: SITE.url,
    title,
    html,
    width: maxWidth,
    height: maxHeight,
    cache_age: 60 * 60 * 24, // 24h cache hint
  });
}
