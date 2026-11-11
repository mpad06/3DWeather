import { CITIES } from '../data/cities'
import type { City } from '../types/city'
import { normalizeText } from './normalize'

/** Every city together with its normalised name, computed once at start-up. */
const SEARCH_INDEX = CITIES.map((city) => ({
  city,
  searchName: normalizeText(city.name),
}))

/**
 * How well a city name fits the query. Lower is better, -1 means no match.
 * 0: the name starts with the query            ("frank" → Frankfurt am Main)
 * 1: a later word starts with the query        ("main"  → Frankfurt am Main)
 * 2: the query appears somewhere in the name   ("burg"  → Hamburg)
 */
function matchRank(searchName: string, query: string): number {
  if (searchName.startsWith(query)) return 0
  if (searchName.includes(` ${query}`)) return 1
  if (searchName.includes(query)) return 2
  return -1
}

/**
 * Finds the cities that match the text typed by the user.
 * Matching ignores case and umlaut spelling (see normalizeText).
 * The best matches come first; equal matches are ordered by population,
 * because CITIES is already sorted that way and sort() keeps that order.
 */
export function searchCities(text: string): City[] {
  const query = normalizeText(text)
  if (query === '') return []

  return SEARCH_INDEX.map((entry) => ({
    city: entry.city,
    rank: matchRank(entry.searchName, query),
  }))
    .filter((entry) => entry.rank !== -1)
    .sort((a, b) => a.rank - b.rank)
    .map((entry) => entry.city)
}
