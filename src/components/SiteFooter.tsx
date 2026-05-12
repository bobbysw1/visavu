import Link from "next/link";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 mt-16">
      <div className="mx-auto max-w-6xl px-4 py-10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8 text-sm">
        <div className="col-span-2 lg:col-span-2">
          <p className="font-semibold mb-2">{SITE.name}</p>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-md">
            We aggregate official visa information so you can compare options and act on real
            sources. We do not process applications and we are not legal advice.
          </p>
        </div>
        <div>
          <p className="font-semibold mb-2">Browse</p>
          <ul className="space-y-1.5 text-neutral-600 dark:text-neutral-400">
            <li><Link href="/" className="hover:underline">Home</Link></li>
            <li><Link href="/finder" className="hover:underline">Where can I go?</Link></li>
            <li><Link href="/guides" className="hover:underline">Guides</Link></li>
            <li><Link href="/passport/us" className="hover:underline">By passport</Link></li>
            <li><Link href="/destination/jp" className="hover:underline">By destination</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold mb-2">About</p>
          <ul className="space-y-1.5 text-neutral-600 dark:text-neutral-400">
            <li><Link href="/about" className="hover:underline">How it works</Link></li>
            <li><Link href="/methodology" className="hover:underline">Methodology</Link></li>
            <li><Link href="/changelog" className="hover:underline">Changelog</Link></li>
            <li><Link href="/sources" className="hover:underline">Source health</Link></li>
            <li><Link href="/contact" className="hover:underline">Contact</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold mb-2">Legal</p>
          <ul className="space-y-1.5 text-neutral-600 dark:text-neutral-400">
            <li><Link href="/terms" className="hover:underline">Terms of Service</Link></li>
            <li><Link href="/privacy" className="hover:underline">Privacy</Link></li>
            <li><Link href="/cookies" className="hover:underline">Cookies</Link></li>
            <li><Link href="/disclaimer" className="hover:underline">Disclaimer</Link></li>
            <li><Link href="/disclosure" className="hover:underline">Affiliate disclosure</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-neutral-500 flex flex-wrap items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} {SITE.name}</span>
          <span>
            A valid visa permits entry subject to officer discretion. Always confirm with the
            destination&apos;s embassy before travel.
          </span>
        </div>
      </div>
    </footer>
  );
}
