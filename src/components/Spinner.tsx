import styles from './Spinner.module.css'

type SpinnerProps = {
  /** Text shown next to the spinner and read by screen readers */
  label: string
}

/** Loading indicator with a visible label. */
export function Spinner({ label }: SpinnerProps) {
  return (
    <div className={styles.spinner} role="status">
      <span className={styles.circle} aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}
