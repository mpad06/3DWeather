import { PLAYBACK_SPEEDS, type PlaybackSpeed } from '../hooks/useTimelinePlayback'
import styles from './PlaybackControls.module.css'

type PlaybackControlsProps = {
  isPlaying: boolean
  speed: PlaybackSpeed
  /** Disable "back" at the first hour and "forward" at the last */
  canStepBack: boolean
  canStepForward: boolean
  onTogglePlay: () => void
  onStep: (direction: -1 | 1) => void
  onSpeedChange: (speed: PlaybackSpeed) => void
}

/** Play/pause, single-hour steps and the speed selection of the timeline. */
export function PlaybackControls({
  isPlaying,
  speed,
  canStepBack,
  canStepForward,
  onTogglePlay,
  onStep,
  onSpeedChange,
}: PlaybackControlsProps) {
  return (
    <div className={styles.controls}>
      <div className={styles.group}>
        <button
          type="button"
          className={styles.button}
          aria-label="Eine Stunde zurück"
          disabled={!canStepBack}
          onClick={() => onStep(-1)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 5h2.5v14H6zM20 5v14L9.5 12z" />
          </svg>
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.play}`}
          aria-label={isPlaying ? 'Pausieren' : 'Abspielen'}
          onClick={onTogglePlay}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {isPlaying ? (
              <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
            ) : (
              <path d="M8 5v14l11-7z" />
            )}
          </svg>
        </button>
        <button
          type="button"
          className={styles.button}
          aria-label="Eine Stunde vor"
          disabled={!canStepForward}
          onClick={() => onStep(1)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15.5 5H18v14h-2.5zM4 5v14l10.5-7z" />
          </svg>
        </button>
      </div>

      <div className={styles.group} role="group" aria-label="Abspielgeschwindigkeit">
        {PLAYBACK_SPEEDS.map((option) => (
          <button
            key={option}
            type="button"
            className={option === speed ? `${styles.speed} ${styles.active}` : styles.speed}
            // aria-pressed tells screen readers which speed is selected
            aria-pressed={option === speed}
            aria-label={`${option}-fache Geschwindigkeit`}
            onClick={() => onSpeedChange(option)}
          >
            {option}×
          </button>
        ))}
      </div>
    </div>
  )
}
