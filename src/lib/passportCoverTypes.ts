/**
 * Type-only module — no Node runtime imports — so it's safe to pull into
 * client components. The data resolver in `passportCovers.ts` uses these
 * types and is server-only.
 */
export type PassportCover = {
  url: string; // path served from /public, e.g. "/passports/jp.jpg"
  source: string; // Wikipedia article URL
  commonsFile: string; // Commons file-page URL
  artist: string;
  licence: string;
  licenceUrl: string | null;
  width: number;
  height: number;
};
