import { useNavigate } from 'react-router-dom'
import { Attribution } from '../components/Attribution'
import { HowItWorks } from '../components/HowItWorks'
import { LocateButton } from '../components/LocateButton'
import { PopularCities } from '../components/PopularCities'
import { SearchBar } from '../components/SearchBar'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import type { Coordinates } from '../hooks/useGeolocation'
import type { City } from '../types/city'
import { weatherPathForCity, weatherPathForPosition } from '../utils/location'
import styles from './LandingPage.module.css'

/**
 * Start page: explains the app and lets the user pick a location.
 * The chosen location is not kept in React state – it is written into the
 * URL of the weather page, which makes that page reloadable and shareable.
 */
export default function LandingPage() {
  useDocumentTitle('48-Stunden-Vorhersage in 3D')
  const navigate = useNavigate()

  function handleCitySelect(city: City) {
    navigate(weatherPathForCity(city))
  }

  function handleLocate(position: Coordinates) {
    navigate(weatherPathForPosition(position.lat, position.lon))
  }

  return (
    <div className={styles.page}>
      <main className={styles.content}>
        <header className={styles.hero}>
          <p className={styles.brand}>
            {/* Decorative logo: sun behind a cloud */}
            <svg className={styles.logo} viewBox="0 0 48 48" aria-hidden="true">
              <circle className={styles.logoSun} cx="31" cy="15" r="9" />
              <g className={styles.logoCloud}>
                <circle cx="16" cy="31" r="8" />
                <circle cx="26" cy="26" r="10" />
                <circle cx="35" cy="32" r="7" />
                <rect x="16" y="31" width="19" height="8" />
              </g>
            </svg>
            3D Wetter
          </p>
          <h1 className={styles.title}>Das Wetter der nächsten 48 Stunden – in 3D</h1>
          <p className={styles.lead}>
            Die Vorhersage des Deutschen Wetterdienstes als 3D-Szene: Sieh zu, wie Wolken, Regen,
            Schnee und Nebel über deiner Stadt aufziehen.
          </p>
          <div className={styles.actions}>
            <SearchBar onSelect={handleCitySelect} />
            <span className={styles.or}>oder</span>
            <LocateButton onLocate={handleLocate} />
          </div>
        </header>

        <HowItWorks />
        <PopularCities />
      </main>

      <footer className={styles.footer}>
        <Attribution />
        <p>Studienprojekt im Modul Web-Programmierung, DHBW.</p>
      </footer>
    </div>
  )
}
