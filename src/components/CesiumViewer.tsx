import { useEffect, useRef, useState } from 'react'
import type { Viewer } from 'cesium'
// Styles of the Cesium widget (canvas size, credit line)
import 'cesium/Build/Cesium/Widgets/widgets.css'
import { flyToLocation } from '../scene/camera'
import { createViewer } from '../scene/createViewer'
import { createWeatherEffects } from '../scene/effects'
import type { WeatherEffect } from '../scene/effects/types'
import { setSceneTime } from '../scene/sceneTime'
import { isWebGlAvailable } from '../scene/webgl'
import type { HourlyWeather } from '../types/weather'
import { ErrorMessage } from './ErrorMessage'
import styles from './CesiumViewer.module.css'

type CesiumViewerProps = {
  lat: number
  lon: number
  /** Ground height of the location in metres above sea level */
  elevation: number
  /** Weather of the selected moment; drives time of day and weather effects */
  weather: HourlyWeather
  /**
   * Called when a Cesium ion token is configured but cannot be used.
   * Must be a stable function (useCallback), because a new function would
   * re-run the first effect below and rebuild the whole scene.
   */
  onIonError: () => void
}

/** Everything that belongs to one built scene. */
type Scene3D = {
  viewer: Viewer
  effects: WeatherEffect
}

/**
 * Renders the Cesium 3D scene.
 *
 * Cesium is not a React library: it creates its own canvas and manages it
 * imperatively. This component is the bridge – React only provides an empty
 * <div>, and two effects translate props into Cesium calls:
 * 1. build the scene for a location (and tear it down again)
 * 2. apply the weather of the selected moment
 */
export function CesiumViewer({ lat, lon, elevation, weather, onIonError }: CesiumViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  // The scene lives in a ref, not in state: changing it must not re-render
  // the component, and React should never try to compare or copy it.
  const sceneRef = useRef<Scene3D | null>(null)
  // Checked once on the first render (lazy initial state)
  const [webGlAvailable] = useState(isWebGlAvailable)

  // 1. Build the scene once the <div> exists; destroy it on unmount.
  // React StrictMode runs this effect twice in development (mount → unmount →
  // mount); the cleanup makes sure that only one viewer is alive afterwards.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const viewer = createViewer(container, onIonError)
    const effects = createWeatherEffects(viewer, { lat, lon, elevation })
    flyToLocation(viewer, lat, lon, elevation)
    sceneRef.current = { viewer, effects }

    return () => {
      sceneRef.current = null
      // Order matters: the effects remove their objects from the viewer,
      // so they must go first.
      effects.destroy()
      viewer.destroy()
    }
  }, [lat, lon, elevation, onIonError])

  // 2. Follow the timeline: time of day and weather of the selected moment.
  // The location values are listed as dependencies too, so the weather is
  // applied again after effect 1 has rebuilt the scene for a new location.
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return
    setSceneTime(scene.viewer, weather.timestamp)
    scene.effects.update(weather)
  }, [weather, lat, lon, elevation, onIonError])

  if (!webGlAvailable) {
    return (
      <div className={styles.unavailable}>
        <ErrorMessage
          title="3D-Ansicht nicht verfügbar"
          message="Dein Browser oder Gerät unterstützt kein WebGL. Die Wetterdaten werden trotzdem angezeigt."
        />
      </div>
    )
  }

  return <div ref={containerRef} className={styles.viewer} />
}
