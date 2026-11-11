/**
 * Group of weather situations that look the same. The category decides which
 * icon is shown (see components/WeatherIcon.tsx) and which effects the 3D
 * scene uses (see scene/effects).
 */
export type WeatherCategory =
  | 'clear'
  | 'partlyCloudy'
  | 'overcast'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'freezingRain'
  | 'snow'
  | 'showers'
  | 'thunderstorm'

type WeatherCodeInfo = {
  /** German description shown in the UI */
  label: string
  category: WeatherCategory
}

/**
 * WMO weather interpretation codes as used by Open-Meteo
 * (https://open-meteo.com/en/docs → "WMO Weather interpretation codes").
 */
const WEATHER_CODES: Record<number, WeatherCodeInfo> = {
  0: { label: 'Klar', category: 'clear' },
  1: { label: 'Überwiegend klar', category: 'clear' },
  2: { label: 'Teilweise bewölkt', category: 'partlyCloudy' },
  3: { label: 'Bedeckt', category: 'overcast' },
  45: { label: 'Nebel', category: 'fog' },
  48: { label: 'Nebel mit Reifbildung', category: 'fog' },
  51: { label: 'Leichter Nieselregen', category: 'drizzle' },
  53: { label: 'Nieselregen', category: 'drizzle' },
  55: { label: 'Starker Nieselregen', category: 'drizzle' },
  56: { label: 'Leichter gefrierender Nieselregen', category: 'freezingRain' },
  57: { label: 'Gefrierender Nieselregen', category: 'freezingRain' },
  61: { label: 'Leichter Regen', category: 'rain' },
  63: { label: 'Regen', category: 'rain' },
  65: { label: 'Starker Regen', category: 'rain' },
  66: { label: 'Leichter gefrierender Regen', category: 'freezingRain' },
  67: { label: 'Gefrierender Regen', category: 'freezingRain' },
  71: { label: 'Leichter Schneefall', category: 'snow' },
  73: { label: 'Schneefall', category: 'snow' },
  75: { label: 'Starker Schneefall', category: 'snow' },
  77: { label: 'Schneegriesel', category: 'snow' },
  80: { label: 'Leichte Regenschauer', category: 'showers' },
  81: { label: 'Regenschauer', category: 'showers' },
  82: { label: 'Heftige Regenschauer', category: 'showers' },
  85: { label: 'Leichte Schneeschauer', category: 'snow' },
  86: { label: 'Schneeschauer', category: 'snow' },
  95: { label: 'Gewitter', category: 'thunderstorm' },
  96: { label: 'Gewitter mit leichtem Hagel', category: 'thunderstorm' },
  99: { label: 'Gewitter mit Hagel', category: 'thunderstorm' },
}

/** Used for codes that are not in the table, so the UI never breaks. */
const UNKNOWN: WeatherCodeInfo = { label: 'Unbekannt', category: 'overcast' }

/** Label and category for a WMO weather code. */
export function describeWeatherCode(code: number): WeatherCodeInfo {
  return WEATHER_CODES[code] ?? UNKNOWN
}

/** Fog codes: the scene shows dense fog for them regardless of the visibility value. */
export function isFogCode(code: number): boolean {
  return code === 45 || code === 48
}
