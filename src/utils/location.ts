import { findCityBySlug } from '../data/cities'
import type { City } from '../types/city'
import { findNearestCity, isInCoverageArea } from './geo'

/** The place the weather view shows, resolved from the URL. */
export type WeatherLocation = {
  lat: number
  lon: number
  /** Headline, e.g. "Mannheim" or "Eigener Standort" */
  name: string
  /** Second line, e.g. "Baden-Württemberg" or "in der Nähe von Mannheim, 4 km" */
  detail: string
  /** false for positions outside Germany/Basel – the page then shows a notice */
  inCoverageArea: boolean
}

/** Link to the weather view of a city from the list: /weather?city=mannheim */
export function weatherPathForCity(city: City): string {
  return `/weather?city=${city.slug}`
}

/**
 * Link to the weather view of a GPS position: /weather?lat=49.489&lon=8.467
 * Three decimals are about 100 m – exact enough for weather, and the link
 * does not reveal the precise address when it is shared.
 */
export function weatherPathForPosition(lat: number, lon: number): string {
  return `/weather?lat=${lat.toFixed(3)}&lon=${lon.toFixed(3)}`
}

/**
 * Converts a URL parameter into a number inside [min, max].
 * Returns null for a missing, empty, non-numeric or out-of-range value.
 * (The empty check matters because Number('') would be 0.)
 */
function parseCoordinate(text: string | null, min: number, max: number): number | null {
  if (text === null || text.trim() === '') return null
  const value = Number(text)
  if (!Number.isFinite(value) || value < min || value > max) return null
  return value
}

function describeDistance(distanceKm: number): string {
  return distanceKm < 1 ? 'weniger als 1 km' : `${Math.round(distanceKm)} km`
}

/**
 * Reads the location from the search params of the weather page.
 * Supports ?city=<slug> and ?lat=<lat>&lon=<lon>.
 * Returns null if the params are missing or invalid.
 */
export function readLocation(params: URLSearchParams): WeatherLocation | null {
  const slug = params.get('city')
  if (slug !== null) {
    const city = findCityBySlug(slug)
    if (!city) return null
    return {
      lat: city.lat,
      lon: city.lon,
      name: city.name,
      detail: city.country === 'CH' ? `${city.state}, Schweiz` : city.state,
      inCoverageArea: true,
    }
  }

  const lat = parseCoordinate(params.get('lat'), -90, 90)
  const lon = parseCoordinate(params.get('lon'), -180, 180)
  if (lat === null || lon === null) return null

  const nearest = findNearestCity(lat, lon)
  return {
    lat,
    lon,
    name: 'Eigener Standort',
    detail: `in der Nähe von ${nearest.city.name}, ${describeDistance(nearest.distanceKm)}`,
    inCoverageArea: isInCoverageArea(lat, lon),
  }
}
