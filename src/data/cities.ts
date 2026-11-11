import type { City } from '../types/city'

/**
 * The 51 largest cities in Germany by population plus Basel (Switzerland),
 * sorted by population.
 *
 * Population (Germany): official figures as of 31.12.2025 from the
 * statistical offices of the federation and the states (population update
 * based on the 2022 census), taken from the Wikipedia list
 * "Liste der Großstädte in Deutschland".
 * Population (Basel): GeoNames value returned by the Open-Meteo geocoding API.
 *
 * Coordinates: looked up once during development with the Open-Meteo
 * geocoding API (https://geocoding-api.open-meteo.com/v1/search) and
 * hardcoded here, so the app needs no geocoding request at runtime.
 */
export const CITIES: City[] = [
  { slug: 'berlin', name: 'Berlin', state: 'Berlin', country: 'DE', lat: 52.5244, lon: 13.4105, population: 3700577 },
  { slug: 'hamburg', name: 'Hamburg', state: 'Hamburg', country: 'DE', lat: 53.5507, lon: 9.993, population: 1869473 },
  { slug: 'muenchen', name: 'München', state: 'Bayern', country: 'DE', lat: 48.1374, lon: 11.5755, population: 1505036 },
  { slug: 'koeln', name: 'Köln', state: 'Nordrhein-Westfalen', country: 'DE', lat: 50.9333, lon: 6.95, population: 1025523 },
  { slug: 'frankfurt-am-main', name: 'Frankfurt am Main', state: 'Hessen', country: 'DE', lat: 50.1155, lon: 8.6842, population: 760656 },
  { slug: 'duesseldorf', name: 'Düsseldorf', state: 'Nordrhein-Westfalen', country: 'DE', lat: 51.2232, lon: 6.7793, population: 619444 },
  { slug: 'leipzig', name: 'Leipzig', state: 'Sachsen', country: 'DE', lat: 51.3396, lon: 12.3713, population: 615932 },
  { slug: 'stuttgart', name: 'Stuttgart', state: 'Baden-Württemberg', country: 'DE', lat: 48.7823, lon: 9.177, population: 609365 },
  { slug: 'dortmund', name: 'Dortmund', state: 'Nordrhein-Westfalen', country: 'DE', lat: 51.5149, lon: 7.466, population: 600880 },
  { slug: 'bremen', name: 'Bremen', state: 'Bremen', country: 'DE', lat: 53.0758, lon: 8.8072, population: 588413 },
  { slug: 'essen', name: 'Essen', state: 'Nordrhein-Westfalen', country: 'DE', lat: 51.4566, lon: 7.0123, population: 573618 },
  { slug: 'dresden', name: 'Dresden', state: 'Sachsen', country: 'DE', lat: 51.0509, lon: 13.7383, population: 562764 },
  { slug: 'nuernberg', name: 'Nürnberg', state: 'Bayern', country: 'DE', lat: 49.4542, lon: 11.0775, population: 531159 },
  { slug: 'hannover', name: 'Hannover', state: 'Niedersachsen', country: 'DE', lat: 52.3705, lon: 9.7332, population: 522803 },
  { slug: 'duisburg', name: 'Duisburg', state: 'Nordrhein-Westfalen', country: 'DE', lat: 51.4325, lon: 6.7652, population: 500810 },
  { slug: 'bochum', name: 'Bochum', state: 'Nordrhein-Westfalen', country: 'DE', lat: 51.4817, lon: 7.2165, population: 358880 },
  { slug: 'wuppertal', name: 'Wuppertal', state: 'Nordrhein-Westfalen', country: 'DE', lat: 51.2563, lon: 7.1482, population: 357243 },
  { slug: 'bielefeld', name: 'Bielefeld', state: 'Nordrhein-Westfalen', country: 'DE', lat: 52.0333, lon: 8.5333, population: 331419 },
  { slug: 'bonn', name: 'Bonn', state: 'Nordrhein-Westfalen', country: 'DE', lat: 50.7344, lon: 7.0955, population: 323587 },
  { slug: 'mannheim', name: 'Mannheim', state: 'Baden-Württemberg', country: 'DE', lat: 49.4891, lon: 8.4669, population: 319536 },
  { slug: 'karlsruhe', name: 'Karlsruhe', state: 'Baden-Württemberg', country: 'DE', lat: 49.0094, lon: 8.4044, population: 309247 },
  { slug: 'muenster', name: 'Münster', state: 'Nordrhein-Westfalen', country: 'DE', lat: 51.9624, lon: 7.6257, population: 306368 },
  { slug: 'augsburg', name: 'Augsburg', state: 'Bayern', country: 'DE', lat: 48.3715, lon: 10.8985, population: 301786 },
  { slug: 'wiesbaden', name: 'Wiesbaden', state: 'Hessen', country: 'DE', lat: 50.086, lon: 8.2444, population: 288584 },
  { slug: 'moenchengladbach', name: 'Mönchengladbach', state: 'Nordrhein-Westfalen', country: 'DE', lat: 51.1854, lon: 6.4417, population: 267176 },
  { slug: 'gelsenkirchen', name: 'Gelsenkirchen', state: 'Nordrhein-Westfalen', country: 'DE', lat: 51.5051, lon: 7.0965, population: 266199 },
  { slug: 'aachen', name: 'Aachen', state: 'Nordrhein-Westfalen', country: 'DE', lat: 50.7766, lon: 6.0834, population: 263703 },
  { slug: 'braunschweig', name: 'Braunschweig', state: 'Niedersachsen', country: 'DE', lat: 52.2659, lon: 10.5267, population: 252811 },
  { slug: 'kiel', name: 'Kiel', state: 'Schleswig-Holstein', country: 'DE', lat: 54.3213, lon: 10.1349, population: 251842 },
  { slug: 'chemnitz', name: 'Chemnitz', state: 'Sachsen', country: 'DE', lat: 50.8357, lon: 12.9292, population: 247252 },
  { slug: 'magdeburg', name: 'Magdeburg', state: 'Sachsen-Anhalt', country: 'DE', lat: 52.1313, lon: 11.6319, population: 244494 },
  { slug: 'freiburg-im-breisgau', name: 'Freiburg im Breisgau', state: 'Baden-Württemberg', country: 'DE', lat: 47.9959, lon: 7.8522, population: 238299 },
  { slug: 'krefeld', name: 'Krefeld', state: 'Nordrhein-Westfalen', country: 'DE', lat: 51.3364, lon: 6.5538, population: 230738 },
  { slug: 'halle-saale', name: 'Halle (Saale)', state: 'Sachsen-Anhalt', country: 'DE', lat: 51.4816, lon: 11.9795, population: 226186 },
  { slug: 'mainz', name: 'Mainz', state: 'Rheinland-Pfalz', country: 'DE', lat: 49.9819, lon: 8.2801, population: 223888 },
  { slug: 'erfurt', name: 'Erfurt', state: 'Thüringen', country: 'DE', lat: 50.9773, lon: 11.0354, population: 217159 },
  { slug: 'luebeck', name: 'Lübeck', state: 'Schleswig-Holstein', country: 'DE', lat: 53.8689, lon: 10.6873, population: 217061 },
  { slug: 'oberhausen', name: 'Oberhausen', state: 'Nordrhein-Westfalen', country: 'DE', lat: 51.4781, lon: 6.8625, population: 213178 },
  { slug: 'rostock', name: 'Rostock', state: 'Mecklenburg-Vorpommern', country: 'DE', lat: 54.0887, lon: 12.1405, population: 204929 },
  { slug: 'kassel', name: 'Kassel', state: 'Hessen', country: 'DE', lat: 51.3167, lon: 9.5, population: 196799 },
  { slug: 'hagen', name: 'Hagen', state: 'Nordrhein-Westfalen', country: 'DE', lat: 51.3608, lon: 7.4717, population: 189983 },
  { slug: 'potsdam', name: 'Potsdam', state: 'Brandenburg', country: 'DE', lat: 52.3989, lon: 13.0657, population: 185137 },
  { slug: 'saarbruecken', name: 'Saarbrücken', state: 'Saarland', country: 'DE', lat: 49.2326, lon: 7.0098, population: 182859 },
  { slug: 'hamm', name: 'Hamm', state: 'Nordrhein-Westfalen', country: 'DE', lat: 51.6803, lon: 7.8209, population: 179108 },
  { slug: 'basel', name: 'Basel', state: 'Basel-Stadt', country: 'CH', lat: 47.5584, lon: 7.5733, population: 177595 },
  { slug: 'oldenburg', name: 'Oldenburg', state: 'Niedersachsen', country: 'DE', lat: 53.1404, lon: 8.2148, population: 177355 },
  { slug: 'ludwigshafen-am-rhein', name: 'Ludwigshafen am Rhein', state: 'Rheinland-Pfalz', country: 'DE', lat: 49.4812, lon: 8.4464, population: 177055 },
  { slug: 'muelheim-an-der-ruhr', name: 'Mülheim an der Ruhr', state: 'Nordrhein-Westfalen', country: 'DE', lat: 51.4322, lon: 6.8797, population: 171674 },
  { slug: 'leverkusen', name: 'Leverkusen', state: 'Nordrhein-Westfalen', country: 'DE', lat: 51.0303, lon: 6.9843, population: 168299 },
  { slug: 'darmstadt', name: 'Darmstadt', state: 'Hessen', country: 'DE', lat: 49.8717, lon: 8.6503, population: 168253 },
  { slug: 'osnabrueck', name: 'Osnabrück', state: 'Niedersachsen', country: 'DE', lat: 52.2741, lon: 8.0506, population: 166257 },
  { slug: 'solingen', name: 'Solingen', state: 'Nordrhein-Westfalen', country: 'DE', lat: 51.1734, lon: 7.0845, population: 164621 },
]

/** Returns the city with the given slug, or undefined if there is none. */
export function findCityBySlug(slug: string): City | undefined {
  return CITIES.find((city) => city.slug === slug)
}
