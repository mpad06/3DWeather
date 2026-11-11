import type { HourlyWeather } from '../types/weather'
import { formatWeekdayShort } from './format'

/** A labelled point on the timeline (icon above the chart, label below the slider). */
export type TimelineTick = {
  hour: HourlyWeather
  /** Horizontal position along the timeline: 0 % = first hour, 100 % = last hour */
  percent: number
  /** "Jetzt", a weekday at midnight ("Do") or the hour of the day ("15") */
  label: string
  kind: 'now' | 'midnight' | 'hour'
  /** Major ticks are also shown on narrow screens, minor ones only on wide screens */
  major: boolean
}

/** Ticks this close to the start would overlap the "Jetzt" label. */
const FIRST_TICK_INDEX = 3

/**
 * Picks the hours that get a tick: the first hour ("Jetzt") and every full
 * three hours of the clock (00, 03, 06, ...). Midnight starts a new day and
 * is labelled with the weekday.
 */
export function buildTimelineTicks(hours: HourlyWeather[]): TimelineTick[] {
  const lastIndex = hours.length - 1
  const ticks: TimelineTick[] = []

  hours.forEach((hour, index) => {
    const percent = (index / lastIndex) * 100
    // "2026-11-11T15:00" → 15
    const hourOfDay = Number(hour.time.slice(11, 13))

    if (index === 0) {
      ticks.push({ hour, percent, label: 'Jetzt', kind: 'now', major: true })
    } else if (index >= FIRST_TICK_INDEX && hourOfDay === 0) {
      ticks.push({ hour, percent, label: formatWeekdayShort(hour.time), kind: 'midnight', major: true })
    } else if (index >= FIRST_TICK_INDEX && hourOfDay % 3 === 0) {
      ticks.push({
        hour,
        percent,
        label: hour.time.slice(11, 13),
        kind: 'hour',
        major: hourOfDay % 6 === 0,
      })
    }
  })

  return ticks
}
