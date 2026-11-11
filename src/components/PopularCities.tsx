import { Link } from 'react-router-dom'
import { findCityBySlug } from '../data/cities'
import type { City } from '../types/city'
import { weatherPathForCity } from '../utils/location'
import styles from './PopularCities.module.css'

const POPULAR_SLUGS = [
  'berlin',
  'hamburg',
  'muenchen',
  'koeln',
  'frankfurt-am-main',
  'stuttgart',
  'mannheim',
  'basel',
]

// Look the cities up once. The type guard removes "undefined" from the type
// in case a slug above is ever misspelled.
const POPULAR_CITIES = POPULAR_SLUGS.map(findCityBySlug).filter(
  (city): city is City => city !== undefined,
)

/** Quick links to a few well-known cities. */
export function PopularCities() {
  return (
    <section className={styles.section} aria-labelledby="popular-cities-title">
      <h2 id="popular-cities-title" className={styles.title}>
        Beliebte Städte
      </h2>
      <ul className={styles.grid}>
        {POPULAR_CITIES.map((city) => (
          <li key={city.slug}>
            <Link to={weatherPathForCity(city)} className={styles.link}>
              <span className={styles.name}>{city.name}</span>
              <span className={styles.state}>{city.state}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
