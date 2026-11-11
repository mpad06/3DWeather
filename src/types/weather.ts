/** The weather of one forecast hour, in the units delivered by Open-Meteo. */
export type HourlyWeather = {
  /** Local time at the location in ISO format without zone, e.g. "2026-11-11T14:00" */
  time: string
  /** The same moment as UTC milliseconds since 1970 (for Date and the Cesium clock) */
  timestamp: number
  /** Air temperature 2 m above ground in °C */
  temperature: number
  /** Feels-like temperature in °C */
  apparentTemperature: number
  /** Relative humidity in % */
  humidity: number
  /** Total precipitation of the hour in mm (rain + showers + melted snow) */
  precipitation: number
  /** Probability of precipitation in % */
  precipitationProbability: number
  /** Rain in mm */
  rain: number
  /** Showers in mm */
  showers: number
  /** Snowfall in cm */
  snowfall: number
  /** WMO weather code, see utils/weatherCodes.ts */
  weatherCode: number
  /** Total cloud cover in % */
  cloudCover: number
  /** Cloud cover of the low layer (up to about 2 km) in % */
  cloudCoverLow: number
  /** Cloud cover of the middle layer (about 2–6 km) in % */
  cloudCoverMid: number
  /** Cloud cover of the high layer (above about 6 km) in % */
  cloudCoverHigh: number
  /** Visibility in m */
  visibility: number
  /** Wind speed 10 m above ground in km/h */
  windSpeed: number
  /** Direction the wind comes FROM in degrees (0 = north, 90 = east) */
  windDirection: number
  /** Wind gusts in km/h */
  windGusts: number
  /** true between sunrise and sunset */
  isDay: boolean
  /** Height of the 0 °C level in m above sea level */
  freezingLevelHeight: number
  /** Convective available potential energy in J/kg (thunderstorm potential) */
  cape: number
  /** Seconds of sunshine within the hour (0–3600) */
  sunshineDuration: number
}

/** Sunrise and sunset of one day, as local ISO times of the location. */
export type DailySun = {
  /** Date in the form "2026-11-11" */
  date: string
  sunrise: string
  sunset: string
}

/** A complete 48-hour forecast for one location. */
export type Forecast = {
  /** Height of the location in m above sea level (used for the camera) */
  elevation: number
  /** Time zone name of the location, e.g. "Europe/Berlin" */
  timezone: string
  /** One entry per hour, starting with the current hour */
  hours: HourlyWeather[]
  days: DailySun[]
}
