import type { Forecast, HourlyWeather } from '../types/weather'

/**
 * Client for the Open-Meteo forecast API.
 * The API is free for non-commercial use and needs no API key.
 * Documentation: https://open-meteo.com/en/docs
 */
const API_URL = 'https://api.open-meteo.com/v1/forecast'

/** Hourly variables we request. The names are defined by Open-Meteo. */
const HOURLY_VARIABLES = [
  'temperature_2m',
  'apparent_temperature',
  'relative_humidity_2m',
  'precipitation',
  'precipitation_probability',
  'rain',
  'showers',
  'snowfall',
  'weather_code',
  'cloud_cover',
  'cloud_cover_low',
  'cloud_cover_mid',
  'cloud_cover_high',
  'visibility',
  'wind_speed_10m',
  'wind_direction_10m',
  'wind_gusts_10m',
  'is_day',
  'freezing_level_height',
  'cape',
  'sunshine_duration',
] as const

type HourlyVariable = (typeof HOURLY_VARIABLES)[number]

/** A column of values, one per hour. Open-Meteo sends null for missing values. */
type Column = (number | null)[]

/**
 * Shape of a successful response (only the fields we use).
 * Open-Meteo returns the hourly data column-wise: one array per variable.
 */
type OpenMeteoResponse = {
  elevation: number
  timezone: string
  /** Difference between local time at the location and UTC in seconds */
  utc_offset_seconds: number
  hourly: { time: string[] } & Record<HourlyVariable, Column>
  daily: { time: string[]; sunrise: string[]; sunset: string[] }
}

/** Shape of an error response, e.g. for an invalid latitude. */
type OpenMeteoError = {
  error: true
  reason: string
}

/** Builds the request URL for a 48-hour forecast of the DWD ICON model. */
export function buildForecastUrl(lat: number, lon: number): string {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    // DWD ICON-D2 (2 km grid) blended with ICON-EU/Global where D2 has no data
    models: 'icon_seamless',
    hourly: HOURLY_VARIABLES.join(','),
    daily: 'sunrise,sunset',
    forecast_hours: '48',
    forecast_days: '3',
    // Times are returned in the local time zone of the location
    timezone: 'auto',
    wind_speed_unit: 'kmh',
  })
  return `${API_URL}?${params}`
}

/** Type guard: is the JSON body an Open-Meteo error object? */
function isApiError(body: unknown): body is OpenMeteoError {
  return (
    typeof body === 'object' &&
    body !== null &&
    'error' in body &&
    body.error === true &&
    'reason' in body &&
    typeof body.reason === 'string'
  )
}

/** Minimal structure check before we trust the response. */
function isForecastResponse(body: unknown): body is OpenMeteoResponse {
  return (
    typeof body === 'object' &&
    body !== null &&
    'hourly' in body &&
    typeof body.hourly === 'object' &&
    body.hourly !== null &&
    'time' in body.hourly &&
    Array.isArray(body.hourly.time) &&
    'daily' in body
  )
}

/**
 * Transforms the column arrays of the API into one object per hour, which is
 * much easier to use in components: hours[5].temperature instead of
 * hourly.temperature_2m[5].
 */
function toForecast(data: OpenMeteoResponse): Forecast {
  const { hourly, daily } = data
  // Missing values (null) become 0 so the rest of the app can rely on numbers.
  const at = (column: Column, index: number) => column[index] ?? 0

  const hours: HourlyWeather[] = hourly.time.map((time, i) => ({
    time,
    // "2026-11-11T14:00" is local time. Reading it as UTC and subtracting the
    // UTC offset of the location gives the real moment in time.
    timestamp: Date.parse(`${time}Z`) - data.utc_offset_seconds * 1000,
    temperature: at(hourly.temperature_2m, i),
    apparentTemperature: at(hourly.apparent_temperature, i),
    humidity: at(hourly.relative_humidity_2m, i),
    precipitation: at(hourly.precipitation, i),
    precipitationProbability: at(hourly.precipitation_probability, i),
    rain: at(hourly.rain, i),
    showers: at(hourly.showers, i),
    snowfall: at(hourly.snowfall, i),
    weatherCode: at(hourly.weather_code, i),
    cloudCover: at(hourly.cloud_cover, i),
    cloudCoverLow: at(hourly.cloud_cover_low, i),
    cloudCoverMid: at(hourly.cloud_cover_mid, i),
    cloudCoverHigh: at(hourly.cloud_cover_high, i),
    visibility: at(hourly.visibility, i),
    windSpeed: at(hourly.wind_speed_10m, i),
    windDirection: at(hourly.wind_direction_10m, i),
    windGusts: at(hourly.wind_gusts_10m, i),
    isDay: at(hourly.is_day, i) === 1,
    daylight: at(hourly.is_day, i),
    freezingLevelHeight: at(hourly.freezing_level_height, i),
    cape: at(hourly.cape, i),
    sunshineDuration: at(hourly.sunshine_duration, i),
  }))

  const days = daily.time.map((date, i) => ({
    date,
    sunrise: daily.sunrise[i],
    sunset: daily.sunset[i],
  }))

  return { elevation: data.elevation, timezone: data.timezone, hours, days }
}

/**
 * Loads the 48-hour forecast for a position.
 *
 * @param signal lets the caller cancel the request (AbortController)
 * @throws Error with a German message that can be shown to the user.
 *         A cancelled request throws the browser's own "AbortError".
 */
export async function fetchForecast(
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<Forecast> {
  let response: Response
  try {
    response = await fetch(buildForecastUrl(lat, lon), { signal })
  } catch (error) {
    // Pass a cancellation on unchanged; everything else is a network problem.
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new Error('Der Wetterdienst ist nicht erreichbar. Bitte prüfe deine Internetverbindung.', {
      cause: error,
    })
  }

  // Error responses are JSON too, so read the body before checking the status.
  let body: unknown
  try {
    body = await response.json()
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new Error(`Der Wetterdienst hat eine unlesbare Antwort gesendet (HTTP ${response.status}).`, {
      cause: error,
    })
  }

  if (isApiError(body)) {
    throw new Error(`Der Wetterdienst meldet einen Fehler: ${body.reason}`)
  }
  if (!response.ok) {
    throw new Error(`Der Wetterdienst meldet einen Fehler (HTTP ${response.status}).`)
  }
  if (!isForecastResponse(body) || body.hourly.time.length === 0) {
    throw new Error('Der Wetterdienst hat keine Vorhersagedaten geliefert.')
  }

  return toForecast(body)
}
