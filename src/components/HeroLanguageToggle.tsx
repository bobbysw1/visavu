/**
 * Per-passport language toggle, rendered in the top-right of the hero.
 *
 * Two behaviours:
 *   1. In-house locale (ar / es / fr / pt / hi / zh / ru / id) — link to the
 *      same page with ?lang=xx. Our own translations kick in, RTL classes
 *      etc. all work because the existing LocaleSwitcher already handles
 *      this path.
 *   2. Anything else (ja / ko / th / vi / de / it / he / fa / dz / sw …) —
 *      hand off to Google Translate, which translates the whole page in
 *      the browser. No API key needed, supports 130+ languages.
 *
 * The toggle is a plain <a>. Server-rendered, no client JS bundle.
 *
 * The component is intentionally compact (chip with a globe icon) so it
 * sits inside the hero corner without competing with the H1.
 */
import Link from "next/link";
import { Languages } from "lucide-react";
import { languageFor, IN_HOUSE_LOCALES } from "@/lib/countryLanguages";

/** Build a Google-Translate URL that translates our public site into the
 *  target language without touching our codebase. `sl=auto` lets Google
 *  detect the source. */
function googleTranslateUrl(targetUrl: string, targetLang: string): string {
  return `https://translate.google.com/translate?sl=auto&tl=${encodeURIComponent(
    targetLang,
  )}&u=${encodeURIComponent(targetUrl)}`;
}

export function HeroLanguageToggle({
  iso2,
  /** The fully-qualified URL of the page hosting this toggle (used by
   *  Google Translate). The caller passes `absoluteUrl("/passport/xx")` so
   *  we don't have to read it from `headers()` inside a client boundary. */
  pageUrl,
}: {
  iso2: string;
  pageUrl: string;
}) {
  const lang = languageFor(iso2);
  if (!lang) return null;
  // Don't render a toggle on countries whose primary language is English.
  if (lang.bcp47 === "en") return null;

  const baseClass =
    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold " +
    "bg-white/95 dark:bg-neutral-900/95 backdrop-blur " +
    "ring-1 ring-black/10 dark:ring-white/10 " +
    "text-slate-800 dark:text-slate-100 " +
    "hover:bg-white hover:ring-emerald-300 dark:hover:ring-emerald-700 " +
    "shadow-sm transition";

  if (IN_HOUSE_LOCALES.has(lang.bcp47)) {
    // Internal translation. Append ?lang=xx so existing locale resolution
    // picks it up (see src/i18n/t.ts).
    return (
      <Link
        href={`?lang=${lang.bcp47}`}
        className={baseClass}
        title={`View this page in ${lang.englishName}`}
        aria-label={`View this page in ${lang.englishName}`}
      >
        <Languages size={13} aria-hidden="true" className="text-emerald-600 dark:text-emerald-400" />
        <span lang={lang.bcp47}>{lang.nativeName}</span>
      </Link>
    );
  }

  // External translation via Google Translate. Opens in a new tab so the
  // reader keeps our page intact if they want to come back.
  return (
    <a
      href={googleTranslateUrl(pageUrl, lang.bcp47)}
      target="_blank"
      rel="noreferrer noopener"
      className={baseClass}
      title={`Translate this page to ${lang.englishName} via Google Translate`}
      aria-label={`Translate this page to ${lang.englishName}`}
    >
      <Languages size={13} aria-hidden="true" className="text-emerald-600 dark:text-emerald-400" />
      <span lang={lang.bcp47}>{lang.nativeName}</span>
      <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-normal" aria-hidden="true">
        ↗
      </span>
    </a>
  );
}
