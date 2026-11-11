import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { ionToken } from '../scene/ionToken'
import type { Forecast } from '../types/weather'
import type { WeatherLocation } from '../utils/location'
import { Attribution } from './Attribution'
import { CesiumViewer } from './CesiumViewer'
import { Notice } from './Notice'
import { WeatherHud } from './WeatherHud'
import styles from './ForecastView.module.css'

type ForecastViewProps = {
  location: WeatherLocation
  forecast: Forecast
}

/**
 * The weather view once the forecast is loaded: 3D scene, HUD and (from
 * phase 4) the timeline. It owns the interaction state and passes it down
 * to its children via props.
 */
export function ForecastView({ location, forecast }: ForecastViewProps) {
  const [ionFailed, setIonFailed] = useState(false)
  // Stable function identity, see the onIonError prop of CesiumViewer
  const handleIonError = useCallback(() => setIonFailed(true), [])

  const weather = forecast.hours[0]
  // Sunrise/sunset of the day the selected hour belongs to ("2026-11-11")
  const sun = forecast.days.find((day) => day.date === weather.time.slice(0, 10))

  return (
    <main className={styles.page}>
      <div className={styles.scene}>
        <CesiumViewer
          lat={location.lat}
          lon={location.lon}
          elevation={forecast.elevation}
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

          <WeatherHud weather={weather} sun={sun} />

          {!location.inCoverageArea && (
            <Notice>
              Diese App ist für Deutschland ausgelegt. Außerhalb kann die Vorhersage ungenauer sein.
            </Notice>
          )}
          {!ionToken && (
            <Notice>3D-Gelände nicht verfügbar – kein Cesium-Token konfiguriert</Notice>
          )}
          {ionFailed && (
            <Notice>
              3D-Gelände nicht verfügbar – der Cesium-Token ist ungültig oder Cesium ion ist nicht
              erreichbar
            </Notice>
          )}
        </div>
      </div>

      <footer className={styles.panel}>
        <Attribution />
      </footer>
    </main>
  )
}
