# 3D Wetter

A 3D weather app for Germany. Pick a city or use your GPS position, and the app shows the
48-hour forecast of the German Weather Service (DWD) as a 3D scene: clouds, rain, snow, fog,
wind and daylight change as you move along a timeline.

The user interface is in German. Code, identifiers and comments are in English.

Portfolio exam project for the module "Web-Programmierung" (DHBW).

## Features

- **Landing page** that explains the app, with a city search (52 locations) and a
  "use my location" button
- **Search with validation**: autocomplete, tolerant of umlaut spellings ("munchen",
  "muenchen" and "München" all work), keyboard navigation, inline error for unknown cities
- **Weather view** with a full-screen 3D globe (CesiumJS), a panel with all values of the
  selected hour, and a 48-hour timeline with a temperature and precipitation chart
- **Playback**: the timeline can run like a film (1×, 2×, 4×); values are interpolated between
  the forecast hours, so the 3D weather changes gradually
- **Weather effects**: three cloud layers, rain and snow particles, fog, a darker sky under
  cloud and rain, lightning flashes in thunderstorms, a wind arrow, real day and night
- **Shareable URLs**: the location is stored in the URL (`/weather?city=mannheim`)
- Works on desktop and mobile, with loading and error states for every request

## Getting started

Requirements: [Node.js](https://nodejs.org/) 20.19 or newer (22.12 or newer is recommended).

```bash
git clone <repository-url>
cd 3DWeather
npm install
npm run dev
```

Then open the address that Vite prints (normally <http://localhost:5173>).

The app starts and works without any configuration. The weather data needs no API key.

### Optional: 3D terrain and buildings

Without further setup the globe is flat and shows the OpenStreetMap map. For real terrain
heights, aerial imagery and 3D buildings the app needs a free
[Cesium ion](https://ion.cesium.com/tokens) access token:

1. Copy `.env.example` to `.env`.
2. Paste your token after `VITE_CESIUM_ION_TOKEN=`.
3. Restart `npm run dev`.

`.env` is listed in `.gitignore` and is never committed. If the token is missing, invalid or
Cesium ion cannot be reached, the app falls back to the flat map and shows a notice.

## Scripts

| Command           | What it does                                                    |
| ----------------- | --------------------------------------------------------------- |
| `npm run dev`     | Starts the development server with hot reloading                |
| `npm run build`   | Type-checks the project (`tsc -b`) and builds it into `dist/`   |
| `npm run preview` | Serves the finished build from `dist/` for a final check        |
| `npm run lint`    | Checks the code with ESLint                                     |

## Tech stack

| Area      | Choice                                                                    |
| --------- | ------------------------------------------------------------------------- |
| Framework | React 19 with TypeScript 6 (strict)                                       |
| Build     | Vite 8                                                                    |
| Routing   | react-router-dom 7                                                        |
| 3D        | CesiumJS 1.147, used directly without a React wrapper                     |
| Styling   | Plain CSS with CSS Modules and CSS custom properties, no UI kit           |
| Data      | Open-Meteo forecast API via the browser's `fetch`, no API key             |
| State     | React state and custom hooks, no state library                            |

The only build helper is `vite-plugin-static-copy`. Cesium loads web workers and images at
runtime, so `vite.config.ts` copies them from `node_modules` into `cesiumStatic/` and tells
Cesium that address through the global `CESIUM_BASE_URL`.

## Data sources and licences

| Data                     | Source                                                                                             | Licence                    |
| ------------------------ | -------------------------------------------------------------------------------------------------- | -------------------------- |
| Weather forecast         | [Open-Meteo.com](https://open-meteo.com/), model ICON of the Deutscher Wetterdienst (DWD)           | CC BY 4.0                  |
| Map (without token)      | © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors                            | ODbL                       |
| Terrain, imagery, buildings (with token) | [Cesium ion](https://cesium.com/platform/cesium-ion/): Cesium World Terrain, Bing Maps imagery, Cesium OSM Buildings | Terms of Cesium ion |
| 3D engine                | [CesiumJS](https://cesium.com/platform/cesiumjs/)                                                  | Apache 2.0                 |
| City list                | Population as of 31.12.2025 (official population update based on the 2022 census), taken from the Wikipedia list "Liste der Großstädte in Deutschland"; coordinates from the Open-Meteo geocoding API | CC BY-SA 4.0 / CC BY 4.0 |

The forecast request uses `models=icon_seamless`: ICON-D2 with a 2 km grid for Germany and the
Alps (which includes Basel), blended with ICON-EU and ICON Global where D2 has no data.

The city list holds the 51 largest German cities plus Basel. Coordinates were looked up once
during development and are hardcoded in `src/data/cities.ts`, so the app sends no geocoding
request at runtime.

## Folder structure

```
src/
  main.tsx              Entry point: renders <App /> into the page
  App.tsx               Router setup only (routes, lazy loading, error boundary)
  pages/                One component per route
    LandingPage.tsx       /         explanation, search, GPS button
    WeatherPage.tsx       /weather  URL → location → forecast → loading/error/view
    NotFoundPage.tsx      *         every other address
  components/           Reusable UI components, each with its CSS Module next to it
    ForecastView.tsx      the weather view; owns the timeline state
    CesiumViewer.tsx      bridge between React and the Cesium scene
    WeatherHud.tsx        values of the selected hour
    Timeline.tsx          slider, labels and keyboard control
    TimelineChart.tsx     hand-built SVG chart
    SearchBar.tsx         city search with validation
    LocateButton.tsx      GPS button
    ...                   smaller parts (icons, notices, spinner, error message)
  hooks/                Custom hooks
    useWeather.ts         loads and caches the forecast
    useTimelinePlayback.ts  selected position and playback
    useGeolocation.ts     browser Geolocation API
    useDocumentTitle.ts   title of the browser tab
  services/
    openMeteo.ts          the only place that talks to the weather API
  scene/                Everything that calls Cesium (no React in here)
    createViewer.ts       creates the viewer, with and without token
    camera.ts             camera flight to the location
    sceneTime.ts          sets the time of day
    effects/              one module per weather effect
  data/
    cities.ts             the 52 locations
  utils/                Pure helper functions (no React, no Cesium)
  types/                Shared TypeScript types
  styles/               Design tokens and global base styles
docs/
  CODE_WALKTHROUGH.md   Guide through the code for the exam walkthrough
```

## Data flow

The data flows in one direction, from the URL down to the 3D scene:

```
URL search params            /weather?city=mannheim  or  ?lat=49.489&lon=8.467
        │  readLocation()         utils/location.ts
        ▼
WeatherPage                  resolves the location; shows error for invalid params
        │  useWeather(lat, lon)   hooks/useWeather.ts → services/openMeteo.ts
        ▼
loading │ error │ success    one of four screens, derived from the hook's status
        ▼
ForecastView                 state: timeline position, playback, speed
        │  interpolateWeather()   utils/interpolate.ts → weather of the selected moment
        ├──────────────► WeatherHud      shows the values
        ├──────────────► Timeline        shows the position; reports user input via callbacks
        └──────────────► CesiumViewer    effect: scene time + weather effects
```

- The **location** lives in the URL, not in React state. That makes the weather view
  reloadable and shareable, and the browser's back button works.
- The **forecast** lives in the `useWeather` hook (with a 15-minute in-memory cache).
- The **selected hour** lives in `ForecastView` (through `useTimelinePlayback`). Everything
  below receives it as props; user actions travel back up through callback props.
- The **3D scene** is not React state. `CesiumViewer` keeps it in a ref and updates it in
  effects.

## Design notes

- **Time of day.** The Cesium clock does not run by itself. The timeline sets it to the
  selected forecast moment, so the sun stands where it really will.
- **Rain and snow** do not use Cesium's `ParticleSystem`. A particle system advances with the
  scene clock, which here stands still or jumps by hours; rain would freeze or burst. The
  effect in `scene/effects/precipitation.ts` moves its own billboards in real time instead.
- **Camera.** The camera looks only slightly down (9°), so the horizon, the sky and the clouds
  are part of the picture.
- **Cloud heights** are compressed compared to reality, so that all three layers are visible
  in the band of sky above the horizon.

## Known limits

- The forecast covers Germany and Basel. Other positions still get a forecast, with a notice
  that the accuracy may be lower.
- Without a Cesium ion token the map tiles come from the public OpenStreetMap tile server,
  which is meant for light use only.
- The 3D scene needs WebGL. Without it the weather values and the timeline still work and a
  message replaces the scene.
