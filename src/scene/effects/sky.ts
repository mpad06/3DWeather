import type { Viewer } from 'cesium'
import type { HourlyWeather } from '../../types/weather'
import { clamp } from '../../utils/interpolate'
import type { WeatherEffect } from './types'

/** Rain of this strength (mm per hour) counts as the darkest sky. */
const HEAVY_RAIN_MM = 6

/**
 * Sky and daylight: the more clouds and rain, the greyer and darker the sky
 * and the duller the colours of the ground.
 *
 * Cesium offers "shift" values for this: 0 leaves a colour unchanged,
 * negative values remove saturation or brightness.
 */
export function createSkyEffect(viewer: Viewer): WeatherEffect {
  const { scene } = viewer

  /** @param gloom 0 = clear blue sky … 1 = dark grey sky */
  function apply(gloom: number) {
    // Sky dome above the horizon
    if (scene.skyAtmosphere) {
      scene.skyAtmosphere.saturationShift = -0.9 * gloom
      scene.skyAtmosphere.brightnessShift = -0.4 * gloom
    }
    // Haze towards the horizon, which Cesium draws over distant ground
    scene.globe.atmosphereSaturationShift = -0.9 * gloom
    scene.globe.atmosphereBrightnessShift = -0.4 * gloom

    // Map imagery: without direct sunlight the ground looks flatter and darker
    for (let i = 0; i < viewer.imageryLayers.length; i++) {
      const layer = viewer.imageryLayers.get(i)
      layer.saturation = 1 - 0.45 * gloom
      layer.brightness = 1 - 0.3 * gloom
    }
  }

  return {
    update(weather: HourlyWeather) {
      const cloudShare = weather.cloudCover / 100
      const rainShare = clamp(weather.precipitation / HEAVY_RAIN_MM, 0, 1)
      // Clouds alone make the sky up to 70 % gloomy, rain adds the rest.
      apply(clamp(cloudShare * 0.7 + rainShare * 0.3, 0, 1))
    },
    destroy() {
      apply(0)
    },
  }
}
