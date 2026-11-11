import styles from './WeatherIcon.module.css'

/*
 * Building blocks of the weather icons. Everything is drawn by hand as SVG
 * in a 48 × 48 coordinate system; WeatherIcon.tsx combines the parts.
 */

/** End points of the eight sun rays, calculated once: [x1, y1, x2, y2] */
const SUN_RAYS = Array.from({ length: 8 }, (_, i) => {
  const angle = (i * Math.PI) / 4
  const [cos, sin] = [Math.cos(angle), Math.sin(angle)]
  return [24 + cos * 13, 24 + sin * 13, 24 + cos * 18, 24 + sin * 18]
})

/** Crescent: a large outer arc and a smaller inner arc back to the start. */
const MOON_PATH = 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z'

export function Sun() {
  return (
    <g className={styles.sun}>
      <circle cx="24" cy="24" r="9" />
      {SUN_RAYS.map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
      ))}
    </g>
  )
}

export function Moon() {
  return <path className={styles.moon} d={MOON_PATH} transform="translate(5 5) scale(1.6)" />
}

/** Small sun or moon that peeks out behind a cloud (top right). */
export function SkyBody({ isDay }: { isDay: boolean }) {
  return isDay ? (
    <circle className={styles.sun} cx="33" cy="14" r="7.5" />
  ) : (
    <path className={styles.moon} d={MOON_PATH} transform="translate(24 3) scale(0.85)" />
  )
}

/** Cloud made of three circles and a flat base. */
export function Cloud({ dark = false }: { dark?: boolean }) {
  return (
    <g className={dark ? styles.cloudDark : styles.cloud}>
      <circle cx="17" cy="26" r="7" />
      <circle cx="26" cy="22" r="9" />
      <circle cx="34" cy="27" r="6" />
      <rect x="17" y="26" width="17" height="7" />
    </g>
  )
}

/** Slanted rain streaks below the cloud. */
export function Drops({ short = false }: { short?: boolean }) {
  const length = short ? 3 : 7
  return (
    <g className={styles.drops}>
      {[17, 25, 33].map((x) => (
        <line key={x} x1={x} y1={37} x2={x - length / 3} y2={37 + length} />
      ))}
    </g>
  )
}

/** Snowflakes as small dots at the given x positions. */
export function Flakes({ xs = [16, 24, 32] }: { xs?: number[] }) {
  return (
    <g className={styles.flakes}>
      {xs.map((x, i) => (
        <circle key={x} cx={x} cy={i % 2 === 0 ? 39 : 43} r="2" />
      ))}
    </g>
  )
}

export function Bolt() {
  return <polygon className={styles.bolt} points="26,31 19,40 24,40 21,47 31,37 25,37 29,31" />
}

export function FogLines() {
  return (
    <g className={styles.fog}>
      <line x1="12" y1="38" x2="36" y2="38" />
      <line x1="16" y1="43" x2="40" y2="43" />
    </g>
  )
}
