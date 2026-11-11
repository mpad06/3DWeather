import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { CesiumViewer } from '../components/CesiumViewer'
import { ionToken } from '../scene/ionToken'
import styles from './WeatherPage.module.css'

/** Weather view. Phase 1 only shows the 3D scene for a fixed location (Mannheim). */
export default function WeatherPage() {
  const [ionFailed, setIonFailed] = useState(false)
  // Stable function identity, see the onIonError prop of CesiumViewer
  const handleIonError = useCallback(() => setIonFailed(true), [])

  return (
    <main className={styles.page}>
      <div className={styles.scene}>
        <CesiumViewer lat={49.4875} lon={8.466} elevation={100} onIonError={handleIonError} />
        <div className={styles.overlay}>
          <Link to="/" className={styles.back}>
            ← Ort ändern
          </Link>
          {!ionToken && <p className={styles.notice}>3D-Gelände nicht verfügbar – kein Cesium-Token konfiguriert</p>}
          {ionFailed && <p className={styles.notice}>3D-Gelände nicht verfügbar – Cesium-Token ungültig</p>}
        </div>
      </div>
    </main>
  )
}
