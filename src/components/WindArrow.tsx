import styles from './WindArrow.module.css'

type WindArrowProps = {
  /** Direction the wind comes FROM in degrees (0 = north, 90 = east) */
  direction: number
}

/**
 * Small arrow that points where the wind is blowing TO, with north at the
 * top like on a map. The arrow is drawn pointing up (north) and rotated:
 * wind from the west (270°) blows towards the east, so 270° + 180° = 90°.
 */
export function WindArrow({ direction }: WindArrowProps) {
  return (
    <svg
      className={styles.arrow}
      viewBox="0 0 24 24"
      style={{ transform: `rotate(${direction + 180}deg)` }}
      aria-hidden="true"
    >
      <path d="M12 2 19 20 12 16 5 20Z" />
    </svg>
  )
}
