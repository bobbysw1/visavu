import type { NextConfig } from "next";

const config: NextConfig = {
  outputFileTracingRoot: __dirname,
  // PGlite (used in dev when DATABASE_URL is unset) ships a WASM binary that
  // Webpack mangles. Marking it external keeps Node loading it natively and
  // avoids "path argument must be string... received URL" at runtime.
  serverExternalPackages: ["@electric-sql/pglite", "drizzle-orm"],

  // Force-include the PGlite snapshot in every serverless function bundle.
  // Without this, Next.js's file tracer doesn't see the .tar.gz (it's read
  // via a process.cwd()-relative path, not a static import) and would
  // exclude it from the deploy.
  outputFileTracingIncludes: {
    "/**/*": ["./src/data/pglite-dump.tar.gz"],
  },

  // Clean share URLs — internally we still render the result page from the
  // /[passport]/[destination] route reading ?purpose= from the query, but
  // we expose /[passport]/[destination]/[purpose] as the canonical
  // shareable URL. Some messaging clients (WhatsApp, FB Messenger, certain
  // mail clients) strip ?-style query params during URL preview / repost,
  // which left users sharing 'visavu.com/study' with no country context.
  // A path-form URL survives every clipboard stack intact.
  async rewrites() {
    return [
      // ALPHA-2 country codes are exactly 2 chars. Purpose values are one of
      // tourism/business/transit/work/study/family/diplomatic. Match those.
      {
        source: "/:passport((?:[A-Za-z]{2}))/:destination((?:[A-Za-z]{2}))/:purpose(tourism|business|transit|work|study|family|diplomatic)",
        destination: "/:passport/:destination?purpose=:purpose",
      },
    ];
  },

  // visavu.com was a Vietnamese visa-service WordPress site (2024–early 2025)
  // before this project. Permanent 301 redirects preserve any inbound link
  // equity by routing old paths to the closest-matching new page. Paths we
  // can't sensibly redirect (WordPress system URLs) are handled by middleware
  // returning HTTP 410 Gone, which de-indexes them from Google faster than a
  // soft 404.
  async redirects() {
    return [
      // Chinese visa content → China destination page
      {
        source: "/dich-vu-lam-visa-trung-quoc",
        destination: "/destination/cn",
        permanent: true,
      },
      {
        source: "/dich-vu-lam-visa-trung-quoc/:path*",
        destination: "/destination/cn",
        permanent: true,
      },
      {
        source: "/tong-hop-tu-a-z-kinh-nghiem-thu-tuc-xin-visa-trung-quoc",
        destination: "/destination/cn",
        permanent: true,
      },
      {
        source: "/tong-hop-tu-a-z-kinh-nghiem-thu-tuc-xin-visa-trung-quoc/:path*",
        destination: "/destination/cn",
        permanent: true,
      },

      // Country categories on the old site → destination pages
      { source: "/hoa-ky", destination: "/destination/us", permanent: true },
      { source: "/hoa-ky/:path*", destination: "/destination/us", permanent: true },
      { source: "/canada", destination: "/destination/ca", permanent: true },
      { source: "/canada/:path*", destination: "/destination/ca", permanent: true },
      { source: "/brazil", destination: "/destination/br", permanent: true },
      { source: "/brazil/:path*", destination: "/destination/br", permanent: true },
      { source: "/cuba", destination: "/destination/cu", permanent: true },
      { source: "/cuba/:path*", destination: "/destination/cu", permanent: true },

      // Regional categories → home (no sensible single-country mapping)
      { source: "/chau-a", destination: "/", permanent: true },
      { source: "/chau-a/:path*", destination: "/", permanent: true },
      { source: "/chau-my", destination: "/", permanent: true },
      { source: "/chau-my/:path*", destination: "/", permanent: true },

      // Generic visa service / consulting → home (best landing for general intent)
      { source: "/dich-vu-visa", destination: "/", permanent: true },
      { source: "/dich-vu-visa/:path*", destination: "/", permanent: true },
      { source: "/goc-tu-van", destination: "/", permanent: true },
      { source: "/goc-tu-van/:path*", destination: "/", permanent: true },

      // About / team / contact / FAQ → our About page
      { source: "/about-us", destination: "/about", permanent: true },
      { source: "/about-us/:path*", destination: "/about", permanent: true },
      { source: "/team", destination: "/about", permanent: true },
      { source: "/team/:path*", destination: "/about", permanent: true },
      { source: "/faqs", destination: "/about", permanent: true },
      { source: "/faqs/:path*", destination: "/about", permanent: true },
      // /contact intentionally NOT redirected — we now have our own real
      // contact page at /contact. The previous WordPress site's contact form
      // is gone but anyone landing on /contact today should see our page.

      // WordPress defaults → home
      { source: "/hello-world", destination: "/", permanent: true },
      { source: "/hello-world/:path*", destination: "/", permanent: true },
      { source: "/uncategorized", destination: "/", permanent: true },
      { source: "/uncategorized/:path*", destination: "/", permanent: true },
      { source: "/author/:path*", destination: "/", permanent: true },
      { source: "/service", destination: "/", permanent: true },
      { source: "/service/:path*", destination: "/", permanent: true },

      // RSS feeds → home
      { source: "/feed", destination: "/", permanent: true },
      { source: "/feed/:path*", destination: "/", permanent: true },
      { source: "/comments/feed", destination: "/", permanent: true },
      { source: "/comments/feed/:path*", destination: "/", permanent: true },
    ];
  },

  async headers() {
    return [
      {
        // Embeddable result cards must be iframe-able from any site.
        // The default project headers (X-Frame-Options: DENY equivalent, plus
        // CSP frame-ancestors) would block this; override only for /embed/*.
        source: "/embed/:path*",
        headers: [
          { key: "X-Frame-Options", value: "ALLOWALL" },
          { key: "Content-Security-Policy", value: "frame-ancestors *;" },
        ],
      },
    ];
  },
};

export default config;
