import type { ReactNode } from 'react'
import type { WeatherCategory } from '../utils/weatherCodes'
import { Bolt, Cloud, Drops, Flakes, FogLines, Moon, SkyBody, Sun } from './WeatherIconParts'
import styles from './WeatherIcon.module.css'

type WeatherIconProps = {
  category: WeatherCategory
  /** Day shows a sun, night a moon */
  isDay: boolean
  /** Width and height in CSS pixels */
  size?: number
}

/** Chooses the SVG parts for a weather category. */
function iconParts(category: WeatherCategory, isDay: boolean): ReactNode {
  switch (category) {
    case 'clear':
      return isDay ? <Sun /> : <Moon />
    case 'partlyCloudy':
      return (
        <>
          <SkyBody isDay={isDay} />
          <Cloud />
        </>
      )
    case 'overcast':
      return <Cloud dark />
    case 'fog':
      return (
        <>
          <Cloud dark />
          <FogLines />
        </>
      )
    case 'drizzle':
      return (
        <>
          <Cloud />
          <Drops short />
        </>
      )
    case 'rain':
      return (
        <>
          <Cloud dark />
          <Drops />
        </>
      )
    case 'freezingRain':
      return (
        <>
          <Cloud dark />
          <Drops />
          <Flakes xs={[21, 29]} />
        </>
      )
    case 'snow':
      return (
        <>
          <Cloud />
          <Flakes />
        </>
      )
    case 'showers':
      return (
        <>
          <SkyBody isDay={isDay} />
          <Cloud />
          <Drops />
        </>
      )
    case 'thunderstorm':
      return (
        <>
          <Cloud dark />
          <Bolt />
        </>
      )
  }
}

/**
 * Weather symbol for a category. Purely decorative: the label next to it
 * carries the meaning, so the icon is hidden from screen readers.
 */
export function WeatherIcon({ category, isDay, size = 48 }: WeatherIconProps) {
  return (
    <svg
      className={styles.icon}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      {iconParts(category, isDay)}
    </svg>
  )
}
