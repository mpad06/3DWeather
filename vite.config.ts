import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// Cesium loads web workers, textures and widget assets at runtime via URL.
// These files are not part of the JavaScript bundle, so we copy them out of
// node_modules into one folder and tell Cesium where that folder is.
const cesiumSource = 'node_modules/cesium/Build/Cesium'
const cesiumBaseUrl = 'cesiumStatic'
const cesiumFolders = ['Workers', 'ThirdParty', 'Assets', 'Widgets']

// https://vite.dev/config/
export default defineConfig({
  define: {
    // Cesium reads this global to build the URLs of its static assets.
    CESIUM_BASE_URL: JSON.stringify(`/${cesiumBaseUrl}`),
  },
  build: {
    // Cesium alone is about 4 MB of JavaScript. It is already split into its
    // own lazily loaded chunk (see App.tsx), so the default 500 kB warning
    // would only be noise.
    chunkSizeWarningLimit: 4500,
  },
  plugins: [
    react(),
    // Serves the folders during `npm run dev` and copies them into
    // dist/cesiumStatic during `npm run build`.
    viteStaticCopy({
      targets: cesiumFolders.map((folder) => ({
        src: `${cesiumSource}/${folder}`,
        dest: cesiumBaseUrl,
        // The plugin keeps the source folder structure. Strip the four leading
        // segments (node_modules/cesium/Build/Cesium) so that the result is
        // cesiumStatic/Workers, cesiumStatic/Assets, ...
        rename: { stripBase: 4 },
      })),
    }),
  ],
})
