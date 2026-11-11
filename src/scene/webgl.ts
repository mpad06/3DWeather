/**
 * Checks whether the browser can create a WebGL context.
 * Cesium needs WebGL; without it we show a message instead of a blank page.
 */
export function isWebGlAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    return context !== null
  } catch {
    return false
  }
}
