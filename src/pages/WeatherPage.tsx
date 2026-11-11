import { useSearchParams } from 'react-router-dom'
import { ErrorMessage } from '../components/ErrorMessage'
import { ForecastView } from '../components/ForecastView'
import { FullPageMessage } from '../components/FullPageMessage'
import { Spinner } from '../components/Spinner'
import { useWeather } from '../hooks/useWeather'
import { readLocation } from '../utils/location'

/**
 * Weather page (/weather). Its job is the data flow up to the forecast:
 * URL search params → location → useWeather → one of four screens.
 */
export default function WeatherPage() {
  // The location lives in the URL, so the page can be reloaded and shared.
  const [searchParams] = useSearchParams()
  const location = readLocation(searchParams)

  // Hooks must be called on every render, also without a valid location.
  // With null the hook stays 'idle' and sends no request.
  const weather = useWeather(location?.lat ?? null, location?.lon ?? null)

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

  if (weather.status === 'error') {
    return (
      <FullPageMessage>
        <ErrorMessage
          title="Vorhersage konnte nicht geladen werden"
          message={weather.error}
          actionLabel="Erneut versuchen"
          onAction={weather.retry}
          showHomeLink
        />
      </FullPageMessage>
    )
  }

  if (weather.status !== 'success') {
    return (
      <FullPageMessage>
        <Spinner label={`Vorhersage für ${location.name} wird geladen …`} />
      </FullPageMessage>
    )
  }

  // The key creates a fresh ForecastView for every location, which resets
  // its state (selected hour, playback) when the user switches the place.
  return (
    <ForecastView
      key={`${location.lat},${location.lon}`}
      location={location}
      forecast={weather.data}
    />
  )
}
