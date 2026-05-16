/**
 * World map geometry preparation.
 *
 * Reads Natural Earth 110m country boundaries (via the `world-atlas` npm
 * package, vendored locally — no runtime CDN fetch), projects them with
 * d3-geo Equal Earth (looks balanced; doesn't grossly inflate Greenland),
 * and returns an array of SVG paths keyed by ISO 3166-1 alpha-2.
 *
 * Why server-side: the topojson file is ~110 KB and d3-geo adds another
 * ~80 KB. Doing this on the server keeps the client bundle thin — clients
 * receive only the trimmed `{ iso2, name, pathD }[]` array.
 *
 * Lazy + cached: the projection is deterministic, so we compute once per
 * server process at module load.
 */
import { feature } from "topojson-client";
import { geoEqualEarth, geoPath } from "d3-geo";
import isoCountries from "iso-3166-1";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — JSON import resolved at build time
import worldTopo from "world-atlas/countries-110m.json";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from "geojson";

// Types live in worldMapTypes.ts (no runtime deps) so client components
// can import them without dragging d3-geo + topojson into the browser
// bundle. Re-exported here for backwards compatibility with consumers
// that imported types from this file before the split.
import type { WorldMapCountry, WorldMapData } from "./worldMapTypes";
export type { WorldMapCountry, WorldMapData };

const WIDTH = 960;
const HEIGHT = 480;

let cached: WorldMapData | null = null;

export function getWorldMapData(): WorldMapData {
  if (cached) return cached;

  const topology = worldTopo as unknown as Topology;
  const collection = topology.objects.countries as GeometryCollection;
  const fc = feature(topology, collection) as unknown as FeatureCollection<
    Polygon | MultiPolygon,
    { name: string }
  >;

  const projection = geoEqualEarth()
    .scale(170)
    .translate([WIDTH / 2, HEIGHT / 2]);
  const path = geoPath(projection);

  const countries: WorldMapCountry[] = [];

  for (const f of fc.features) {
    const numericId = (f as Feature & { id?: string | number }).id;
    if (numericId == null) continue;
    const numericStr = String(numericId).padStart(3, "0");
    const entry = isoCountries.whereNumeric(numericStr);
    if (!entry) continue;
    const d = path(f);
    if (!d) continue;
    countries.push({
      iso2: entry.alpha2,
      name: f.properties?.name ?? entry.country,
      pathD: d,
    });
  }

  cached = { width: WIDTH, height: HEIGHT, countries };
  return cached;
}
