# Locale-prefixed routes + real i18n — migration roadmap

## Why this isn't shipped yet

Half-translated sites are SEO-negative — Google penalises mixed-language pages, and users bounce when navigation labels are English but article body is Spanish (or vice versa). The choice is binary: ship a fully-translated set of locales, or ship nothing and stay English-only with a clean signal.

The existing scaffolding (two parallel systems — `src/i18n/t.ts` and `src/lib/i18n/`) is half of the work. The remaining half is structural and bigger.

## Current state

| Layer | Status |
|---|---|
| Translation files | `src/i18n/{en,es,fr,pt,ar,hi,zh,ru,id}.json` exist with ~44 strings each (status / purpose labels). |
| Translation helper | `src/i18n/t.ts` resolves locale from `?lang=` query / Accept-Language / default `en`. Server-side. |
| Locale picker UI | `<LocaleSwitcher />` was hidden site-wide on 2026-05-16 because translation coverage was only ~44 strings against a fully English UI. |
| URL-prefixed routes (`/es/`, `/fr/`) | **Not built**. All routes are flat under `(site)/`. |
| hreflang clusters | **Not emitted**. Sitemap is single-language. |
| `<html lang>` per locale | Set to `"en"` globally. |
| Locale cookie persistence | Implemented in the switcher but UI is hidden. |
| Country-name translations | Not done — country names hard-coded English. |

## What "done" looks like

1. **Routes**: every page accessible at `/`, `/es/`, `/fr/`, `/de/`, `/pt/`, `/zh/` (or whatever target set is). 
2. **`<html lang>`**: emitted dynamically per locale.
3. **Sitemap**: reciprocal hreflang clusters per page (`<xhtml:link rel="alternate" hreflang="es" href="..." />`).
4. **Strings**: every visible UI string translated for every supported locale (~500 strings, not just the 44 currently).
5. **Country names**: lookup table per locale (`{ "FR": { en: "France", es: "Francia", fr: "France", ... } }`).
6. **Date/number formatting**: per-locale via `Intl.NumberFormat` / `Intl.DateTimeFormat`.
7. **RTL support**: Arabic / Hebrew need `dir="rtl"` plus mirrored layout for the navigation.

## Recommended path

### Phase A — Pick the tooling
Options:
- **next-intl** (most popular, app-router-native, great DX). Add as a dep.
- **next-i18next** (older, pages-router heritage; less aligned with current app router).

**Recommendation: `next-intl`.**

### Phase B — Restructure routes under `[locale]`
Move `src/app/(site)/*` → `src/app/[locale]/(site)/*`. Add a `middleware.ts` that:
- Detects locale from URL prefix
- Falls back to Accept-Language header
- Defaults to `en` and rewrites `/` → English content
- Persists choice in a cookie

This is the substantial structural change — every page module reads `params.locale`, every internal link includes the prefix, every absolute URL in JSON-LD includes the prefix.

### Phase C — Translate the strings
- Expand `src/i18n/<locale>.json` to ~500 strings covering navigation, headings, status labels, form copy, error messages.
- Use a human translator or a professional service (DeepL Pro, Crowdin). DO NOT machine-translate without review — visa terminology is technical and small mistranslations are dangerous on a YMYL site.

### Phase D — Country name translations
- Build `src/lib/countryNames.ts` with `Record<Locale, Record<string, string>>` keyed by ISO2.
- Reference data exists in the `countries.countryNames` table in the schema; populate from CLDR (Unicode Common Locale Data Repository).

### Phase E — hreflang clusters
- Update `src/app/(site)/[passport]/[destination]/page.tsx` (and every other page's `generateMetadata`) to emit `alternates: { languages: { es: '...', fr: '...', ... } }`.
- Update `src/lib/sitemapUrls.ts` to emit `<xhtml:link rel="alternate" hreflang="..."/>` per URL.

### Phase F — RTL polish
- Tailwind config: enable `rtl:` variants
- Audit every flexbox / grid / margin that hard-codes left/right (most should use logical properties — `ms-*`, `me-*`, `ps-*`, `pe-*`).

### Phase G — Re-enable the locale switcher
Currently hidden in `src/components/SiteHeader.tsx` and `LocaleSwitcher.tsx`. Re-enable once Phase C is done for at least 2 locales.

## How long?

Each phase is a real piece of work. Phase B alone (route restructure) is multi-commit and touches every page module. Phase C (translation) is independent of code work and scales with the number of locales targeted.

Realistic expectation: this is a focused 1-2 week project (across phases A→G), or a quarterly initiative if done piecemeal.

## In the meantime

The site stays English-only and clean. Better than a half-translated site that ranks worse than the current monolingual one. The translation files in `src/i18n/` are kept up to date with key UI strings so when the locale work starts, the message dictionaries are partly populated.
