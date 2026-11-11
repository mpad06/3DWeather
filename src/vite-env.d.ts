/// <reference types="vite/client" />

// Types for our own environment variables (see .env.example).
// Vite only exposes variables that start with VITE_ to the browser code.
interface ImportMetaEnv {
  readonly VITE_CESIUM_ION_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
