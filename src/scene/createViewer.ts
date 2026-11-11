import {
  createOsmBuildingsAsync,
  EllipsoidTerrainProvider,
  ImageryLayer,
  Ion,
  OpenStreetMapImageryProvider,
  Rectangle,
  Terrain,
  Viewer,
} from 'cesium'
import { ionToken } from './ionToken'

/**
 * Options shared by both scene variants. All built-in Cesium widgets are
 * switched off because the app brings its own UI (HUD and timeline).
 */
const BASE_OPTIONS: Viewer.ConstructorOptions = {
  animation: false,
  timeline: false,
  baseLayerPicker: false,
  geocoder: false,
  homeButton: false,
  sceneModePicker: false,
  navigationHelpButton: false,
  fullscreenButton: false,
  infoBox: false,
  selectionIndicator: false,
  // The Cesium clock must not run on its own; our timeline sets the time.
  shouldAnimate: false,
  // We only ever show the 3D globe, so Cesium can skip the 2D variants.
  scene3DOnly: true,
}

/** Rough outline of Germany, used as the first view before flying to a city. */
const GERMANY = Rectangle.fromDegrees(5.0, 46.5, 15.5, 55.5)

/** OpenStreetMap tiles need no API key – this is the token-free map layer. */
function createOsmLayer(): ImageryLayer {
  const provider = new OpenStreetMapImageryProvider({
    url: 'https://tile.openstreetmap.org/',
    credit: '© OpenStreetMap-Mitwirkende',
  })
  return new ImageryLayer(provider)
}

/** Fallback scene: flat globe (no terrain heights) with the OpenStreetMap layer. */
function createFallbackViewer(container: HTMLElement): Viewer {
  return new Viewer(container, {
    ...BASE_OPTIONS,
    baseLayer: createOsmLayer(),
    terrainProvider: new EllipsoidTerrainProvider(),
  })
}

/** Loads the 3D buildings. A failure only means "no buildings", never a crash. */
async function addOsmBuildings(viewer: Viewer): Promise<void> {
  try {
    const buildings = await createOsmBuildingsAsync()
    // The viewer may already be destroyed while we were waiting (the user left
    // the page, or React StrictMode unmounted the component once).
    if (viewer.isDestroyed()) {
      buildings.destroy()
      return
    }
    viewer.scene.primitives.add(buildings)
  } catch (error) {
    console.warn('Cesium OSM Buildings could not be loaded.', error)
  }
}

/** Full scene: Cesium World Terrain, aerial imagery and OSM Buildings via Cesium ion. */
function createIonViewer(
  container: HTMLElement,
  token: string,
  onIonError: () => void,
): Viewer {
  Ion.defaultAccessToken = token
  const terrain = Terrain.fromWorldTerrain()
  const imagery = ImageryLayer.fromWorldImagery({})
  const viewer = new Viewer(container, { ...BASE_OPTIONS, terrain, baseLayer: imagery })

  // An invalid or expired token (or no connection to ion) must not break the
  // app. Both objects load asynchronously and report failures through an
  // event, so we switch to the fallback scene when either of them fails.
  let usesFallback = false
  const useFallbackScene = () => {
    if (usesFallback || viewer.isDestroyed()) return
    usesFallback = true
    // While world terrain is loading the globe has no terrain provider and is
    // not drawn. After a failed load it would stay invisible, so we have to
    // give it the flat terrain explicitly.
    viewer.scene.terrainProvider = new EllipsoidTerrainProvider()
    viewer.imageryLayers.removeAll()
    viewer.imageryLayers.add(createOsmLayer())
    onIonError()
  }
  terrain.errorEvent.addEventListener(useFallbackScene)
  imagery.errorEvent.addEventListener(useFallbackScene)

  addOsmBuildings(viewer)
  return viewer
}

/**
 * Creates the Cesium viewer inside the given DOM element.
 *
 * With a token in .env the scene uses 3D terrain and buildings from Cesium
 * ion; without one it falls back to a flat OpenStreetMap globe.
 *
 * @param onIonError called when a token is configured but ion cannot be used
 */
export function createViewer(container: HTMLElement, onIonError: () => void): Viewer {
  const viewer = ionToken
    ? createIonViewer(container, ionToken, onIonError)
    : createFallbackViewer(container)

  const { scene } = viewer
  // Light the globe from the real sun position, so night is dark.
  scene.globe.enableLighting = true
  // By default Cesium only darkens the night side when the camera is far out
  // in space and shows the ground fully lit when it is close. Both distances
  // are measured from the centre of the Earth (radius about 6,371 km), so
  // these tiny values keep the day/night shading switched on at any height.
  scene.globe.lightingFadeOutDistance = 0
  scene.globe.lightingFadeInDistance = 1
  // The blue haze that is drawn over the globe when seen from space uses the
  // same two distances. We never look from that far, so switch it off.
  scene.globe.showGroundAtmosphere = false
  // Hide clouds, rain and buildings that are behind a mountain.
  scene.globe.depthTestAgainstTerrain = true
  // Start above Germany instead of Cesium's default view of North America.
  viewer.camera.setView({ destination: GERMANY })

  return viewer
}
