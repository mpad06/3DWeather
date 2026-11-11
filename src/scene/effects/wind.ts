import {
  BillboardCollection,
  Cartesian3,
  Color,
  Math as CesiumMath,
  type Billboard,
  type Viewer,
} from 'cesium'
import type { HourlyWeather } from '../../types/weather'
import { clamp, lerp } from '../../utils/interpolate'
import type { SceneLocation, WeatherEffect } from './types'

/** The arrow floats this many metres above the ground of the location. */
const ARROW_HEIGHT = 250
/** Below this speed (km/h) there is no clear direction: the arrow is hidden. */
const CALM_SPEED = 2
/** Wind speed (km/h) at which the arrow has its full size. */
const STRONG_WIND = 60

/** Draws an arrow that points up. Cesium rotates it into the wind direction. */
function createArrowImage(): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 128
  const context = canvas.getContext('2d')
  if (context) {
    context.beginPath()
    // Arrow head …
    context.moveTo(32, 4)
    context.lineTo(60, 52)
    context.lineTo(42, 52)
    // … and shaft
    context.lineTo(42, 124)
    context.lineTo(22, 124)
    context.lineTo(22, 52)
    context.lineTo(4, 52)
    context.closePath()
    context.fillStyle = 'white'
    context.fill()
    context.lineWidth = 3
    context.strokeStyle = 'rgba(6, 36, 58, 0.9)'
    context.stroke()
  }
  return canvas
}

/**
 * Wind arrow above the location. It points in the direction the wind is
 * blowing towards and grows with the wind speed.
 */
export function createWindEffect(viewer: Viewer, location: SceneLocation): WeatherEffect {
  const { scene } = viewer
  const collection: BillboardCollection = scene.primitives.add(new BillboardCollection())

  const arrow: Billboard = collection.add({
    position: Cartesian3.fromDegrees(
      location.lon,
      location.lat,
      location.elevation + ARROW_HEIGHT,
    ),
    image: createArrowImage(),
    color: Color.fromCssColorString('#5cc8ff').withAlpha(0.9),
    // "Up" of the image points to the north pole instead of to the top of the
    // screen, so the arrow keeps its compass direction when the camera turns.
    alignedAxis: Cartesian3.UNIT_Z,
    // Always drawn in front, even if a building or a cloud is in the way
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
  })

  return {
    update(weather: HourlyWeather) {
      arrow.show = weather.windSpeed >= CALM_SPEED
      // The data gives where the wind comes FROM; the arrow shows where it
      // goes TO, hence + 180°. Compass angles run clockwise, Cesium rotates
      // counter-clockwise, hence the minus sign.
      arrow.rotation = -CesiumMath.toRadians(weather.windDirection + 180)
      // 40 % size in a light breeze, full size in a storm
      arrow.scale = lerp(0.4, 1, clamp(weather.windSpeed / STRONG_WIND, 0, 1))
    },
    destroy() {
      scene.primitives.remove(collection)
    },
  }
}
