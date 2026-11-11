import { useState, type ReactNode } from 'react'
import styles from './Notice.module.css'

type NoticeProps = {
  children: ReactNode
}

/** Small hint that the user can close with the × button. */
export function Notice({ children }: NoticeProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className={styles.notice} role="status">
      <p>{children}</p>
      <button
        type="button"
        className={styles.close}
        aria-label="Hinweis schließen"
        onClick={() => setDismissed(true)}
      >
        ×
      </button>
    </div>
  )
}
