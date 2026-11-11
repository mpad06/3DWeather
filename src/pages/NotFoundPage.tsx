import { ErrorMessage } from '../components/ErrorMessage'
import { FullPageMessage } from '../components/FullPageMessage'

/** Shown for every URL that matches no route. */
export default function NotFoundPage() {
  return (
    <FullPageMessage>
      <ErrorMessage
        title="Seite nicht gefunden"
        message="Diese Adresse gibt es in der App nicht."
        showHomeLink
      />
    </FullPageMessage>
  )
}
