import { useCallback, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CesiumViewer } from '../components/CesiumViewer'
import { ErrorMessage } from '../components/ErrorMessage'
import { FullPageMessage } from '../components/FullPageMessage'
import { ionToken } from '../scene/ionToken'
import { readLocation } from '../utils/location'
import styles from './WeatherPage.module.css'

/** Weather view. Phase 2: shows the 3D scene of the location from the URL. */
export default function WeatherPage() {
  const [searchParams] = useSearchParams()
  const location = readLocation(searchParams)

  const [ionFailed, setIonFailed] = useState(false)
  // Stable function identity, see the onIonError prop of CesiumViewer
  const handleIonError = useCallback(() => setIonFailed(true), [])

  if (!location) {
    return (
      <FullPageMessage>
        <ErrorMessage
          title="Ort nicht gefunden"
          message="Die Adresse enthält keinen gültigen Ort. Bitte wähle auf der Startseite eine Stadt aus."
          showHomeLink
        />
      </FullPageMessage>
    )
  }

  return (
    <main className={styles.page}>
      <div className={styles.scene}>
        <CesiumViewer
          lat={location.lat}
          lon={location.lon}
          elevation={0}
          onIonError={handleIonError}
        />
        <div className={styles.overlay}>
          <Link to="/" className={styles.back}>
            ← Ort ändern
          </Link>
          <p className={styles.notice}>
            {location.name} · {location.detail}
          </p>
          {!location.inCoverageArea && (
            <p className={styles.notice}>
              Diese App ist für Deutschland ausgelegt – außerhalb kann die Vorhersage ungenauer sein.
            </p>
          )}
          {!ionToken && (
            <p className={styles.notice}>
              3D-Gelände nicht verfügbar – kein Cesium-Token konfiguriert
            </p>
          )}
          {ionFailed && (
            <p className={styles.notice}>3D-Gelände nicht verfügbar – Cesium-Token ungültig</p>
          )}
        </div>
      </div>
    </main>
  )
}
