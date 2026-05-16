import Link from "next/link";
import type { GuideFrontmatter } from "./types";

export const frontmatter: GuideFrontmatter = {
  slug: "brazil-reintroduces-visas-2025",
  title: "Brazil reintroduces visas for US, Canadian and Australian travellers (2025)",
  summary:
    "From April 2025, US, Canadian and Australian citizens need an e-Visa to visit Brazil — a reversal of the temporary visa-free arrangement that lapsed in late 2024. Same-day processing, US$80 fee. Here's what changed and what to do.",
  author: "Visavu editorial",
  publishedAt: "2026-05-10",
  modifiedAt: "2026-05-10",
  tags: ["Brazil", "Latin America", "Recent change", "e-Visa"],
  readingMinutes: 5,
  heroIso2: "BR",
};

export default function BrazilVisasGuide() {
  return (
    <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
      <p className="lead text-lg text-neutral-700 dark:text-neutral-300">
        On <strong>April 10, 2025</strong>, Brazil reintroduced visa requirements for American,
        Canadian and Australian travellers. The temporary visa-free arrangement that began
        in 2019 (and was extended several times) was not renewed. Affected travellers now
        apply online for a brazilian e-Visa before boarding, pay roughly US$80, and receive
        approval typically within 24-72 hours. Here&apos;s the full picture.
      </p>

      <h2>TL;DR</h2>
      <ul>
        <li>
          <strong>Who&apos;s affected:</strong> US, Canadian, Australian passport holders.
        </li>
        <li>
          <strong>What changed:</strong> Visa-free entry ended. e-Visa now required for tourism
          and business visits.
        </li>
        <li>
          <strong>Fee:</strong> ~US$80 (consular fees fluctuate; check the official portal).
        </li>
        <li>
          <strong>Validity:</strong> 10 years, multiple entries. Up to 90 days per stay (extendable
          to 180 in a year).
        </li>
        <li>
          <strong>Processing:</strong> Usually 1-3 business days. Apply at least 5 days before
          travel.
        </li>
      </ul>

      <h2>Who is not affected</h2>
      <p>
        Brazil&apos;s reciprocity rule is the underlying logic: Brazil grants visa-free entry
        to countries that grant the same to Brazilian citizens. The reversal targeted the
        three large countries that don&apos;t reciprocate (US, Canada, Australia). Travellers
        from elsewhere are unaffected:
      </p>
      <ul>
        <li>
          European Union, United Kingdom, Switzerland, Norway, Iceland — continue to enter
          visa-free (up to 90 days; 180 in a year).
        </li>
        <li>
          Japan, South Korea, Israel, UAE — visa-free.
        </li>
        <li>
          All Mercosur and CARICOM countries — visa-free or via the Mercosur Residency
          Agreement.
        </li>
      </ul>

      <h2>How to apply (the only path)</h2>
      <ol>
        <li>
          Apply via the official Brazilian Ministry of Foreign Affairs e-Visa portal
          (currently processed via VFS in partnership with the MFA). Watch for the official
          URL — search results often surface third-party services that charge a markup.
        </li>
        <li>
          Submit: passport bio page scan, recent passport photo, proof of onward travel,
          proof of accommodation, and a short summary of your itinerary.
        </li>
        <li>
          Pay the fee online by card. Receipt arrives by email.
        </li>
        <li>
          Receive the e-Visa as a PDF attachment, typically within 1-3 business days. Print it
          or save a clear digital copy — Brazilian Federal Police inspect this on arrival.
        </li>
        <li>
          On arrival, the e-Visa is matched to your passport at immigration. The 90-day
          counter starts on entry.
        </li>
      </ol>

      <h2>What to do if you booked before April 2025</h2>
      <p>
        Brazilian authorities honoured already-booked itineraries up to a transition deadline,
        but as of mid-2025 that grace period has closed. If your trip is after April 2025 and
        you&apos;re a US, Canadian, or Australian citizen, you need an e-Visa regardless of
        when you booked.
      </p>

      <h2>Dual citizenship — easy escape</h2>
      <p>
        If you also hold a passport from a visa-exempt country (UK, EU, Japan, etc.), entering
        Brazil on that passport bypasses the e-Visa requirement entirely. Carry both passports
        and enter on the visa-free one. See <Link href="/finder">our visa finder</Link> with
        your second nationality to confirm.
      </p>

      <h2>Look up your route</h2>
      <p>
        Use our finder with passport &rarr; Brazil to see current entry rules with the policy
        banner pre-applied for US / CA / AU travellers.
      </p>

      <h2>References</h2>
      <ul>
        <li>
          <a href="https://www.gov.br/mre/pt-br/assuntos/portal-consular/vistos" target="_blank" rel="noreferrer noopener">
            Itamaraty — official visa page (Portuguese)
          </a>
        </li>
        <li>
          <a href="https://www.gov.br/mre/en/consular-portal/visas" target="_blank" rel="noreferrer noopener">
            Itamaraty — Brazilian MFA visa page (English)
          </a>
        </li>
      </ul>
    </article>
  );
}
