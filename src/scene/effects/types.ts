import type { HourlyWeather } from '../../types/weather'

/** The place the scene is built around. */
export type SceneLocation = {
  lat: number
  lon: number
  /** Ground height in metres above sea level */
  elevation: number
}

/**
 * Common shape of all weather effects in the 3D scene.
 * Every module in this folder exports a create…Effect(viewer, …) function
 * that returns such an object.
 */
export type WeatherEffect = {
  /** Applies the weather of the selected moment. Called when the values change. */
  update(weather: HourlyWeather): void
  /**
   * Optional: moves the effect forward (drifting clouds, falling rain).
   * Called once per rendered frame.
   * @param seconds real time that has passed since the previous frame
   */
  animate?(seconds: number): void
  /** Removes everything the effect added to the scene. */
  destroy(): void
}
