import Link from "next/link";
import { SITE } from "@/lib/site";

/**
 * SiteFooter — editorial chrome.
 *
 * Paper-backed footer with the four-column link grid intact for SEO and
 * navigation, plus an italic editorial pull-quote on the bottom strip.
 * Replaces the blue-bordered footer of the pre-redesign era.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--color-rule)] mt-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8 text-sm">
        <div className="col-span-2 lg:col-span-2">
          <p className="serif-display text-2xl mb-3">
            {SITE.name}
            <span className="text-[var(--color-accent)]">.</span>
          </p>
          <p className="text-[var(--color-ink-muted)] max-w-md leading-relaxed">
            We aggregate official visa information so you can compare options and act on real
            sources. We do not process applications and we are not legal advice.
          </p>
        </div>
        <div>
          <p className="kicker mb-3">Browse</p>
          <ul className="space-y-1.5 text-[var(--color-ink-muted)]">
            <li><Link href="/" className="hover:text-[var(--color-ink)] transition">Home</Link></li>
            <li><Link href="/finder" className="hover:text-[var(--color-ink)] transition">Where can I go?</Link></li>
            <li><Link href="/guides" className="hover:text-[var(--color-ink)] transition">Guides</Link></li>
            <li><Link href="/passport/us" className="hover:text-[var(--color-ink)] transition">By passport</Link></li>
            <li><Link href="/destination/jp" className="hover:text-[var(--color-ink)] transition">By destination</Link></li>
            <li><Link href="/services" className="hover:text-[var(--color-ink)] transition">Relocation services</Link></li>
            <li><Link href="/find-my-visa" className="hover:text-[var(--color-ink)] transition">Find my visa</Link></li>
            <li><Link href="/myths" className="hover:text-[var(--color-ink)] transition">Myths &amp; rumours</Link></li>
            <li><Link href="/chat" className="hover:text-[var(--color-ink)] transition">Ask Visavu (AI chat)</Link></li>
            <li><Link href="/consultation" className="hover:text-[var(--color-ink)] transition">Paid consultation</Link></li>
            <li><Link href="/signin" className="hover:text-[var(--color-ink)] transition">Sign in / Account</Link></li>
          </ul>
        </div>
        <div>
          <p className="kicker mb-3">About</p>
          <ul className="space-y-1.5 text-[var(--color-ink-muted)]">
            <li><Link href="/about" className="hover:text-[var(--color-ink)] transition">How it works</Link></li>
            <li><Link href="/methodology" className="hover:text-[var(--color-ink)] transition">Methodology</Link></li>
            <li><Link href="/changelog" className="hover:text-[var(--color-ink)] transition">Changelog</Link></li>
            <li><Link href="/sources" className="hover:text-[var(--color-ink)] transition">Source health</Link></li>
            <li><Link href="/contact" className="hover:text-[var(--color-ink)] transition">Contact</Link></li>
          </ul>
        </div>
        <div>
          <p className="kicker mb-3">Legal</p>
          <ul className="space-y-1.5 text-[var(--color-ink-muted)]">
            <li><Link href="/terms" className="hover:text-[var(--color-ink)] transition">Terms of Service</Link></li>
            <li><Link href="/privacy" className="hover:text-[var(--color-ink)] transition">Privacy</Link></li>
            <li><Link href="/cookies" className="hover:text-[var(--color-ink)] transition">Cookies</Link></li>
            <li><Link href="/disclaimer" className="hover:text-[var(--color-ink)] transition">Disclaimer</Link></li>
            <li><Link href="/disclosure" className="hover:text-[var(--color-ink)] transition">Affiliate disclosure</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--color-rule)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 text-xs text-[var(--color-ink-muted)] flex flex-wrap items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} {SITE.name}</span>
        </div>
      </div>
    </footer>
  );
}
