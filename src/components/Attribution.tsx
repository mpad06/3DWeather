import styles from './Attribution.module.css'

/** Data sources and licences. Shown on the landing page and in the weather view. */
export function Attribution() {
  return (
    <p className={styles.attribution}>
      Wetterdaten:{' '}
      <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
        Open-Meteo.com
      </a>{' '}
      (CC BY 4.0), Quelle: Deutscher Wetterdienst (DWD) · Karte: ©{' '}
      <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
        OpenStreetMap
      </a>
      -Mitwirkende · 3D-Globus:{' '}
      <a href="https://cesium.com/" target="_blank" rel="noreferrer">
        CesiumJS
      </a>
    </p>
  )
}
