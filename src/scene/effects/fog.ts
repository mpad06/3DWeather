import { Cartesian3, PostProcessStage, type Viewer } from 'cesium'
import type { HourlyWeather } from '../../types/weather'
import { clamp, lerp } from '../../utils/interpolate'
import { isFogCode } from '../../utils/weatherCodes'
import type { WeatherEffect } from './types'

/** From this visibility (metres) upwards the air counts as clear: no haze at all. */
const CLEAR_VISIBILITY = 20000
/** At this visibility (metres) and below the fog has its full strength. */
const DENSE_FOG_VISIBILITY = 1000
/** Strongest blend towards the fog colour. Below 1, so the map never disappears completely. */
const MAX_FOG = 0.9
/**
 * The fog reaches about two thirds of its strength at this multiple of the
 * visibility. The factor is a design choice: with 1 the city would already
 * vanish in light haze, because the camera starts several kilometres away.
 */
const RANGE_FACTOR = 2
/** Humidity (%) above which the air becomes hazy even with a good visibility value. */
const HAZE_HUMIDITY = 85

/** Fog colours as red, green, blue (0–1). Night fog is dark grey, not black: a city lights it from below. */
const DAY_FOG_COLOR = new Cartesian3(0.8, 0.83, 0.86)
const NIGHT_FOG_COLOR = new Cartesian3(0.15, 0.17, 0.21)

/**
 * Fragment shader of the fog filter. It runs once for every pixel after the
 * scene has been drawn and receives the finished image (colorTexture) and
 * the depth of every pixel (depthTexture).
 * The further away a pixel is, the more it is blended into the fog colour.
 */
const FOG_SHADER = `
  uniform sampler2D colorTexture;
  uniform sampler2D depthTexture;
  uniform vec3 fogColor;
  uniform float fogRange;
  uniform float maxFog;
  uniform float skyFog;
  in vec2 v_textureCoordinates;

  // Distance in metres between the camera and the surface seen at this pixel.
  float distanceToCamera(float depth) {
    vec2 xy = v_textureCoordinates * 2.0 - 1.0;
    vec4 position = czm_inverseProjection * vec4(xy, depth, 1.0);
    return -position.z / position.w;
  }

  void main() {
    vec4 sceneColor = texture(colorTexture, v_textureCoordinates);
    float depth = czm_readDepth(depthTexture, v_textureCoordinates);

    float amount;
    if (depth >= 1.0) {
      // Nothing was drawn at this pixel, so it shows the sky.
      amount = skyFog;
    } else {
      // Exponential fog: rises quickly at first and then levels off at maxFog.
      amount = maxFog * (1.0 - exp(-distanceToCamera(depth) / fogRange));
    }
    out_FragColor = vec4(mix(sceneColor.rgb, fogColor, amount), sceneColor.a);
  }
`

/**
 * The visibility the scene should show, in metres. It starts with the value
 * of the forecast and is reduced by very humid air and by the fog codes.
 */
function effectiveVisibility(weather: HourlyWeather): number {
  let visibility = weather.visibility
  if (weather.humidity > HAZE_HUMIDITY) {
    // 85 % humidity: unchanged … 100 % humidity: only 60 % of the visibility
    const haze = (weather.humidity - HAZE_HUMIDITY) / (100 - HAZE_HUMIDITY)
    visibility *= lerp(1, 0.6, haze)
  }
  // WMO codes 45 and 48 mean fog, which is defined as visibility below 1 km.
  if (isFogCode(weather.weatherCode)) {
    visibility = Math.min(visibility, DENSE_FOG_VISIBILITY)
  }
  return visibility
}

/**
 * Fog and haze. Two things work together:
 * - Cesium's own fog (scene.fog), which fades distant terrain into the sky
 * - a post-process stage (the shader above), which also covers buildings
 *   and the sky and is what makes dense fog look dense
 */
export function createFogEffect(viewer: Viewer): WeatherEffect {
  const { scene } = viewer
  const defaultDensity = scene.fog.density

  // Current values of the shader inputs. The stage reads them every frame
  // through the functions in `uniforms`, so update() only changes this object.
  const settings = {
    fogColor: Cartesian3.clone(DAY_FOG_COLOR),
    fogRange: CLEAR_VISIBILITY * RANGE_FACTOR,
    maxFog: 0,
    skyFog: 0,
  }

  const stage = new PostProcessStage({
    fragmentShader: FOG_SHADER,
    uniforms: {
      fogColor: () => settings.fogColor,
      fogRange: () => settings.fogRange,
      maxFog: () => settings.maxFog,
      skyFog: () => settings.skyFog,
    },
  })
  stage.enabled = false
  scene.postProcessStages.add(stage)

  return {
    update(weather: HourlyWeather) {
      const visibility = effectiveVisibility(weather)
      // 0 = clear air … 1 = dense fog
      const murkiness = clamp(
        (CLEAR_VISIBILITY - visibility) / (CLEAR_VISIBILITY - DENSE_FOG_VISIBILITY),
        0,
        1,
      )

      settings.fogRange = Math.max(visibility, 100) * RANGE_FACTOR
      settings.maxFog = MAX_FOG * murkiness
      // The sky only turns grey in real fog, hence the square of the value.
      settings.skyFog = MAX_FOG * murkiness * murkiness
      // Fog is light grey by day and dark grey at night.
      Cartesian3.lerp(NIGHT_FOG_COLOR, DAY_FOG_COLOR, weather.daylight, settings.fogColor)

      // Skip the full-screen pass completely while the air is clear.
      stage.enabled = settings.maxFog > 0.01
      // Cesium's terrain fog: half the default when clear, double in dense fog
      scene.fog.density = lerp(defaultDensity * 0.5, defaultDensity * 2, murkiness)
    },
    destroy() {
      scene.postProcessStages.remove(stage)
      scene.fog.density = defaultDensity
    },
  }
}
