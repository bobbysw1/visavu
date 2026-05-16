import type { Metadata, Viewport } from "next";
import { Inter, Newsreader } from "next/font/google";
import "./globals.css";
import { SITE, absoluteUrl } from "@/lib/site";

// Inter — the cleanest neutral sans-serif for content sites. Loaded via the
// Next font system so it's self-hosted, eliminates layout shift, and the
// preconnect tags are added automatically.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// Newsreader — open-source serif from Production Type. Used on long-form
// surfaces (/guides/[slug], /methodology, About) to give the editorial
// content a distinctly different visual register from the lookup tool.
const newsreader = Newsreader({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-newsreader",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

// Root layout — minimal HTML wrapper only. Site chrome (header/footer) lives
// in the `(site)` route group so /embed/* and /admin/* render chrome-less.
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name }],
  robots: { index: true, follow: true },
  // Google Search Console verification — token comes from Vercel env var.
  // Add GOOGLE_SITE_VERIFICATION in Vercel → Settings → Environment Variables.
  // Until set, the meta tag is omitted (rather than rendering an empty value
  // which Google rejects).
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    url: SITE.url,
    locale: "en_US",
    images: [
      {
        url: absoluteUrl("/og"),
        width: 1200,
        height: 630,
        alt: `${SITE.name} — ${SITE.tagline}`,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE.twitter,
    title: SITE.name,
    description: SITE.description,
    images: [absoluteUrl("/og")],
  },
  alternates: {
    canonical: absoluteUrl("/"),
    languages: { en: absoluteUrl("/") },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${newsreader.variable}`}>
      <body className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
