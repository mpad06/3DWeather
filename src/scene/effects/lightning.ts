import { PostProcessStage, type Viewer } from 'cesium'
import type { HourlyWeather } from '../../types/weather'
import { lerp } from '../../utils/interpolate'
import { describeWeatherCode } from '../../utils/weatherCodes'
import { prefersReducedMotion } from './helpers'
import type { WeatherEffect } from './types'

/** Seconds between two flashes: a random time in this range. */
const MIN_PAUSE = 2.5
const MAX_PAUSE = 8
/** Seconds a flash needs to fade out. */
const FADE_SECONDS = 0.35

/** Adds white to every pixel of the finished image; `flash` is 0 … 1. */
const FLASH_SHADER = `
  uniform sampler2D colorTexture;
  uniform float flash;
  in vec2 v_textureCoordinates;

  void main() {
    vec4 sceneColor = texture(colorTexture, v_textureCoordinates);
    out_FragColor = vec4(sceneColor.rgb + vec3(flash), sceneColor.a);
  }
`

/**
 * Thunderstorm (WMO codes 95–99): the whole image lights up for a moment at
 * random intervals.
 */
export function createLightningEffect(viewer: Viewer): WeatherEffect {
  const { scene } = viewer
  // People who asked for reduced motion get no flashing image.
  const allowFlashes = !prefersReducedMotion()

  let stormy = false
  /** Strength of a flash at its peak: stronger in the dark */
  let peak = 0.5
  /** Current brightness of the flash, fades to 0 */
  let flash = 0
  /** Seconds until the next flash */
  let pause = MIN_PAUSE

  const stage = new PostProcessStage({
    fragmentShader: FLASH_SHADER,
    uniforms: { flash: () => flash },
  })
  stage.enabled = false
  scene.postProcessStages.add(stage)

  return {
    update(weather: HourlyWeather) {
      stormy = describeWeatherCode(weather.weatherCode).category === 'thunderstorm'
      peak = lerp(0.7, 0.4, weather.daylight)
    },

    animate(seconds: number) {
      // Let the current flash fade out.
      flash = Math.max(flash - (peak / FADE_SECONDS) * seconds, 0)

      if (stormy && allowFlashes) {
        pause -= seconds
        if (pause <= 0) {
          flash = peak
          pause = lerp(MIN_PAUSE, MAX_PAUSE, Math.random())
        }
      }
      // The full-screen pass only runs while a flash is visible.
      stage.enabled = flash > 0
    },

    destroy() {
      scene.postProcessStages.remove(stage)
    },
  }
}
