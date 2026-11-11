/**
 * The Cesium ion access token from the .env file.
 * `undefined` when the variable is missing or empty – the app then uses the
 * token-free fallback scene (see createViewer.ts).
 */
export const ionToken: string | undefined =
  import.meta.env.VITE_CESIUM_ION_TOKEN?.trim() || undefined
