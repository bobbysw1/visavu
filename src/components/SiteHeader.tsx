import Link from "next/link";
import { headers, cookies } from "next/headers";
import { VisavuLogo } from "./VisavuLogo";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { CurrencySwitcher } from "./CurrencySwitcher";
import { resolveLocaleFromAcceptLanguage, type Locale } from "@/i18n/t";
import { resolveUserCurrency } from "@/lib/userCurrency";

export async function SiteHeader() {
  const hdrs = await headers();
  const cookieJar = await cookies();
  const referer = hdrs.get("referer") ?? "";
  const langFromUrl = referer.match(/[?&]lang=([a-z]{2})/)?.[1];
  const locale: Locale =
    (langFromUrl as Locale) || resolveLocaleFromAcceptLanguage(hdrs.get("accept-language"));

  const userCurrency = resolveUserCurrency({
    cookie: cookieJar.get("vl_currency")?.value ?? null,
    acceptLanguage: hdrs.get("accept-language"),
  });

  return (
    <header className="border-b border-neutral-200/70 dark:border-neutral-800 sticky top-0 z-30 bg-white/80 dark:bg-neutral-950/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-base">
          <VisavuLogo size={22} wordmarkClassName="hidden sm:inline" />
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link
            href="/find-my-visa"
            className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold whitespace-nowrap"
          >
            Find my visa
          </Link>
          <Link
            href="/finder"
            className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hidden md:inline"
          >
            Where can I go?
          </Link>
          <Link
            href="/passport/us"
            className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hidden lg:inline"
          >
            By passport
          </Link>
          <Link
            href="/destination/jp"
            className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hidden sm:inline"
          >
            By destination
          </Link>
          <Link
            href="/compare/us/gb"
            className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hidden sm:inline"
          >
            Compare
          </Link>
          <Link
            href="/passport-rankings"
            className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hidden md:inline"
          >
            Rankings
          </Link>
          <Link
            href="/about"
            className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hidden sm:inline"
          >
            How it works
          </Link>
          <CurrencySwitcher current={userCurrency} />
          <LocaleSwitcher current={locale} />
        </nav>
      </div>
    </header>
  );
}
