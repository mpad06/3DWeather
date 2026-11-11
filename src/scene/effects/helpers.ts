import { Cartesian3, Transforms, type Matrix4 } from 'cesium'
import type { SceneLocation } from './types'

/**
 * A number between 0 and 1 that looks random but is always the same for the
 * same seed. The clouds use it, so their layout does not change when the
 * scene is rebuilt. (Classic one-line hash: the fractional part of a large
 * sine value.)
 */
export function pseudoRandom(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

/**
 * Matrix that converts local coordinates in metres – x to the east, y to the
 * north, z up – into Cesium's world coordinates. The origin is the ground
 * point of the location.
 */
export function localFrameAt(location: SceneLocation): Matrix4 {
  const origin = Cartesian3.fromDegrees(location.lon, location.lat, location.elevation)
  return Transforms.eastNorthUpToFixedFrame(origin)
}

/**
 * Splits the wind into an east and a north part in metres per second.
 *
 * Weather data gives the direction the wind comes FROM (270° = from the
 * west), so it blows towards the opposite direction. Compass angles run
 * clockwise from north, which is why sine belongs to east and cosine to north.
 *
 * @param speedKmh wind speed in km/h
 * @param fromDegrees direction the wind comes from
 */
export function windVector(speedKmh: number, fromDegrees: number): { east: number; north: number } {
  const speed = speedKmh / 3.6 // km/h → m/s
  const towards = ((fromDegrees + 180) * Math.PI) / 180
  return { east: Math.sin(towards) * speed, north: Math.cos(towards) * speed }
}

/** True if the user asked the operating system to reduce animations. */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
