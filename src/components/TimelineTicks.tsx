import type { TimelineTick } from '../utils/timelineTicks'
import { describeWeatherCode } from '../utils/weatherCodes'
import { WeatherIcon } from './WeatherIcon'
import styles from './TimelineTicks.module.css'

type TimelineTicksProps = {
  ticks: TimelineTick[]
}

/** Extra label style per kind of tick; plain hours need none. */
const KIND_CLASS: Record<TimelineTick['kind'], string> = {
  now: styles.now,
  midnight: styles.midnight,
  hour: '',
}

/** CSS classes of a tick: minor ticks are hidden on narrow screens. */
function tickClass(tick: TimelineTick, extra = ''): string {
  return [styles.tick, extra, tick.major ? '' : styles.minor].filter(Boolean).join(' ')
}

/** Row of small weather icons, one every three hours (above the chart). */
export function TimelineIcons({ ticks }: TimelineTicksProps) {
  return (
    // Decorative: the same information is available through the slider's text
    <div className={styles.icons} aria-hidden="true">
      {ticks.map((tick) => (
        <span
          key={tick.hour.time}
          className={tickClass(tick)}
          style={{ left: `${tick.percent}%` }}
        >
          <WeatherIcon
            category={describeWeatherCode(tick.hour.weatherCode).category}
            isDay={tick.hour.isDay}
            size={22}
          />
        </span>
      ))}
    </div>
  )
}

/** Row of labels below the slider: "Jetzt", hours of the day and weekdays at midnight. */
export function TimelineLabels({ ticks }: TimelineTicksProps) {
  return (
    <div className={styles.labels} aria-hidden="true">
      {ticks.map((tick) => (
        <span
          key={tick.hour.time}
          className={tickClass(tick, KIND_CLASS[tick.kind])}
          style={{ left: `${tick.percent}%` }}
        >
          {tick.label}
        </span>
      ))}
    </div>
  )
}
