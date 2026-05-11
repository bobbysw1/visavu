import { ImageResponse } from "next/og";
import { COUNTRY_LIST, flagEmoji, nameFor } from "@/lib/countries";
import { SITE } from "@/lib/site";

export const runtime = "edge";

const PURPOSE_LABEL: Record<string, string> = {
  tourism: "Tourism",
  business: "Business",
  transit: "Transit",
};

// Satori (the OG image renderer used by next/og) requires `display: flex` on
// every div with more than one child, and disallows arbitrary inline text
// composition. We pre-build all strings and use display: flex throughout.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = (searchParams.get("from") ?? "").toUpperCase();
  const to = (searchParams.get("to") ?? "").toUpperCase();
  const purpose = searchParams.get("purpose") ?? "tourism";

  const fromValid = COUNTRY_LIST.some((c) => c.iso2 === from);
  const toValid = COUNTRY_LIST.some((c) => c.iso2 === to);

  const headline =
    fromValid && toValid ? `${nameFor(from)} → ${nameFor(to)}` : SITE.name;
  const subhead =
    fromValid && toValid
      ? `Visa requirements for ${PURPOSE_LABEL[purpose] ?? "Tourism"}`
      : SITE.tagline;
  const flagsRow =
    fromValid && toValid ? `${flagEmoji(from)}    →    ${flagEmoji(to)}` : "🛂";
  const hostname = SITE.url.replace(/^https?:\/\//, "");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)",
          padding: "60px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, color: "#475569", fontWeight: 600 }}>
          🛂 &nbsp;{SITE.name}
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", fontSize: 96, marginBottom: 24 }}>{flagsRow}</div>
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 700,
              color: "#0f172a",
              marginBottom: 12,
            }}
          >
            {headline}
          </div>
          <div style={{ display: "flex", fontSize: 32, color: "#475569" }}>{subhead}</div>
        </div>

        <div style={{ display: "flex", color: "#64748b", fontSize: 22 }}>
          Sourced. Dated. Linked to primary source. &nbsp;·&nbsp; {hostname}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
