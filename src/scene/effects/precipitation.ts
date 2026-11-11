import {
  BillboardCollection,
  Cartesian3,
  Color,
  Matrix4,
  Transforms,
  type Billboard,
  type Viewer,
} from 'cesium'
import type { HourlyWeather } from '../../types/weather'
import { clamp, lerp } from '../../utils/interpolate'
import { describeWeatherCode, type WeatherCategory } from '../../utils/weatherCodes'
import { pseudoRandom, windVector } from './helpers'
import type { WeatherEffect } from './types'

/*
 * Why not Cesium's ParticleSystem?
 * A ParticleSystem measures time with the clock of the scene. In this app
 * that clock is driven by the timeline: it stands still while the user looks
 * at one hour and jumps by minutes or hours when the slider moves. Rain
 * would freeze in the air, and every jump would emit thousands of particles
 * at once. This effect therefore moves its own particles with real time,
 * using the same building block the ParticleSystem uses internally: a
 * BillboardCollection (many small images that always face the camera).
 */

/** Upper limit of particles, for performance. Reached in heavy precipitation. */
const MAX_PARTICLES = 1200
/** Precipitation (mm per hour) at which all particles are in use. */
const HEAVY_PRECIPITATION_MM = 8

/**
 * The particles live in a box that is attached to the camera, a bit like
 * rain in front of a windscreen. Measured in metres along the camera's own
 * axes: x to the right, y up, z forward (into the picture).
 */
const BOX = { halfWidth: 45, halfHeight: 26, near: 8, far: 75 }

/** Look and movement of the two kinds of particles. Size in pixels, speed in m/s. */
const RAIN = { imageId: 'rain-streak', width: 2, height: 30, fallSpeed: 14, windShare: 0.5 }
const SNOW = { imageId: 'snow-flake', width: 7, height: 7, fallSpeed: 1.8, windShare: 1 }

/** Weather categories that show particles even if the amount rounds to 0.0 mm. */
const WET_CATEGORIES: WeatherCategory[] = [
  'drizzle',
  'rain',
  'freezingRain',
  'snow',
  'showers',
  'thunderstorm',
]

/** Draws a rain streak: a thin line that fades out towards the top. */
function createRainImage(): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 4
  canvas.height = 64
  const context = canvas.getContext('2d')
  if (context) {
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, 'rgba(210, 230, 255, 0)')
    gradient.addColorStop(1, 'rgba(210, 230, 255, 1)')
    context.fillStyle = gradient
    context.fillRect(0, 0, canvas.width, canvas.height)
  }
  return canvas
}

/** Draws a snowflake: a soft white dot. */
function createSnowImage(): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const context = canvas.getContext('2d')
  if (context) {
    const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    context.fillStyle = gradient
    context.fillRect(0, 0, canvas.width, canvas.height)
  }
  return canvas
}

/** Keeps a value inside min…max: what leaves on one side comes back on the other. */
function wrap(value: number, min: number, max: number): number {
  if (value > max) return value - (max - min)
  if (value < min) return value + (max - min)
  return value
}

type Particle = {
  billboard: Billboard
  /** Position in the camera box: x right, y up, z forward (metres) */
  local: Cartesian3
}

/**
 * Rain and snow as particles that fall through a box in front of the
 * camera. The amount of precipitation decides how many particles are
 * visible, the wind pushes them sideways.
 */
export function createPrecipitationEffect(viewer: Viewer): WeatherEffect {
  const { scene } = viewer
  const collection: BillboardCollection = scene.primitives.add(new BillboardCollection())
  const images = { [RAIN.imageId]: createRainImage(), [SNOW.imageId]: createSnowImage() }

  // Create all particles once, hidden, at pseudo-random places in the box.
  const particles: Particle[] = []
  for (let i = 0; i < MAX_PARTICLES; i++) {
    particles.push({
      // The real position is set in animate(); hidden until it rains.
      billboard: collection.add({ position: Cartesian3.ZERO, show: false }),
      local: new Cartesian3(
        lerp(-BOX.halfWidth, BOX.halfWidth, pseudoRandom(i * 3 + 1)),
        lerp(-BOX.halfHeight, BOX.halfHeight, pseudoRandom(i * 3 + 2)),
        lerp(BOX.near, BOX.far, pseudoRandom(i * 3 + 3)),
      ),
    })
  }

  // Current state, changed by update() and used by animate()
  let kind: typeof RAIN | null = null
  let brightness = -1
  let activeCount = 0
  /** Movement over the ground in m/s: x east, y north, z up */
  const velocity = new Cartesian3()
  // Reused for calculations to avoid creating new objects every frame
  const worldVelocity = new Cartesian3()
  const position = new Cartesian3()

  return {
    update(weather: HourlyWeather) {
      const category = describeWeatherCode(weather.weatherCode).category

      // 1. Rain or snow? Changing the look touches all particles, but it
      //    only happens when the kind really switches.
      const newKind = weather.snowfall > 0 || category === 'snow' ? SNOW : RAIN
      if (newKind !== kind) {
        kind = newKind
        for (const { billboard } of particles) {
          // The same id for all particles: the image is stored only once.
          billboard.setImage(kind.imageId, images[kind.imageId])
          billboard.width = kind.width
          billboard.height = kind.height
        }
      }

      // 2. Particles are dimmer at night (rounded, so tiny changes are skipped).
      const newBrightness = Math.round(lerp(0.4, 1, weather.daylight) * 20) / 20
      if (newBrightness !== brightness) {
        brightness = newBrightness
        const tint = new Color(brightness, brightness, brightness, 0.75)
        for (const { billboard } of particles) billboard.color = tint
      }

      // 3. How many particles? A "wet" weather code always shows a few, even
      //    if the amount rounds to 0.0 mm. The square root makes light rain
      //    clearly visible while heavy rain reaches the limit.
      const minimum = WET_CATEGORIES.includes(category) ? 0.1 : 0
      const amount = Math.max(weather.precipitation, minimum)
      const intensity = clamp(Math.sqrt(amount / HEAVY_PRECIPITATION_MM), 0, 1)
      const newCount = Math.round(intensity * MAX_PARTICLES)
      // Only the particles between the old and the new count change.
      for (let i = Math.min(newCount, activeCount); i < Math.max(newCount, activeCount); i++) {
        particles[i].billboard.show = i < newCount
      }
      activeCount = newCount

      // 4. Movement: falling speed plus the sideways push of the wind
      const wind = windVector(weather.windSpeed, weather.windDirection)
      velocity.x = wind.east * kind.windShare
      velocity.y = wind.north * kind.windShare
      velocity.z = -kind.fallSpeed
    },

    animate(seconds: number) {
      if (activeCount === 0) return
      const { camera } = scene

      // The velocity is given as east/north/up. Turn it into a direction in
      // world coordinates first (the matrix knows where east, north and up
      // are at the camera position) …
      const eastNorthUp = Transforms.eastNorthUpToFixedFrame(camera.positionWC)
      Matrix4.multiplyByPointAsVector(eastNorthUp, velocity, worldVelocity)
      // … and then into the camera's own axes. The dot product tells how
      // much of the movement goes along each axis.
      const stepRight = Cartesian3.dot(worldVelocity, camera.rightWC) * seconds
      const stepUp = Cartesian3.dot(worldVelocity, camera.upWC) * seconds
      const stepForward = Cartesian3.dot(worldVelocity, camera.directionWC) * seconds

      for (let i = 0; i < activeCount; i++) {
        const { billboard, local } = particles[i]
        // Move, and wrap around at the walls of the box: endless rain
        local.x = wrap(local.x + stepRight, -BOX.halfWidth, BOX.halfWidth)
        local.y = wrap(local.y + stepUp, -BOX.halfHeight, BOX.halfHeight)
        local.z = wrap(local.z + stepForward, BOX.near, BOX.far)

        // World position = camera position + the three offsets along its axes
        position.x =
          camera.positionWC.x +
          camera.rightWC.x * local.x +
          camera.upWC.x * local.y +
          camera.directionWC.x * local.z
        position.y =
          camera.positionWC.y +
          camera.rightWC.y * local.x +
          camera.upWC.y * local.y +
          camera.directionWC.y * local.z
        position.z =
          camera.positionWC.z +
          camera.rightWC.z * local.x +
          camera.upWC.z * local.y +
          camera.directionWC.z * local.z
        billboard.position = position
      }
    },

    destroy() {
      scene.primitives.remove(collection)
    },
  }
}
