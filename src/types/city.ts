/** One selectable location of the app (see src/data/cities.ts). */
export type City = {
  /** URL-safe id without umlauts, used in /weather?city=<slug> */
  slug: string
  /** Display name, e.g. "München" */
  name: string
  /** Federal state (Germany) or canton (Switzerland) */
  state: string
  country: 'DE' | 'CH'
  /** Latitude in decimal degrees (north is positive) */
  lat: number
  /** Longitude in decimal degrees (east is positive) */
  lon: number
  population: number
}
