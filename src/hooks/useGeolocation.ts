import { useState } from 'react'

export type Coordinates = {
  lat: number
  lon: number
}

type GeolocationStatus = 'idle' | 'loading' | 'error'

/** Settings from the task: a coarse position is enough for a weather forecast. */
const POSITION_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 10000, // give up after 10 seconds
  maximumAge: 300000, // a position up to 5 minutes old is fine
}

/** Translates the error code of the Geolocation API into a message for the user. */
function describeError(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Der Zugriff auf deinen Standort wurde abgelehnt. Erlaube ihn in den Browser-Einstellungen oder nutze die Suche.'
    case error.POSITION_UNAVAILABLE:
      return 'Dein Standort konnte nicht ermittelt werden. Bitte nutze die Suche.'
    case error.TIMEOUT:
      return 'Die Standortabfrage hat zu lange gedauert. Bitte versuche es erneut.'
    default:
      return 'Bei der Standortabfrage ist ein unbekannter Fehler aufgetreten.'
  }
}

/**
 * Wraps the browser Geolocation API.
 *
 * @param onSuccess called with the position as soon as the browser delivers it
 * @returns the current status, an error message (or null) and the function
 *          `locate` that starts the request
 */
export function useGeolocation(onSuccess: (position: Coordinates) => void) {
  const [status, setStatus] = useState<GeolocationStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  function fail(message: string) {
    setStatus('error')
    setError(message)
  }

  function locate() {
    // Browsers only allow geolocation on HTTPS pages and on localhost.
    if (!window.isSecureContext) {
      fail('Die Standortabfrage funktioniert nur über eine sichere Verbindung (HTTPS oder localhost).')
      return
    }
    if (!('geolocation' in navigator)) {
      fail('Dein Browser unterstützt keine Standortabfrage. Bitte nutze die Suche.')
      return
    }

    setStatus('loading')
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setStatus('idle')
        onSuccess({ lat: position.coords.latitude, lon: position.coords.longitude })
      },
      (positionError) => fail(describeError(positionError)),
      POSITION_OPTIONS,
    )
  }

  return { status, error, locate }
}
