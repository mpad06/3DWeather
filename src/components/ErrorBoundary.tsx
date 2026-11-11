import { Component, type ErrorInfo, type ReactNode } from 'react'

type ErrorBoundaryProps = {
  children: ReactNode
  /** Shown instead of the children after an error */
  fallback: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
}

/**
 * Catches errors that are thrown while rendering (or in effects of) the
 * components below it and shows a fallback instead of a blank page.
 *
 * This is the only class component in the app: React offers error boundaries
 * only through the class lifecycle methods used here, there is no hook for it.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  // Called by React after a child threw: switch to the fallback UI.
  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  // Keep the details in the console for debugging.
  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unexpected error in the UI:', error, info.componentStack)
  }

  render(): ReactNode {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}
