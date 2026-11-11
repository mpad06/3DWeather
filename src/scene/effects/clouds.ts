import {
  Cartesian2,
  Cartesian3,
  CloudCollection,
  Color,
  Matrix4,
  type CumulusCloud,
  type Viewer,
} from 'cesium'
import type { HourlyWeather } from '../../types/weather'
import { lerp } from '../../utils/interpolate'
import { localFrameAt, pseudoRandom, windVector } from './helpers'
import type { SceneLocation, WeatherEffect } from './types'

/** Description of one cloud layer. Heights and sizes are in metres. */
type LayerConfig = {
  /** Which cloud cover value of the forecast controls this layer */
  cover: 'cloudCoverLow' | 'cloudCoverMid' | 'cloudCoverHigh'
  /** Number of clouds at 100 % cover */
  count: number
  /** Height of the layer above the ground */
  height: number
  /** The clouds are spread over a square of ± this distance around the location */
  spread: number
  /** Width of one cloud; the height is derived from it */
  size: number
  /** Opacity: high ice clouds are thin veils, low clouds are solid */
  alpha: number
}

/*
 * All layers lie above the camera (1500 m), so the clouds appear in the sky
 * and never hide the city. Real mid and high clouds are higher (up to 12 km);
 * the heights are compressed so that all three layers are visible in the
 * band of sky above the horizon. Layers that are further up are spread wider
 * and use larger clouds, because they are seen from further away.
 */
const LAYERS: LayerConfig[] = [
  { cover: 'cloudCoverLow', count: 50, height: 2100, spread: 14000, size: 2600, alpha: 1 },
  { cover: 'cloudCoverMid', count: 40, height: 3600, spread: 28000, size: 6000, alpha: 0.9 },
  { cover: 'cloudCoverHigh', count: 30, height: 5600, spread: 50000, size: 13000, alpha: 0.55 },
]

/**
 * Real clouds move too slowly to notice from this distance, so the drift is
 * exaggerated. The direction is the true wind direction.
 */
const DRIFT_SPEED_UP = 6

/** One cloud together with the data needed to move and show it. */
type CloudItem = {
  cloud: CumulusCloud
  layer: LayerConfig
  /** Position relative to the location: x east, y north, z up (metres) */
  local: Cartesian3
  /** Billboard size at 100 % cover */
  baseSize: Cartesian2
  /** The cloud is shown when the cover of its layer is above this share (0–1) */
  threshold: number
}

/**
 * Clouds in three height layers, built with Cesium's CloudCollection
 * (procedural cumulus clouds drawn as billboards).
 *
 * All clouds are created once. update() only switches them on and off and
 * changes size and brightness, so nothing is rebuilt while the timeline runs.
 */
export function createCloudEffect(viewer: Viewer, location: SceneLocation): WeatherEffect {
  const { scene } = viewer
  const collection: CloudCollection = scene.primitives.add(new CloudCollection())
  const localToWorld = localFrameAt(location)
  const items: CloudItem[] = []
  // Reused for calculations to avoid creating new objects every frame.
  // (Cesium copies the values when they are assigned to a cloud.)
  const scratch = new Cartesian3()
  const scaleScratch = new Cartesian2()
  let wind = { east: 0, north: 0 }

  function place(item: CloudItem) {
    item.cloud.position = Matrix4.multiplyByPoint(localToWorld, item.local, scratch)
  }

  let seed = 1
  for (const layer of LAYERS) {
    for (let i = 0; i < layer.count; i++) {
      // Four pseudo-random numbers per cloud: position (2), size, visibility
      const [a, b, c, d] = [seed++, seed++, seed++, seed++].map(pseudoRandom)
      const width = layer.size * lerp(0.7, 1.3, c)
      const item: CloudItem = {
        layer,
        local: new Cartesian3(
          lerp(-layer.spread, layer.spread, a),
          lerp(-layer.spread, layer.spread, b),
          layer.height * lerp(0.85, 1.15, c),
        ),
        baseSize: new Cartesian2(width, width * 0.45),
        threshold: d,
        cloud: collection.add({
          show: false,
          // maximumSize shapes the cloud inside its billboard, slice picks the
          // cross-section that is drawn (values as in the Cesium examples).
          maximumSize: new Cartesian3(lerp(25, 40, a), lerp(10, 14, b), lerp(12, 18, c)),
          slice: lerp(0.3, 0.5, d),
          color: Color.WHITE.withAlpha(layer.alpha),
        }),
      }
      place(item)
      items.push(item)
    }
  }

  return {
    update(weather: HourlyWeather) {
      wind = windVector(weather.windSpeed, weather.windDirection)

      // Thick cloud and rain make clouds grey, night makes them dark.
      const greyness = Math.max(weather.cloudCover / 100 - 0.5, 0) // 0 … 0.5
      const brightness = (1 - greyness * 0.7) * lerp(0.18, 1, weather.daylight)

      for (const item of items) {
        const cover = weather[item.layer.cover] / 100
        item.cloud.show = cover > item.threshold
        if (!item.cloud.show) continue
        // Clouds grow with the cover, so that they merge into a closed deck.
        const growth = lerp(0.8, 1.7, cover)
        item.cloud.scale = Cartesian2.multiplyByScalar(item.baseSize, growth, scaleScratch)
        item.cloud.brightness = brightness
      }
    },

    animate(seconds: number) {
      const stepEast = wind.east * seconds * DRIFT_SPEED_UP
      const stepNorth = wind.north * seconds * DRIFT_SPEED_UP
      if (stepEast === 0 && stepNorth === 0) return

      for (const item of items) {
        const { spread } = item.layer
        item.local.x += stepEast
        item.local.y += stepNorth
        // A cloud that leaves the area on one side comes back in on the other.
        if (item.local.x > spread) item.local.x -= 2 * spread
        if (item.local.x < -spread) item.local.x += 2 * spread
        if (item.local.y > spread) item.local.y -= 2 * spread
        if (item.local.y < -spread) item.local.y += 2 * spread
        place(item)
      }
    },

    destroy() {
      // remove() also frees the WebGL resources of the collection
      scene.primitives.remove(collection)
    },
  }
}
