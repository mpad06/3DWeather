import { useId, useMemo, useState, type FormEvent, type KeyboardEvent } from 'react'
import { CITIES } from '../data/cities'
import type { City } from '../types/city'
import { searchCities } from '../utils/citySearch'
import { SuggestionList } from './SuggestionList'
import styles from './SearchBar.module.css'

/** More suggestions than this do not fit on a phone screen. */
const MAX_SUGGESTIONS = 6

type SearchBarProps = {
  /** Called with the chosen city after a valid selection */
  onSelect: (city: City) => void
}

/**
 * City search as an accessible combobox: a text input with a list of
 * suggestions that can be used with the mouse, touch or the keyboard
 * (↑ ↓ to move, Enter to choose, Esc to close).
 */
export function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  // Index of the suggestion highlighted with the arrow keys, -1 = none
  const [activeIndex, setActiveIndex] = useState(-1)
  const [error, setError] = useState<string | null>(null)

  // Unique ids connect input, list and error message for screen readers
  const listId = useId()
  const errorId = useId()

  // Derived from the query on every change – no extra state needed
  const suggestions = useMemo(
    () => searchCities(query).slice(0, MAX_SUGGESTIONS),
    [query],
  )
  const showList = isOpen && suggestions.length > 0
  const isEmpty = query.trim() === ''

  function handleChange(text: string) {
    setQuery(text)
    setIsOpen(true)
    setActiveIndex(-1)
    setError(null)
  }

  function chooseCity(city: City) {
    setQuery(city.name)
    setIsOpen(false)
    onSelect(city)
  }

  // Validation: only a text that matches a city may be submitted.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // Enter takes the highlighted suggestion, otherwise the best match
    const city = suggestions[activeIndex] ?? suggestions[0]
    if (city) {
      chooseCity(city)
    } else {
      setError(
        `„${query.trim()}“ ist keine der ${CITIES.length} verfügbaren Städte. Bitte wähle einen Vorschlag aus der Liste.`,
      )
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (suggestions.length === 0) return
      event.preventDefault() // keep the text cursor where it is
      setIsOpen(true)
      const step = event.key === 'ArrowDown' ? 1 : -1
      // Wrap around at both ends of the list
      setActiveIndex((index) => (index + step + suggestions.length) % suggestions.length)
    } else if (event.key === 'Escape') {
      setIsOpen(false)
      setActiveIndex(-1)
    }
  }

  return (
    <form className={styles.form} role="search" onSubmit={handleSubmit} noValidate>
      <label htmlFor={`${listId}-input`} className="visually-hidden">
        Stadt suchen
      </label>
      <div className={styles.field}>
        <input
          id={`${listId}-input`}
          className={styles.input}
          type="text"
          role="combobox"
          placeholder="Stadt suchen, z. B. Mannheim"
          autoComplete="off"
          spellCheck={false}
          value={query}
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            showList && activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined
          }
          aria-invalid={error !== null}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => handleChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setIsOpen(false)}
        />
        <button type="submit" className={styles.submit} disabled={isEmpty}>
          Wetter anzeigen
        </button>
        {showList && (
          <SuggestionList
            id={listId}
            cities={suggestions}
            activeIndex={activeIndex}
            onChoose={chooseCity}
          />
        )}
      </div>
      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
