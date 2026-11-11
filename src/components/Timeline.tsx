import { useMemo, type CSSProperties, type KeyboardEvent } from 'react'
import type { PlaybackSpeed } from '../hooks/useTimelinePlayback'
import type { HourlyWeather } from '../types/weather'
import { formatDayLong, formatTemperature, formatTime, formatWeekdayShort } from '../utils/format'
import { buildTimelineTicks } from '../utils/timelineTicks'
import { describeWeatherCode } from '../utils/weatherCodes'
import { PlaybackControls } from './PlaybackControls'
import { TimelineChart } from './TimelineChart'
import { TimelineIcons, TimelineLabels } from './TimelineTicks'
import styles from './Timeline.module.css'

type TimelineProps = {
  hours: HourlyWeather[]
  /** Selected position in hours from the start; fractional during playback */
  position: number
  /** Weather at that position (already interpolated by the parent) */
  weather: HourlyWeather
  isPlaying: boolean
  speed: PlaybackSpeed
  onSeek: (position: number) => void
  onStep: (direction: -1 | 1) => void
  onTogglePlay: () => void
  onSpeedChange: (speed: PlaybackSpeed) => void
}

/**
 * The 48-hour timeline: playback controls, chart, slider and labels.
 * It has no state of its own – the parent owns the position and gets every
 * user action through the on… callbacks (controlled component).
 */
export function Timeline({
  hours,
  position,
  weather,
  isPlaying,
  speed,
  onSeek,
  onStep,
  onTogglePlay,
  onSpeedChange,
}: TimelineProps) {
  const lastIndex = hours.length - 1
  const ticks = useMemo(() => buildTimelineTicks(hours), [hours])
  const condition = describeWeatherCode(weather.weatherCode)

  // Keyboard shortcuts while the focus is anywhere inside the timeline
  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault() // replace the slider's own tiny step by one hour
      onStep(1)
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault()
      onStep(-1)
    } else if (event.key === ' ' && !(event.target instanceof HTMLButtonElement)) {
      // On a button the space bar already clicks that button.
      event.preventDefault() // do not scroll the page
      onTogglePlay()
    }
  }

  return (
    <section className={styles.timeline} aria-label="Zeitleiste" onKeyDown={handleKeyDown}>
      <div className={styles.header}>
        <PlaybackControls
          isPlaying={isPlaying}
          speed={speed}
          canStepBack={position > 0}
          canStepForward={position < lastIndex}
          onTogglePlay={onTogglePlay}
          onStep={onStep}
          onSpeedChange={onSpeedChange}
        />
        <p className={styles.current}>
          {formatWeekdayShort(weather.time)}, {formatTime(weather.time)} Uhr
        </p>
        <p className={styles.hint}>Tastatur: ← → Stunde wechseln · Leertaste Abspielen</p>
      </div>

      <div className={styles.track}>
        {/* Indented by half a thumb width, so hour positions match the slider thumb */}
        <div className={styles.aligned}>
          <TimelineIcons ticks={ticks} />
          <TimelineChart
            hours={hours}
            position={position}
            selectedTemperature={weather.temperature}
          />
        </div>
        <input
          type="range"
          className={styles.slider}
          min={0}
          max={lastIndex}
          // The small step lets the thumb glide during playback. Input from the
          // user is rounded below, so dragging still moves hour by hour.
          step={0.01}
          value={position}
          onChange={(event) => onSeek(Math.round(Number(event.target.value)))}
          aria-label="Zeitpunkt der Vorhersage"
          aria-valuetext={`${formatDayLong(weather.time)}, ${formatTime(weather.time)} Uhr: ${condition.label}, ${formatTemperature(weather.temperature)}`}
          // Custom property for the filled part of the track (see CSS)
          style={{ '--progress': `${(position / lastIndex) * 100}%` } as CSSProperties}
        />
        <div className={styles.aligned}>
          <TimelineLabels ticks={ticks} />
        </div>
      </div>
    </section>
  )
}
