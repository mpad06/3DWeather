import { CITIES } from '../data/cities'
import type { City } from '../types/city'

const EARTH_RADIUS_KM = 6371

/**
 * Rough bounding box around Germany including Basel. Positions outside of it
 * still get a forecast, but the app shows a notice (see isInCoverageArea).
 */
const COVERAGE = { minLat: 45.5, maxLat: 55.5, minLon: 5.0, maxLon: 15.5 }

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/**
 * Great-circle distance between two points on the globe in kilometres,
 * calculated with the haversine formula.
 */
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a))
}

/** The city from the list that is closest to the position, with its distance. */
export function findNearestCity(lat: number, lon: number): { city: City; distanceKm: number } {
  let nearest = CITIES[0]
  let shortest = Infinity

  for (const city of CITIES) {
    const distance = haversineKm(lat, lon, city.lat, city.lon)
    if (distance < shortest) {
      shortest = distance
      nearest = city
    }
  }

  return { city: nearest, distanceKm: shortest }
}

/** True if the position lies inside the area the app is designed for. */
export function isInCoverageArea(lat: number, lon: number): boolean {
  return (
    lat >= COVERAGE.minLat &&
    lat <= COVERAGE.maxLat &&
    lon >= COVERAGE.minLon &&
    lon <= COVERAGE.maxLon
  )
}
