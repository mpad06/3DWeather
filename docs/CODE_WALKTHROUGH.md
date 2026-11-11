# Code walkthrough

A guide through the code along the four topics of the exam walkthrough. Each section names
the files to open, explains what they do in the order that is easiest to present, and ends
with questions that are likely to come up.

All paths are relative to `src/`.

---

## 1. General project structure

### What to show

| Open                  | What to say                                                                                   |
| --------------------- | --------------------------------------------------------------------------------------------- |
| `main.tsx`            | Entry point. Loads the global styles and renders `<App />` inside `StrictMode`.               |
| `App.tsx`             | Only the router: three routes, an error boundary and the lazy-loaded weather page.            |
| `pages/`              | One component per route. Pages connect data and components; they contain little markup.       |
| `components/`         | Reusable UI parts. Each has its styles in a CSS Module file with the same name next to it.    |
| `hooks/`              | Logic with state that is not tied to one component (forecast, playback, GPS).                 |
| `services/openMeteo.ts` | The only file that knows the weather API.                                                   |
| `scene/`              | Everything that calls Cesium. No React in this folder.                                        |
| `utils/`, `types/`, `data/` | Pure functions, shared types and the static city list.                                  |
| `styles/tokens.css`   | All colours, spacings and radii as CSS custom properties.                                     |

### The idea behind the folders

The folders separate three kinds of code that change for different reasons:

1. **React UI** (`pages`, `components`, `hooks`): what the user sees and does.
2. **Imperative 3D code** (`scene`): Cesium is not a React library. Keeping it in plain
   TypeScript modules means the React components stay small and the scene code can be read
   without knowing React.
3. **Pure logic** (`utils`, `services`, `data`): functions without side effects on the UI,
   such as `normalizeText`, `haversineKm` or `interpolateWeather`. They take values and
   return values, which makes them easy to explain and to test.

### Routing

`App.tsx` defines the routes with `BrowserRouter`, `Routes` and `Route`:

- `/` → `LandingPage`
- `/weather` → `WeatherPage` (reads `?city=` or `?lat=&lon=`)
- `*` → `NotFoundPage`

`WeatherPage` is imported with `lazy()`. Cesium is about 4 MB of JavaScript; lazy loading puts
it into a separate file that the browser only downloads when the user opens `/weather`.
`Suspense` shows a spinner while that file loads.

### Likely questions

- **Why is the location in the URL and not in a global store?** A URL can be reloaded, shared
  and bookmarked, and the back button works. The app has no other state that several routes
  need, so a store would add code without a benefit.
- **What does `StrictMode` do?** In development React mounts every component twice (mount,
  unmount, mount) to reveal effects that do not clean up. `CesiumViewer` is written so that
  this leaves exactly one viewer.
- **Why CSS Modules?** Class names are local to their component, so two components can both
  have a `.title` class. Shared values come from the variables in `tokens.css`.
- **What is the error boundary for?** If a component throws while rendering,
  `ErrorBoundary` shows a message with a reload button instead of a blank page. It is the
  only class component, because React offers this feature only through class lifecycle
  methods.

---

## 2. Structure of an important component

### `components/CesiumViewer.tsx`

The component is the bridge between React (declarative) and Cesium (imperative).

Walk through it from top to bottom:

1. **Props**: `lat`, `lon`, `elevation`, `weather`, `onIonError`. The component gets
   everything from its parent and has no data fetching of its own.
2. **`containerRef`**: React renders one empty `<div>`. Cesium creates its `<canvas>` inside.
3. **`sceneRef`**: the viewer and the effects live in a ref, not in state. Changing a ref
   does not re-render, and React never tries to copy or compare the Cesium objects.
4. **Effect 1, build and destroy**: runs after the `<div>` exists. It calls three functions
   from `scene/`:
   - `createViewer` (`scene/createViewer.ts`): creates the `Viewer` with all default
     widgets switched off. With a token it uses Cesium World Terrain and OSM Buildings;
     without one, or if ion rejects the token, a flat globe with OpenStreetMap tiles.
   - `createWeatherEffects` (`scene/effects/index.ts`): creates the six effects.
   - `flyToLocation` (`scene/camera.ts`): moves the camera.

   The **cleanup function** destroys the effects first and then the viewer.
5. **Effect 2, follow the timeline**: runs whenever `weather` changes. It sets the scene time
   (`scene/sceneTime.ts`) and calls `effects.update(weather)`.
6. **No WebGL**: `isWebGlAvailable()` is checked once. Without WebGL the component renders a
   message instead of the `<div>`.

### The weather effects (`scene/effects/`)

Every effect has the same shape, defined in `types.ts`:

```ts
type WeatherEffect = {
  update(weather: HourlyWeather): void // apply new values
  animate?(seconds: number): void      // move forward, called every frame
  destroy(): void                      // remove everything from the scene
}
```

| File               | What it changes                                                        | Driven by                                   |
| ------------------ | ---------------------------------------------------------------------- | ------------------------------------------- |
| `sky.ts`           | Saturation and brightness of sky, horizon haze and map imagery         | cloud cover, precipitation                  |
| `fog.ts`           | Cesium fog density and a post-process shader that fades distant pixels | visibility, humidity, weather codes 45/48   |
| `clouds.ts`        | `CloudCollection` with three height layers; clouds drift with the wind | low/mid/high cloud cover, wind, daylight    |
| `precipitation.ts` | Rain streaks or snowflakes in a box in front of the camera             | precipitation, snowfall, weather code, wind |
| `lightning.ts`     | Short white flashes over the whole image                               | weather codes 95–99                         |
| `wind.ts`          | Arrow above the location                                               | wind direction and speed                    |

`index.ts` bundles them: `update()` passes the weather to all effects, and one listener on
Cesium's `preUpdate` event measures the real time since the last frame and calls
`animate(seconds)`.

### `components/Timeline.tsx` (second example)

`Timeline` is a **controlled component**: it has no state. It receives `position`,
`isPlaying` and `speed` as props and reports every user action through callbacks (`onSeek`,
`onStep`, `onTogglePlay`, `onSpeedChange`). It is composed of `PlaybackControls`,
`TimelineIcons`, `TimelineChart`, a native `<input type="range">` and `TimelineLabels`.

### Likely questions

- **Why a ref and not state for the viewer?** State is for values that the UI is derived
  from. The viewer is an external object with its own render loop; putting it in state would
  cause re-renders for no reason.
- **Why two effects?** They have different triggers. Building the scene is expensive and
  depends on the location; applying the weather is cheap and happens up to 20 times per
  second during playback.
- **Why does the cleanup order matter?** The effects remove their objects from the viewer.
  If the viewer were destroyed first, they would call methods on a destroyed object.
- **Why no `ParticleSystem` for the rain?** A Cesium particle system advances with the scene
  clock. Here the timeline controls that clock: it stands still while one hour is selected and
  jumps when the slider moves. Rain would freeze, and each jump would emit thousands of
  particles at once. `precipitation.ts` therefore moves its own billboards using real time.
- **What does "only update when values change" mean here?** Effect 2 depends on the `weather`
  object, which `ForecastView` creates with `useMemo` and which only changes when the timeline
  position changes. Inside the effects, objects are created once and then only modified: for
  example, clouds are shown and hidden, never rebuilt.
- **How is the chart drawn without a library?** `TimelineChart.tsx` computes a `<polyline>`
  for the temperature and one `<rect>` per hour for the precipitation in a fixed coordinate
  system (10 units per hour). The SVG is then stretched to the available width.

---

## 3. State management and user events

### Where each piece of state lives

| State                               | Where                                    | Why there                                         |
| ----------------------------------- | ---------------------------------------- | ------------------------------------------------- |
| Selected location                   | URL search params                        | reloadable, shareable, back button works          |
| Forecast, loading, error            | `hooks/useWeather.ts`                    | one place for request, cache and retry            |
| Timeline position, playing, speed   | `hooks/useTimelinePlayback.ts`, called in `ForecastView` | needed by HUD, timeline and 3D scene |
| Search text, open list, highlighted suggestion, error | `components/SearchBar.tsx` | only the search bar needs it            |
| GPS status and error                | `hooks/useGeolocation.ts`                | only the GPS button needs it                      |
| HUD details open/closed             | `components/WeatherHud.tsx`              | purely visual                                     |

Rule used throughout: state lives in the lowest component that all its users share, and
values that can be calculated from other values are **derived, not stored**. Examples:

- `isPlaying` in `useTimelinePlayback` is `playRequested && !atEnd`, so playback stops at the
  last hour without an extra effect.
- The loading status in `useWeather` is derived from "does the stored result belong to the
  current request?".
- The weather of the selected moment is computed in `ForecastView` with
  `interpolateWeather(hours, position)` inside `useMemo`.
- The suggestions in `SearchBar` are computed from the query with `searchCities`.

### Event: search

1. The user types → `handleChange` stores the text, opens the list and clears the error.
2. `searchCities` (`utils/citySearch.ts`) normalises the text with `normalizeText`
   (`utils/normalize.ts`: lower case, umlauts and "ae/oe/ue" to the base vowel, "ß" to "ss")
   and ranks the cities.
3. Arrow keys change `activeIndex`; `aria-activedescendant` tells screen readers which
   option is highlighted.
4. Submit (`handleSubmit`) is the **validation**: if a suggestion exists it is chosen;
   otherwise an inline error appears and nothing else happens. The submit button is disabled
   while the input is empty.
5. `onSelect(city)` goes up to `LandingPage`, which calls
   `navigate('/weather?city=<slug>')`.

### Event: GPS

1. Click → `locate()` in `useGeolocation`.
2. It first checks for a secure context and for API support, then calls
   `navigator.geolocation.getCurrentPosition` and sets the status to `loading`.
3. Success → the callback from `LandingPage` navigates to `/weather?lat=…&lon=…`
   (three decimals).
4. Failure → `describeError` turns the error code (permission denied, position unavailable,
   timeout) into a German message that the button shows.
5. On the weather page, `readLocation` (`utils/location.ts`) finds the nearest city with the
   haversine formula (`utils/geo.ts`) for the label, and checks the bounding box of Germany
   for the notice.

### Event: timeline

1. Slider, step buttons, play button and keyboard all end in one of four callbacks.
2. They call `seek`, `step`, `togglePlay` or `setSpeed` from `useTimelinePlayback`.
3. During playback an interval advances `position` 20 times per second by
   `elapsed seconds × speed` (speed 1 = one forecast hour per second).
4. The new `position` re-renders `ForecastView`, which computes the interpolated weather and
   passes it to `WeatherHud`, `Timeline` and `CesiumViewer`.

### Likely questions

- **Why no Redux or Context?** The state that several components share has one common parent
  (`ForecastView`) two levels above its users. Props are enough and show the data flow
  directly.
- **What is the `key` on `ForecastView` for?** It contains the coordinates. When the user
  switches the city, React creates a fresh component, which resets the timeline to the first
  hour without any reset code.
- **Why is the slider step 0.01?** So the thumb can glide during playback. Input from the user
  is rounded to whole hours in `onChange`.
- **How is the interpolation done?** `interpolateWeather` takes the two neighbouring hours
  and blends every numeric field with `lerp(a, b, t)`. The wind direction uses `lerpAngle`,
  which takes the shorter way round the compass. Weather code and day/night come from the
  nearer hour.

---

## 4. Connection to the API

### `services/openMeteo.ts`

1. **`buildForecastUrl(lat, lon)`** builds the request with `URLSearchParams`: model
   `icon_seamless`, 21 hourly variables, `daily=sunrise,sunset`, `forecast_hours=48`,
   `timezone=auto`. No API key is needed.
2. **`fetchForecast(lat, lon, signal)`** sends the request with `fetch` and handles each way
   it can fail:
   - `fetch` rejects → no network (a cancelled request is passed on unchanged)
   - the body is not JSON → server problem
   - the body is `{ error: true, reason }` → the API rejected the request
   - `response.ok` is false → any other HTTP error
   - the structure is not what we expect → no data

   Every case throws an `Error` with a German message that can be shown to the user.
3. **`toForecast(data)`** converts the response. The API returns columns
   (`hourly.temperature_2m[5]`); the app works with one object per hour
   (`hours[5].temperature`), typed as `HourlyWeather` (`types/weather.ts`). It also converts
   the local time string into a UTC timestamp using `utc_offset_seconds`.

Type guards (`isApiError`, `isForecastResponse`) check the unknown JSON before it is used,
so the code needs no `any`.

### `hooks/useWeather.ts`

1. **Cache**: a `Map` outside the hook, keyed by the coordinates rounded to two decimals
   (about 1 km). An entry is used for 15 minutes.
2. **Effect**: starts `loadForecast` and stores the result together with a `requestId`
   (coordinates plus retry counter).
3. **`AbortController`**: the cleanup function aborts the request when the location changes
   or the component unmounts, so an old response can never overwrite a newer one.
4. **Derived status**: `idle` without coordinates, `loading` while the stored result belongs
   to another request, otherwise `success` or `error`.
5. **`retry`** increases a counter, which changes the `requestId` and starts a new request.

The return type is a union, so TypeScript knows that `data` exists exactly when
`status === 'success'`.

### `pages/WeatherPage.tsx`

The page turns the hook's status into one of four screens: invalid location, error with a
"retry" button, loading spinner, or `ForecastView`.

### Likely questions

- **Why does the network tab show a cancelled request in development?** `StrictMode` runs
  the effect twice; the first request is aborted by the cleanup. This shows that the abort
  logic works. It does not happen in the production build.
- **Why is the status derived instead of set with `setStatus('loading')`?** Setting state
  synchronously inside an effect causes an extra render and can show an outdated state for
  one frame. With the `requestId` comparison the status is always consistent with the props.
- **Why is the cache outside the component?** It has to survive when the user goes back to
  the landing page and opens the same city again. Component state would be lost on unmount.
- **How are missing values handled?** Open-Meteo sends `null` for a missing value;
  `toForecast` replaces it with 0 so the rest of the app can rely on numbers.
- **How do the forecast times become the sun position?** The API returns local times without
  a zone. `toForecast` computes a UTC timestamp for each hour; `setSceneTime` gives it to the
  Cesium clock, and Cesium calculates the sun from that.
