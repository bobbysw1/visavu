/**
 * Type-only module — no Node / d3-geo / topojson runtime imports — so
 * client components can import these types without pulling the ~80KB
 * d3-geo bundle and the 110KB topojson into the browser graph.
 *
 * The runtime resolver lives in `./worldMap.ts` and is server-only.
 */
export type WorldMapCountry = {
  iso2: string;
  name: string;
  pathD: string;
};

export type WorldMapData = {
  width: number;
  height: number;
  countries: WorldMapCountry[];
};
