import { ImageResponse } from "next/og";
import { COUNTRY_LIST, flagEmoji, nameFor } from "@/lib/countries";
import { SITE } from "@/lib/site";

export const runtime = "edge";

const PURPOSE_LABEL: Record<string, string> = {
  tourism: "Tourism",
  business: "Business",
  transit: "Transit",
  work: "Work",
  study: "Study",
  family: "Family",
};

// Satori (the OG image renderer used by next/og) requires `display: flex` on
// every div with more than one child, and disallows arbitrary inline text
// composition. We pre-build all strings and use display: flex throughout.
//
// Supported query shapes:
//   ?from=US&to=JP&purpose=tourism   — pair card
//   ?passport=US                      — passport-rankings card
//   ?destination=JP                   — destination card
//   ?title=...&kicker=...             — generic article / guide card
//   (none)                            — default Visavu site card
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = (searchParams.get("from") ?? "").toUpperCase();
  const to = (searchParams.get("to") ?? "").toUpperCase();
  const purpose = searchParams.get("purpose") ?? "tourism";
  const passport = (searchParams.get("passport") ?? "").toUpperCase();
  const destination = (searchParams.get("destination") ?? "").toUpperCase();
  const title = searchParams.get("title");
  const kicker = searchParams.get("kicker");

  const fromValid = COUNTRY_LIST.some((c) => c.iso2 === from);
  const toValid = COUNTRY_LIST.some((c) => c.iso2 === to);
  const passportValid = COUNTRY_LIST.some((c) => c.iso2 === passport);
  const destValid = COUNTRY_LIST.some((c) => c.iso2 === destination);

  let headline: string;
  let subhead: string;
  let flagsRow: string;
  let kickerText: string;

  if (fromValid && toValid) {
    headline = `${nameFor(from)} → ${nameFor(to)}`;
    subhead = `Visa requirements for ${PURPOSE_LABEL[purpose] ?? "Tourism"}`;
    flagsRow = `${flagEmoji(from)}    →    ${flagEmoji(to)}`;
    kickerText = "Visa requirements";
  } else if (passportValid) {
    headline = `${nameFor(passport)} passport`;
    subhead = "Where can you go? Visa rules for every destination.";
    flagsRow = flagEmoji(passport);
    kickerText = "Passport guide";
  } else if (destValid) {
    headline = `Visiting ${nameFor(destination)}`;
    subhead = "Visa requirements for every passport.";
    flagsRow = flagEmoji(destination);
    kickerText = "Destination guide";
  } else if (title) {
    headline = title.slice(0, 90);
    subhead = SITE.tagline;
    flagsRow = "🛂";
    kickerText = kicker ?? SITE.name;
  } else {
    headline = SITE.name;
    subhead = SITE.tagline;
    flagsRow = "🛂";
    kickerText = "Visa & relocation guidance";
  }

  const hostname = SITE.url.replace(/^https?:\/\//, "");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #ecfdf5 0%, #eff6ff 50%, #fdf4ff 100%)",
          padding: "60px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, color: "#047857", fontWeight: 700, letterSpacing: "-0.01em" }}>
          🛂 &nbsp;{SITE.name}
          <span style={{ display: "flex", marginLeft: 24, color: "#64748b", fontWeight: 500, fontSize: 24, textTransform: "uppercase", letterSpacing: "0.18em" }}>
            {kickerText}
          </span>
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
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
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
