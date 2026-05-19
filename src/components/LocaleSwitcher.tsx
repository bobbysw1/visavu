"use client";

/**
 * "Translate this page" — simplified header widget.
 *
 * The previous version tried to switch the ?lang= URL param to apply our
 * in-house i18n message tables, which were "partial" / "stub" for most
 * locales — meaning users picking a language saw English content with a
 * "partial translation" footnote. Misleading + broken.
 *
 * This version just hands off to Google Translate's *.translate.goog proxy,
 * which translates the live page in the user's browser, supports 130+
 * languages, requires no API key, and survives without our backend doing
 * anything. Same approach as HeroLanguageToggle.tsx.
 *
 * The page itself stays `<html lang="en">`, so Chrome's built-in translate
 * prompt continues to trigger automatically for non-English-speaking
 * visitors. This widget is the manual escape hatch when the auto-prompt
 * isn't fired (e.g. Brave / Firefox / Edge / Safari users, or anyone who
 * dismissed the Chrome banner once).
 */
import { useEffect, useRef, useState } from "react";
import { Globe } from "lucide-react";

// Short curated list of the most-requested translation targets — every option
// works because we hand off to Google Translate, which speaks all of them.
// English is excluded (the page is already English).
const TARGET_LANGS: Array<{ code: string; native: string; englishName: string }> = [
  { code: "es", native: "Español", englishName: "Spanish" },
  { code: "fr", native: "Français", englishName: "French" },
  { code: "de", native: "Deutsch", englishName: "German" },
  { code: "it", native: "Italiano", englishName: "Italian" },
  { code: "pt", native: "Português", englishName: "Portuguese" },
  { code: "ru", native: "Русский", englishName: "Russian" },
  { code: "zh-CN", native: "简体中文", englishName: "Chinese (Simplified)" },
  { code: "ja", native: "日本語", englishName: "Japanese" },
  { code: "ko", native: "한국어", englishName: "Korean" },
  { code: "hi", native: "हिन्दी", englishName: "Hindi" },
  { code: "ar", native: "العربية", englishName: "Arabic" },
  { code: "tr", native: "Türkçe", englishName: "Turkish" },
];

/** Build the Google Translate *.translate.goog proxy URL for the current page.
 *  This format actually translates the live page (the legacy
 *  `translate.google.com/translate?u=...` was deprecated and just shows
 *  Google's own "enter a URL" landing). */
function translateProxyUrl(currentHref: string, targetLang: string): string {
  try {
    const u = new URL(currentHref);
    // visavu.com → visavu-com.translate.goog
    const proxyHost = `${u.hostname.replace(/\./g, "-")}.translate.goog`;
    const path = `${u.pathname}${u.search ?? ""}`;
    const sep = u.search ? "&" : "?";
    return `https://${proxyHost}${path}${sep}_x_tr_sl=en&_x_tr_tl=${encodeURIComponent(targetLang)}&_x_tr_hl=${encodeURIComponent(targetLang)}`;
  } catch {
    // Fallback to the Google Translate landing page with the URL prefilled.
    return `https://translate.google.com/translate?sl=en&tl=${encodeURIComponent(targetLang)}&u=${encodeURIComponent(currentHref)}`;
  }
}

export function LocaleSwitcher() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const [currentHref, setCurrentHref] = useState<string>("");

  // Capture window.location at open-time (avoid SSR mismatch by deferring to mount).
  useEffect(() => {
    if (typeof window !== "undefined") setCurrentHref(window.location.href);
  }, []);
  // Refresh href whenever the dropdown opens (handles client-side nav).
  useEffect(() => {
    if (open && typeof window !== "undefined") setCurrentHref(window.location.href);
  }, [open]);

  // Close on outside click + Escape.
  useEffect(() => {
    if (!open) return;
    const click = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", click);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", click);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-rule)] bg-[var(--color-paper)] px-2 py-1 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-muted)]/60 transition"
        aria-expanded={open}
        aria-haspopup="listbox"
        title="Translate this page"
        aria-label="Translate this page"
      >
        <Globe size={12} aria-hidden />
        <span>Translate</span>
        <span aria-hidden className="text-[10px] text-[var(--color-ink-muted)]">▾</span>
      </button>
      {open && currentHref && (
        <div
          role="listbox"
          aria-label="Translate this page to…"
          className="absolute right-0 z-50 mt-1 w-[14rem] rounded-md border border-[var(--color-rule)] bg-[var(--color-paper-elev)] shadow-lg overflow-hidden"
        >
          <div className="px-3 py-2 border-b border-[var(--color-rule)] text-[11px] text-[var(--color-ink-muted)]">
            Translate this page to…
          </div>
          <ul className="max-h-[18rem] overflow-y-auto">
            {TARGET_LANGS.map((l) => (
              <li key={l.code}>
                <a
                  href={translateProxyUrl(currentHref, l.code)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex items-baseline justify-between gap-2 px-3 py-2 text-xs hover:bg-[var(--color-muted)]/60 text-[var(--color-ink)]"
                  title={`Open this page translated to ${l.englishName} via Google Translate`}
                >
                  <span lang={l.code} className="font-medium">{l.native}</span>
                  <span className="text-[10px] text-[var(--color-ink-muted)]">{l.englishName}</span>
                </a>
              </li>
            ))}
            <li className="border-t border-[var(--color-rule)] mt-1">
              <a
                href={`https://translate.google.com/translate?sl=en&u=${encodeURIComponent(currentHref)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-xs text-[var(--color-ink)] hover:bg-[var(--color-muted)]/60"
              >
                <span className="font-medium">Other languages →</span>
                <span className="block text-[10px] text-[var(--color-ink-muted)] mt-0.5">
                  Open in Google Translate (130+ languages)
                </span>
              </a>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
