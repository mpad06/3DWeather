import type { City } from '../types/city'
import styles from './SuggestionList.module.css'

type SuggestionListProps = {
  /** id of the list; options get the ids `${id}-option-${index}` */
  id: string
  cities: City[]
  /** Index of the option highlighted with the keyboard, -1 = none */
  activeIndex: number
  onChoose: (city: City) => void
}

/** Drop-down list of city suggestions below the search input. */
export function SuggestionList({ id, cities, activeIndex, onChoose }: SuggestionListProps) {
  return (
    <ul id={id} className={styles.list} role="listbox" aria-label="Vorschläge">
      {cities.map((city, index) => (
        <li
          key={city.slug}
          id={`${id}-option-${index}`}
          role="option"
          aria-selected={index === activeIndex}
          className={index === activeIndex ? `${styles.option} ${styles.active}` : styles.option}
          // mousedown fires before the input loses focus. preventDefault keeps
          // the focus in the input, so the list is not closed before the click.
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onChoose(city)}
        >
          <span className={styles.name}>{city.name}</span>
          <span className={styles.state}>{city.state}</span>
        </li>
      ))}
    </ul>
  )
}
