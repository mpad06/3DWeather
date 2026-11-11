import { useGeolocation, type Coordinates } from '../hooks/useGeolocation'
import styles from './LocateButton.module.css'

type LocateButtonProps = {
  /** Called with the GPS position of the user */
  onLocate: (position: Coordinates) => void
}

/** "Use my location" button with its loading and error state. */
export function LocateButton({ onLocate }: LocateButtonProps) {
  const { status, error, locate } = useGeolocation(onLocate)
  const isLoading = status === 'loading'

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.button}
        onClick={locate}
        disabled={isLoading}
        aria-busy={isLoading}
      >
        {/* Decorative location pin */}
        <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
        </svg>
        {isLoading ? 'Standort wird ermittelt …' : 'Meinen Standort verwenden'}
      </button>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
