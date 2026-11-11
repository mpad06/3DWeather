import { JulianDate, type Viewer } from 'cesium'

/**
 * Sets the time of the 3D scene. Cesium calculates the position of the sun
 * from its clock, so this decides whether the location is lit (day) or dark
 * (night) and where the sun stands in the sky.
 *
 * @param timestamp UTC milliseconds since 1970 (HourlyWeather.timestamp)
 */
export function setSceneTime(viewer: Viewer, timestamp: number): void {
  // JulianDate is Cesium's own date type; fromDate converts a normal JS Date.
  viewer.clock.currentTime = JulianDate.fromDate(new Date(timestamp))
}
