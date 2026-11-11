import { useCallback, useEffect, useState } from 'react'
import { fetchForecast } from '../services/openMeteo'
import type { Forecast } from '../types/weather'

/**
 * State of the forecast request. The union ties the fields together:
 * `data` is only set for 'success', `error` only for 'error'.
 */
export type WeatherState =
  | { status: 'idle' | 'loading'; data: null; error: null; retry: () => void }
  | { status: 'success'; data: Forecast; error: null; retry: () => void }
  | { status: 'error'; data: null; error: string; retry: () => void }

/** Outcome of one finished request, tagged with the request it belongs to. */
type LoadResult = {
  requestId: string
  data: Forecast | null
  error: string | null
}

// ---- In-memory cache -------------------------------------------------------
// Lives outside the hook, so it survives page changes (but not a reload).

const CACHE_DURATION_MS = 15 * 60 * 1000 // 15 minutes

type CacheEntry = { forecast: Forecast; loadedAt: number }
const cache = new Map<string, CacheEntry>()

/**
 * Two decimals are about 1 km. Positions that close share one cache entry –
 * the weather model itself only has a 2 km grid.
 */
function cacheKey(lat: number, lon: number): string {
  return `${lat.toFixed(2)},${lon.toFixed(2)}`
}

/** Returns the cached forecast if it is fresh, otherwise loads a new one. */
async function loadForecast(lat: number, lon: number, signal: AbortSignal): Promise<Forecast> {
  const key = cacheKey(lat, lon)
  const cached = cache.get(key)
  if (cached && Date.now() - cached.loadedAt < CACHE_DURATION_MS) {
    return cached.forecast
  }

  const forecast = await fetchForecast(lat, lon, signal)
  cache.set(key, { forecast, loadedAt: Date.now() })
  return forecast
}

// ---- Hook ------------------------------------------------------------------

/**
 * Loads the 48-hour forecast for a position.
 * Pass null for both values while no valid location is known ('idle').
 *
 * The status is not stored but derived: every result remembers which request
 * it belongs to. If the stored result does not match the current request
 * (new location or retry), the hook reports 'loading'.
 */
export function useWeather(lat: number | null, lon: number | null): WeatherState {
  const [result, setResult] = useState<LoadResult | null>(null)
  // Counts the retries; changing it starts a new request for the same place.
  const [attempt, setAttempt] = useState(0)

  const retry = useCallback(() => setAttempt((count) => count + 1), [])

  const requestId = lat !== null && lon !== null ? `${lat},${lon},${attempt}` : null

  useEffect(() => {
    if (lat === null || lon === null || requestId === null) return

    // Cancels the request when the location changes or the component unmounts,
    // so an outdated response can never overwrite a newer one.
    const controller = new AbortController()

    loadForecast(lat, lon, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return
        setResult({ requestId, data, error: null })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        const message = error instanceof Error ? error.message : 'Unbekannter Fehler.'
        setResult({ requestId, data: null, error: message })
      })

    return () => controller.abort()
  }, [lat, lon, requestId])

  if (requestId === null) {
    return { status: 'idle', data: null, error: null, retry }
  }
  if (result === null || result.requestId !== requestId) {
    return { status: 'loading', data: null, error: null, retry }
  }
  if (result.data !== null) {
    return { status: 'success', data: result.data, error: null, retry }
  }
  return { status: 'error', data: null, error: result.error ?? 'Unbekannter Fehler.', retry }
}
