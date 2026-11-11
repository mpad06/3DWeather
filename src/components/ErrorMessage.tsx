import { Link } from 'react-router-dom'
import styles from './ErrorMessage.module.css'

type ErrorMessageProps = {
  title: string
  message: string
  /** Label of the optional action button, e.g. "Erneut versuchen" */
  actionLabel?: string
  /** Click handler of the action button. The button is only shown with both props. */
  onAction?: () => void
  /** Show a link back to the landing page */
  showHomeLink?: boolean
}

/** Reusable error box with an optional retry button and link to the start page. */
export function ErrorMessage({
  title,
  message,
  actionLabel,
  onAction,
  showHomeLink = false,
}: ErrorMessageProps) {
  const showAction = actionLabel !== undefined && onAction !== undefined

  return (
    <div className={styles.box} role="alert">
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.message}>{message}</p>
      {(showAction || showHomeLink) && (
        <div className={styles.actions}>
          {showAction && (
            <button type="button" className={styles.button} onClick={onAction}>
              {actionLabel}
            </button>
          )}
          {showHomeLink && (
            <Link to="/" className={styles.link}>
              Zur Startseite
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
