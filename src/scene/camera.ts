import {
  BoundingSphere,
  Cartesian3,
  HeadingPitchRange,
  Math as CesiumMath,
  type Viewer,
} from 'cesium'

/** Height of the camera above the ground of the location, in metres. */
const CAMERA_HEIGHT = 1500
/** Tilt of the camera: negative values look down. -25° gives an oblique view. */
const CAMERA_PITCH = CesiumMath.toRadians(-25)
/** Duration of the camera flight in seconds. */
const FLIGHT_SECONDS = 3

/**
 * Flies the camera to a location and looks at it from the south at an angle,
 * so the place lies in front of the camera. The user can rotate and zoom
 * freely afterwards.
 *
 * @param elevation ground height of the location in metres above sea level
 */
export function flyToLocation(
  viewer: Viewer,
  lat: number,
  lon: number,
  elevation: number,
): void {
  const target = Cartesian3.fromDegrees(lon, lat, elevation)

  // The camera looks at the target from a distance called "range".
  // Right triangle: height = range * sin(|pitch|)  =>  range = height / sin(|pitch|)
  const range = CAMERA_HEIGHT / Math.sin(-CAMERA_PITCH)

  // Respect the system setting "reduce motion": jump instead of flying.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  viewer.camera.flyToBoundingSphere(new BoundingSphere(target, 0), {
    // heading 0 = camera looks north
    offset: new HeadingPitchRange(0, CAMERA_PITCH, range),
    duration: reduceMotion ? 0 : FLIGHT_SECONDS,
  })
}
