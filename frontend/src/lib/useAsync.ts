import { useEffect, useState } from 'react'

const SLOW_AFTER_MS = 4_000

/**
 * Minimal data-fetching hook: re-runs when deps change, ignores stale responses.
 * `slow` turns true when a request takes long (usually the backend waking up).
 */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<{ data?: T; error?: Error; loading: boolean; slow: boolean }>({
    loading: true,
    slow: false,
  })

  useEffect(() => {
    let active = true
    setState((s) => ({ ...s, loading: true, slow: false, error: undefined }))
    const timer = setTimeout(() => active && setState((s) => (s.loading ? { ...s, slow: true } : s)), SLOW_AFTER_MS)
    fn()
      .then((data) => active && setState({ data, loading: false, slow: false }))
      .catch((error: Error) => active && setState({ error, loading: false, slow: false }))
      .finally(() => clearTimeout(timer))
    return () => {
      active = false
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}
