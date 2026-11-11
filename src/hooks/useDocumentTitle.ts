import { useEffect } from 'react'

const APP_NAME = '3D Wetter'

/**
 * Sets the title of the browser tab for the current page, e.g.
 * "Mannheim – 3D Wetter". Changing document.title is a side effect outside
 * of React, so it belongs in an effect.
 */
export function useDocumentTitle(pageTitle: string): void {
  useEffect(() => {
    document.title = `${pageTitle} – ${APP_NAME}`
  }, [pageTitle])
}
