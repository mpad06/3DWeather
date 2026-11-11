import { useEffect, useRef, useState } from 'react'
import type { Viewer } from 'cesium'
// Styles of the Cesium widget (canvas size, credit line)
import 'cesium/Build/Cesium/Widgets/widgets.css'
import { flyToLocation } from '../scene/camera'
import { createViewer } from '../scene/createViewer'
import { isWebGlAvailable } from '../scene/webgl'
import { ErrorMessage } from './ErrorMessage'
import styles from './CesiumViewer.module.css'

type CesiumViewerProps = {
  lat: number
  lon: number
  /** Ground height of the location in metres above sea level */
  elevation: number
  /**
   * Called when a Cesium ion token is configured but cannot be used.
   * Must be a stable function (useCallback), because a new function would
   * re-run the effect below and rebuild the whole viewer.
   */
  onIonError: () => void
}

/**
 * Renders the Cesium 3D scene.
 *
 * Cesium is not a React library: it creates its own canvas and manages it
 * imperatively. This component is the bridge – React only provides an empty
 * <div>, and effects translate prop changes into Cesium calls.
 */
export function CesiumViewer({ lat, lon, elevation, onIonError }: CesiumViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  // The viewer lives in a ref, not in state: changing it must not re-render
  // the component, and React should never try to compare or copy it.
  const viewerRef = useRef<Viewer | null>(null)
  // Checked once on the first render (lazy initial state)
  const [webGlAvailable] = useState(isWebGlAvailable)

  // Create the viewer once after the <div> exists, destroy it on unmount.
  // React StrictMode runs this effect twice in development (mount → unmount →
  // mount); the cleanup makes sure that only one viewer is alive afterwards.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const viewer = createViewer(container, onIonError)
    viewerRef.current = viewer

    return () => {
      viewerRef.current = null
      viewer.destroy()
    }
  }, [onIonError])

  // Move the camera whenever the location changes.
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return
    flyToLocation(viewer, lat, lon, elevation)
  }, [lat, lon, elevation])

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
