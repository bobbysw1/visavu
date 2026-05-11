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
