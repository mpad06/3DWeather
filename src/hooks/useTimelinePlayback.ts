import { useEffect, useState } from 'react'
import { clamp } from '../utils/interpolate'

/** Available playback speeds: forecast hours per second. */
export const PLAYBACK_SPEEDS = [1, 2, 4] as const
export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number]

/** The position is advanced 20 times per second, which looks smooth enough. */
const TICK_MS = 50
/**
 * Upper limit for one tick. Browsers slow timers down in background tabs;
 * without the limit the timeline would jump ahead when the user comes back.
 */
const MAX_TICK_SECONDS = 0.25

/**
 * State and logic of the timeline: the selected position and the playback.
 *
 * `position` counts hours from the start of the forecast. It is a whole
 * number after every manual change and fractional while playing.
 *
 * @param hourCount number of forecast hours (48)
 */
export function useTimelinePlayback(hourCount: number) {
  const lastHour = hourCount - 1

  const [position, setPosition] = useState(0)
  // What the user asked for; see isPlaying below for what is really happening
  const [playRequested, setPlayRequested] = useState(false)
  const [speed, setSpeed] = useState<PlaybackSpeed>(1)

  // Derived instead of stored: playback stops by itself at the last hour.
  const atEnd = position >= lastHour
  const isPlaying = playRequested && !atEnd

  useEffect(() => {
    if (!isPlaying) return

    let lastTick = performance.now()
    const timer = window.setInterval(() => {
      const now = performance.now()
      const elapsedSeconds = Math.min((now - lastTick) / 1000, MAX_TICK_SECONDS)
      lastTick = now
      // Speed 1 means one forecast hour per second of real time.
      setPosition((current) => Math.min(current + elapsedSeconds * speed, lastHour))
    }, TICK_MS)

    // Stop the timer on pause, on a speed change (a new timer starts) and on unmount.
    return () => window.clearInterval(timer)
  }, [isPlaying, speed, lastHour])

  /** Jump to a position. A manual change pauses the playback. */
  function seek(target: number) {
    setPlayRequested(false)
    setPosition(clamp(target, 0, lastHour))
  }

  /** One hour back (-1) or forward (+1); from 3.4 that is hour 3 or hour 4. */
  function step(direction: -1 | 1) {
    seek(direction === 1 ? Math.floor(position) + 1 : Math.ceil(position) - 1)
  }

  function togglePlay() {
    if (isPlaying) {
      setPlayRequested(false)
      return
    }
    // Pressing play at the end starts again from the beginning.
    if (atEnd) setPosition(0)
    setPlayRequested(true)
  }

  return { position, isPlaying, speed, seek, step, togglePlay, setSpeed }
}
