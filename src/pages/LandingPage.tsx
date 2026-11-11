import { Link } from 'react-router-dom'
import { FullPageMessage } from '../components/FullPageMessage'

/** Start page. Placeholder for phase 1 – search and GPS follow in phase 2. */
export default function LandingPage() {
  return (
    <FullPageMessage>
      <div>
        <h1>3D Wetter</h1>
        <p>48-Stunden-Vorhersage für Deutschland als 3D-Szene.</p>
        <p>
          <Link to="/weather">Zur 3D-Ansicht</Link>
        </p>
      </div>
    </FullPageMessage>
  )
}
