// Some user agents (Edge, older Safari, Slack-bot, certain RSS readers) auto-
// request /favicon.ico even when a <link rel="icon" href="/icon.svg"> is
// present. Without this handler that request 404s. We serve the same SVG mark
// — modern parsers render it fine; the stricter ones gracefully fall back.
//
// The actual modern icon links are emitted from app/icon.svg, app/apple-icon
// and app/manifest — this exists only to silence the legacy /favicon.ico hit.
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const revalidate = false;

export async function GET() {
  const svg = await readFile(join(process.cwd(), "src/app/icon.svg"));
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
