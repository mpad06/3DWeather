import { useMemo } from 'react'
import type { HourlyWeather } from '../types/weather'
import { formatNumber, formatTemperature } from '../utils/format'
import styles from './TimelineChart.module.css'

type TimelineChartProps = {
  hours: HourlyWeather[]
  /** Selected position in hours, may be fractional during playback */
  position: number
  /** Temperature at the selected position (for the marker dot) */
  selectedTemperature: number
}

/*
 * The chart is drawn in its own coordinate system (the SVG viewBox) and then
 * stretched to the available width by the browser:
 * x: every hour is 10 units wide, so hour i is at x = i * 10
 * y: 0 is the top edge, HEIGHT the bottom edge
 */
const HOUR_WIDTH = 10
const HEIGHT = 56
/** Free space above the highest and below the lowest temperature */
const LINE_MARGIN = 6
/** Tallest precipitation bar as a share of the chart height */
const MAX_BAR_SHARE = 0.7
/** Bars are scaled to at least this amount (mm), so drizzle does not look like a downpour */
const MIN_PRECIPITATION_SCALE = 2

/** Calculates everything that depends only on the forecast, not on the position. */
function buildChart(hours: HourlyWeather[]) {
  const temperatures = hours.map((hour) => hour.temperature)
  const minTemperature = Math.min(...temperatures)
  const maxTemperature = Math.max(...temperatures)
  // At least 1 °C, so a completely flat curve does not divide by zero
  const temperatureRange = Math.max(maxTemperature - minTemperature, 1)
  const maxPrecipitation = Math.max(...hours.map((hour) => hour.precipitation))
  const precipitationScale = Math.max(maxPrecipitation, MIN_PRECIPITATION_SCALE)

  /** y coordinate of a temperature: warm is at the top, cold at the bottom */
  const temperatureY = (temperature: number) =>
    LINE_MARGIN +
    (1 - (temperature - minTemperature) / temperatureRange) * (HEIGHT - 2 * LINE_MARGIN)

  const barHeight = (millimetres: number) =>
    (millimetres / precipitationScale) * HEIGHT * MAX_BAR_SHARE

  // "x1,y1 x2,y2 ..." – the point list format of an SVG <polyline>
  const linePoints = hours
    .map((hour, index) => `${index * HOUR_WIDTH},${temperatureY(hour.temperature)}`)
    .join(' ')

  return { minTemperature, maxTemperature, maxPrecipitation, temperatureY, barHeight, linePoints }
}

/**
 * Hand-built SVG chart of the 48 hours: temperature as a line, precipitation
 * as bars, night hours shaded and the selected moment marked.
 */
export function TimelineChart({ hours, position, selectedTemperature }: TimelineChartProps) {
  // The geometry only changes with a new forecast, not on every playback tick.
  const chart = useMemo(() => buildChart(hours), [hours])
  const width = (hours.length - 1) * HOUR_WIDTH
  const selectedIndex = Math.round(position)
  const markerX = position * HOUR_WIDTH

  const summary =
    `Verlauf der nächsten ${hours.length} Stunden: Temperatur zwischen ` +
    `${formatTemperature(chart.minTemperature)} und ${formatTemperature(chart.maxTemperature)}, ` +
    `höchster Niederschlag ${formatNumber(chart.maxPrecipitation, 1)} mm pro Stunde.`

  return (
    <div className={styles.chart}>
      <p className={styles.legend} aria-hidden="true">
        <span className={styles.legendTemperature}>
          Temperatur {formatTemperature(chart.minTemperature)} bis{' '}
          {formatTemperature(chart.maxTemperature)}
        </span>
        <span className={styles.legendPrecipitation}>
          Niederschlag bis {formatNumber(chart.maxPrecipitation, 1)} mm/h
        </span>
      </p>
      <div className={styles.plot}>
        <svg
          className={styles.svg}
          viewBox={`0 0 ${width} ${HEIGHT}`}
          // Stretch to the element size instead of keeping the aspect ratio
          preserveAspectRatio="none"
          role="img"
          aria-label={summary}
        >
          {hours.map((hour, index) => {
            const barHeight = chart.barHeight(hour.precipitation)
            return (
              // One group per hour; the hour's x position is the centre of the group
              <g key={hour.time} transform={`translate(${(index - 0.5) * HOUR_WIDTH} 0)`}>
                {!hour.isDay && (
                  <rect className={styles.night} width={HOUR_WIDTH} height={HEIGHT} />
                )}
                {hour.time.endsWith('T00:00') && (
                  <line
                    className={styles.midnight}
                    x1={HOUR_WIDTH / 2}
                    x2={HOUR_WIDTH / 2}
                    y2={HEIGHT}
                  />
                )}
                {barHeight > 0 && (
                  <rect
                    className={index === selectedIndex ? styles.barSelected : styles.bar}
                    x={2}
                    y={HEIGHT - barHeight}
                    width={HOUR_WIDTH - 4}
                    height={barHeight}
                  />
                )}
              </g>
            )
          })}
          <polyline className={styles.line} points={chart.linePoints} />
          <line className={styles.marker} x1={markerX} x2={markerX} y2={HEIGHT} />
        </svg>
        {/* The dot is HTML, because the stretched SVG would turn a circle into an ellipse */}
        <span
          className={styles.dot}
          style={{
            left: `${(markerX / width) * 100}%`,
            top: `${(chart.temperatureY(selectedTemperature) / HEIGHT) * 100}%`,
          }}
        />
      </div>
    </div>
  )
}
