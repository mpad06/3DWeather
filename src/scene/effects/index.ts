import type { Viewer } from 'cesium'
import type { HourlyWeather } from '../../types/weather'
import { createCloudEffect } from './clouds'
import { createFogEffect } from './fog'
import { createLightningEffect } from './lightning'
import { createPrecipitationEffect } from './precipitation'
import { createSkyEffect } from './sky'
import type { SceneLocation, WeatherEffect } from './types'
import { createWindEffect } from './wind'

/**
 * Longest time step passed to the effects. After a pause (background tab,
 * slow frame) the animation continues from where it was instead of jumping.
 */
const MAX_FRAME_SECONDS = 0.1

/**
 * Creates all weather effects of the scene and returns them as one object
 * with the same shape as a single effect.
 *
 * Two things drive the effects:
 * - update(weather): the React component passes on the weather of the
 *   selected moment whenever it changes
 * - animate(seconds): Cesium raises the preUpdate event before every frame;
 *   we measure the real time since the last frame and pass it on
 */
export function createWeatherEffects(viewer: Viewer, location: SceneLocation): WeatherEffect {
  const effects: WeatherEffect[] = [
    createSkyEffect(viewer),
    createFogEffect(viewer),
    createCloudEffect(viewer, location),
    createPrecipitationEffect(viewer),
    createLightningEffect(viewer),
    createWindEffect(viewer, location),
  ]

  let lastFrame = performance.now()
  // addEventListener returns a function that removes the listener again.
  const stopAnimating = viewer.scene.preUpdate.addEventListener(() => {
    const now = performance.now()
    const seconds = Math.min((now - lastFrame) / 1000, MAX_FRAME_SECONDS)
    lastFrame = now
    for (const effect of effects) {
      effect.animate?.(seconds)
    }
  })

  return {
    update(weather: HourlyWeather) {
      for (const effect of effects) {
        effect.update(weather)
      }
    },
    destroy() {
      stopAnimating()
      for (const effect of effects) {
        effect.destroy()
      }
    },
  }
}
