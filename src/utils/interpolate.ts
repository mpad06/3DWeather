import type { HourlyWeather } from '../types/weather'

/**
 * Linear interpolation: the value between a and b at the fraction t.
 * t = 0 gives a, t = 1 gives b, t = 0.5 the middle.
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/**
 * Like lerp, but for compass directions in degrees. It takes the shorter way
 * round the circle: from 350° to 10° it turns 20° through north instead of
 * 340° backwards through south.
 */
export function lerpAngle(a: number, b: number, t: number): number {
  // Difference between the angles, brought into the range -180…+180
  const difference = ((b - a + 540) % 360) - 180
  return (a + difference * t + 360) % 360
}

/** Limits a value to the range min…max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** The numeric fields that are blended linearly between two hours. */
const BLENDED_FIELDS = [
  'timestamp',
  'temperature',
  'apparentTemperature',
  'humidity',
  'precipitation',
  'precipitationProbability',
  'rain',
  'showers',
  'snowfall',
  'cloudCover',
  'cloudCoverLow',
  'cloudCoverMid',
  'cloudCoverHigh',
  'visibility',
  'windSpeed',
  'windGusts',
  'daylight',
  'freezingLevelHeight',
  'cape',
  'sunshineDuration',
] as const

/**
 * The weather at any position of the timeline.
 *
 * `position` counts hours from the start of the forecast and may be
 * fractional: 3.25 means a quarter of an hour after hour 3. Whole numbers
 * return the forecast hour unchanged. In between, the numeric values are
 * blended, which lets the 3D scene change gradually during playback instead
 * of jumping once per hour.
 */
export function interpolateWeather(hours: HourlyWeather[], position: number): HourlyWeather {
  const lastIndex = hours.length - 1
  const clamped = clamp(position, 0, lastIndex)
  const index = Math.floor(clamped)
  // How far we are between hour `index` (0) and hour `index + 1` (1)
  const t = clamped - index

  const from = hours[index]
  if (t === 0) return from
  const to = hours[index + 1]

  // Weather code and day/night cannot be blended: use the nearer hour.
  const result: HourlyWeather = { ...(t < 0.5 ? from : to) }

  for (const field of BLENDED_FIELDS) {
    result[field] = lerp(from[field], to[field], t)
  }
  result.windDirection = lerpAngle(from.windDirection, to.windDirection, t)

  // Local time label: replace the minutes of "2026-11-11T14:00" → "…T14:15"
  const minutes = String(Math.floor(t * 60)).padStart(2, '0')
  result.time = `${from.time.slice(0, 14)}${minutes}`

  return result
}
