import type { ReactNode } from 'react'
import styles from './FullPageMessage.module.css'

type FullPageMessageProps = {
  children: ReactNode
}

/** Centers its content in the viewport – used for loading and error states. */
export function FullPageMessage({ children }: FullPageMessageProps) {
  return <main className={styles.page}>{children}</main>
}
