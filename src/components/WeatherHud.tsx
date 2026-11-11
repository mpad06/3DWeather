import { useId, useState } from 'react'
import type { DailySun, HourlyWeather } from '../types/weather'
import {
  compassPoint,
  formatDayLong,
  formatNumber,
  formatTemperature,
  formatTime,
  formatVisibility,
} from '../utils/format'
import { describeWeatherCode } from '../utils/weatherCodes'
import { WeatherIcon } from './WeatherIcon'
import { WindArrow } from './WindArrow'
import styles from './WeatherHud.module.css'

type WeatherHudProps = {
  /** Weather of the selected moment (interpolated during playback) */
  weather: HourlyWeather
  /** Sunrise and sunset of the selected day, if known */
  sun: DailySun | undefined
}

/**
 * Overlay with all values of the selected hour.
 * On small screens only the summary row is visible; the "Details" button
 * expands the rest. On wide screens the details are always shown (CSS).
 */
export function WeatherHud({ weather, sun }: WeatherHudProps) {
  const [expanded, setExpanded] = useState(false)
  const detailsId = useId()
  const condition = describeWeatherCode(weather.weatherCode)

  return (
    <section className={styles.hud} aria-label="Wetter zum gewählten Zeitpunkt">
      <div className={styles.summary}>
        <WeatherIcon category={condition.category} isDay={weather.isDay} />
        <div className={styles.main}>
          <p className={styles.temperature}>{formatTemperature(weather.temperature)}</p>
          <p className={styles.condition}>{condition.label}</p>
        </div>
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={expanded}
          aria-controls={detailsId}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Weniger' : 'Details'}
        </button>
      </div>

      <p className={styles.time}>
        {formatDayLong(weather.time)} · {formatTime(weather.time)} Uhr
      </p>

      <dl id={detailsId} className={expanded ? `${styles.details} ${styles.open}` : styles.details}>
        <div className={styles.row}>
          <dt>Gefühlt</dt>
          <dd>{formatTemperature(weather.apparentTemperature)}</dd>
        </div>
        <div className={styles.row}>
          <dt>Niederschlag</dt>
          <dd>
            {formatNumber(weather.precipitation, 1)} mm ·{' '}
            {formatNumber(weather.precipitationProbability)} %
          </dd>
        </div>
        <div className={styles.row}>
          <dt>Wind</dt>
          <dd>
            <WindArrow direction={weather.windDirection} />
            {formatNumber(weather.windSpeed)} km/h aus {compassPoint(weather.windDirection)}
          </dd>
        </div>
        <div className={styles.row}>
          <dt>Böen</dt>
          <dd>{formatNumber(weather.windGusts)} km/h</dd>
        </div>
        <div className={styles.row}>
          <dt>Bewölkung</dt>
          <dd>{formatNumber(weather.cloudCover)} %</dd>
        </div>
        <div className={styles.row}>
          <dt>Luftfeuchte</dt>
          <dd>{formatNumber(weather.humidity)} %</dd>
        </div>
        <div className={styles.row}>
          <dt>Sichtweite</dt>
          <dd>{formatVisibility(weather.visibility)}</dd>
        </div>
        {sun && (
          <div className={styles.row}>
            <dt>Sonne</dt>
            <dd>
              {formatTime(sun.sunrise)} – {formatTime(sun.sunset)} Uhr
            </dd>
          </div>
        )}
      </dl>
    </section>
  )
}
