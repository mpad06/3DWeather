/**
 * Formatting helpers for the UI. All numbers use German notation
 * (decimal comma) via toLocaleString('de-DE').
 */

const COMPASS_POINTS = ['N', 'NO', 'O', 'SO', 'S', 'SW', 'W', 'NW']

/** 1.25 → "1,3" */
export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/** 11.6 → "12°" */
export function formatTemperature(celsius: number): string {
  // "+ 0" turns a rounded "-0" into "0", so we never show "-0°".
  return `${formatNumber(Math.round(celsius) + 0)}°`
}

/** 700 → "700 m", 8740 → "8,7 km", 24000 → "24 km" */
export function formatVisibility(metres: number): string {
  if (metres < 1000) return `${formatNumber(Math.round(metres / 10) * 10)} m`
  if (metres < 10000) return `${formatNumber(metres / 1000, 1)} km`
  return `${formatNumber(metres / 1000)} km`
}

/**
 * Compass point for a direction in degrees: 0 → "N", 225 → "SW".
 * Each of the 8 points covers 45°, centred on its direction.
 */
export function compassPoint(degrees: number): string {
  const index = Math.round(degrees / 45) % 8
  return COMPASS_POINTS[(index + 8) % 8]
}

/**
 * Forecast times are local times of the location without a zone, e.g.
 * "2026-11-11T14:00". We read them as UTC and also format them as UTC, so the
 * result does not depend on the time zone of the user's device.
 */
function toDate(localIsoTime: string): Date {
  return new Date(`${localIsoTime}Z`)
}

/** "2026-11-11T14:00" → "14:00" */
export function formatTime(localIsoTime: string): string {
  return localIsoTime.slice(11, 16)
}

/** "2026-11-11T14:00" → "Mi" */
export function formatWeekdayShort(localIsoTime: string): string {
  return toDate(localIsoTime)
    .toLocaleDateString('de-DE', { weekday: 'short', timeZone: 'UTC' })
    .replace('.', '')
}

/** "2026-11-11T14:00" → "Mittwoch, 11. November" */
export function formatDayLong(localIsoTime: string): string {
  return toDate(localIsoTime).toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  })
}
