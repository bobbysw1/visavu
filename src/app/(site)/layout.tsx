import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PlausibleScript } from "@/components/PlausibleScript";
import { SocialProofBannerServer } from "@/components/SocialProofBannerServer";

// Site chrome — wraps the public pages but NOT /embed/*, /api/*, /admin/*,
// /og/*, /sitemap.xml, /robots.txt. Analytics also lives here so admin /
// embed surfaces don't get tracked.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PlausibleScript />
      {/* Skip-to-content link — visible only on keyboard focus. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:rounded focus:bg-blue-700 focus:text-white focus:font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Skip to content
      </a>
      <SiteHeader />
      {/* The wrapper carries role=main when the inner content doesn't render
          its own <main> (e.g. the homepage). Routes that DO render <main>
          internally end up double-wrapped, which is benign — only the
          outermost role=main is consumed by assistive tech. */}
      <div id="main-content" role="main" className="flex-1">{children}</div>
      <SiteFooter />
      {/* Small, dismissible insights pill — bottom-left, rotates through
          build-time-baked dataset stats + curated visa-route facts.
          Honest social proof, not fabricated user counts. No per-request
          DB work — see SocialProofBannerServer comment. */}
      <SocialProofBannerServer />
    </div>
  );
}
