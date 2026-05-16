/**
 * Dense grid of passport-cover thumbnails — the signature visual borrowed
 * from passportindex.org. Renders every ISO that has a real Wikimedia
 * photo on disk, in alphabetical order, each linking to its passport
 * page. The visual density itself is the message: every passport, on
 * one screen.
 *
 * Server-only — uses the manifest read at module init. The grid is
 * intentionally text-light so the photos dominate.
 */
import { passportCoverIsos, getPassportCover } from "@/lib/passportCovers";
import { PassportCover } from "./PassportCover";

export function PassportCollage({
  caption = true,
  limit,
}: {
  /** Show the "Passport-cover photos from Wikimedia Commons" line. */
  caption?: boolean;
  /** Optional cap — useful on the homepage where we want a teaser strip
   *  rather than the full set. */
  limit?: number;
}) {
  const isos = limit ? passportCoverIsos().slice(0, limit) : passportCoverIsos();
  if (isos.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-14 gap-1.5">
        {isos.map((iso) => (
          <PassportCover
            key={iso}
            iso2={iso}
            cover={getPassportCover(iso)}
            size="collage"
            linkToPassport
            showCaption
          />
        ))}
      </div>
      {caption && (
        <p className="text-xs text-[var(--color-ink-muted)]">
          Passport-cover photos sourced from{" "}
          <a
            href="https://commons.wikimedia.org/wiki/Category:Passports_by_country"
            target="_blank"
            rel="noreferrer noopener"
            className="underline underline-offset-2 hover:no-underline"
          >
            Wikimedia Commons
          </a>{" "}
          under Creative Commons and public-domain licences. Hover any cover
          to see its photographer credit.
        </p>
      )}
    </section>
  );
}
