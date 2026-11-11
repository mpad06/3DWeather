import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTimelinePlayback } from '../hooks/useTimelinePlayback'
import { ionToken } from '../scene/ionToken'
import type { Forecast } from '../types/weather'
import { interpolateWeather } from '../utils/interpolate'
import type { WeatherLocation } from '../utils/location'
import { Attribution } from './Attribution'
import { CesiumViewer } from './CesiumViewer'
import { Notice } from './Notice'
import { Timeline } from './Timeline'
import { WeatherHud } from './WeatherHud'
import styles from './ForecastView.module.css'

type ForecastViewProps = {
  location: WeatherLocation
  forecast: Forecast
}

/**
 * The weather view once the forecast is loaded: 3D scene, HUD and timeline.
 *
 * This component owns the interaction state of the page (selected position
 * on the timeline, playback). Everything the children show is derived from
 * that state and handed down via props; the children report user actions
 * back through callbacks. So the data flows in one direction only.
 */
export function ForecastView({ location, forecast }: ForecastViewProps) {
  const timeline = useTimelinePlayback(forecast.hours.length)

  // The weather at the selected position. It is derived, not stored: during
  // playback the position is fractional and the values are blended between
  // two forecast hours. useMemo recalculates only when the position changes.
  const weather = useMemo(
    () => interpolateWeather(forecast.hours, timeline.position),
    [forecast.hours, timeline.position],
  )

  // Sunrise/sunset of the day the selected moment belongs to ("2026-11-11")
  const sun = forecast.days.find((day) => day.date === weather.time.slice(0, 10))

  const [ionFailed, setIonFailed] = useState(false)
  // Stable function identity, see the onIonError prop of CesiumViewer
  const handleIonError = useCallback(() => setIonFailed(true), [])

  return (
    <main className={styles.page}>
      <div className={styles.scene}>
        <CesiumViewer
          lat={location.lat}
          lon={location.lon}
          elevation={forecast.elevation}
          weather={weather}
          onIonError={handleIonError}
        />

        <div className={styles.overlay}>
          <header className={styles.topBar}>
            <Link to="/" className={styles.back} aria-label="Ort ändern – zurück zur Startseite">
              <span aria-hidden="true">←</span> Ort ändern
            </Link>
            <div className={styles.place}>
              <h1 className={styles.placeName}>{location.name}</h1>
              <p className={styles.placeDetail}>{location.detail}</p>
            </div>
          </header>

          <div className={styles.hud}>
            <WeatherHud weather={weather} sun={sun} />
          </div>

          <div className={styles.notices}>
            {!location.inCoverageArea && (
              <Notice>
                Diese App ist für Deutschland ausgelegt. Außerhalb kann die Vorhersage ungenauer
                sein.
              </Notice>
            )}
            {!ionToken && (
              <Notice>3D-Gelände nicht verfügbar – kein Cesium-Token konfiguriert</Notice>
            )}
            {ionFailed && (
              <Notice>
                3D-Gelände nicht verfügbar – der Cesium-Token ist ungültig oder Cesium ion ist
                nicht erreichbar
              </Notice>
            )}
          </div>
        </div>
      </div>

      <footer className={styles.panel}>
        <Timeline
          hours={forecast.hours}
          position={timeline.position}
          weather={weather}
          isPlaying={timeline.isPlaying}
          speed={timeline.speed}
          onSeek={timeline.seek}
          onStep={timeline.step}
          onTogglePlay={timeline.togglePlay}
          onSpeedChange={timeline.setSpeed}
        />
        <Attribution />
      </footer>
    </main>
  )
}
