/**
 * Dense grid of passport-cover thumbnails — the signature visual borrowed
 * from passportindex.org. Renders every covered ISO in alphabetical order,
 * each linking to its passport page. The visual density itself is the
 * message: a directory of passports, on one screen.
 *
 * Server-only — uses the manifest read at module init. The grid is
 * intentionally text-light so the photos dominate. Per-image attribution
 * still lives on each <PassportCover> via its `title` hover tooltip.
 */
import { passportCoverIsos, getPassportCover } from "@/lib/passportCovers";
import { PassportCover } from "./PassportCover";

export function PassportCollage({
  limit,
}: {
  /** Optional cap — useful when we want a teaser strip rather than the
   *  full set. */
  limit?: number;
}) {
  const isos = limit ? passportCoverIsos().slice(0, limit) : passportCoverIsos();
  if (isos.length === 0) return null;

  return (
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
  );
}

/** Number of passports currently in the collage. Use this for honest
 *  count copy ("146 passports", not "every passport in the world"). */
export function passportCollageCount(): number {
  return passportCoverIsos().length;
}
