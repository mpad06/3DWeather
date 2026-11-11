import { Cartesian3, Math as CesiumMath, Matrix4, Transforms, type Viewer } from 'cesium'

/** Height of the camera above the ground of the location, in metres. */
const CAMERA_HEIGHT = 1500
/** Horizontal distance between camera and location, in metres. */
const CAMERA_DISTANCE = 5500
/**
 * Tilt of the camera: negative values look down. With -9° the horizon and a
 * band of sky stay in the picture, which a weather scene needs (clouds, sky
 * colour), while the location lies in the lower half of the view.
 */
const CAMERA_PITCH = CesiumMath.toRadians(-9)
/** Duration of the camera flight in seconds. */
const FLIGHT_SECONDS = 3

/**
 * Flies the camera to a point south of the location, looking north, so the
 * place lies in front of the camera. The user can rotate and zoom freely
 * afterwards.
 *
 * @param elevation ground height of the location in metres above sea level
 */
export function flyToLocation(
  viewer: Viewer,
  lat: number,
  lon: number,
  elevation: number,
): void {
  const ground = Cartesian3.fromDegrees(lon, lat, elevation)

  // Local frame at the location: x points east, y north, z up (metres).
  // In it the camera sits CAMERA_DISTANCE to the south and CAMERA_HEIGHT up;
  // the matrix converts that into Cesium's world coordinates.
  const localToWorld = Transforms.eastNorthUpToFixedFrame(ground)
  const cameraPosition = Matrix4.multiplyByPoint(
    localToWorld,
    new Cartesian3(0, -CAMERA_DISTANCE, CAMERA_HEIGHT),
    new Cartesian3(),
  )

  // Respect the system setting "reduce motion": jump instead of flying.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  viewer.camera.flyTo({
    destination: cameraPosition,
    // heading 0 = looking north, roll 0 = horizon is level
    orientation: { heading: 0, pitch: CAMERA_PITCH, roll: 0 },
    duration: reduceMotion ? 0 : FLIGHT_SECONDS,
  })
}
