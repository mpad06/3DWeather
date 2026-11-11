import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ErrorMessage } from './components/ErrorMessage'
import { FullPageMessage } from './components/FullPageMessage'
import { Spinner } from './components/Spinner'
import LandingPage from './pages/LandingPage'
import NotFoundPage from './pages/NotFoundPage'

// The weather page imports Cesium, which is several megabytes of JavaScript.
// lazy() moves it into a separate file that the browser only downloads when
// the user opens /weather, so the landing page stays fast.
const WeatherPage = lazy(() => import('./pages/WeatherPage'))

const loadingFallback = (
  <FullPageMessage>
    <Spinner label="3D-Ansicht wird geladen …" />
  </FullPageMessage>
)

const errorFallback = (
  <FullPageMessage>
    <ErrorMessage
      title="Etwas ist schiefgelaufen"
      message="Ein unerwarteter Fehler ist aufgetreten. Bitte lade die Seite neu."
      actionLabel="Seite neu laden"
      onAction={() => window.location.reload()}
    />
  </FullPageMessage>
)

/** Root component: only sets up the routes of the app. */
export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary fallback={errorFallback}>
        <Suspense fallback={loadingFallback}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/weather" element={<WeatherPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
