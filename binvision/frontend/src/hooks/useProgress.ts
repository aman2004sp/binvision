import { useSyncExternalStore } from 'react'
import { getSnapshot, subscribe } from '../utils/progressStore'
import { computeStats } from '../utils/stats'

export function useProgress() {
  const data = useSyncExternalStore(subscribe, getSnapshot)
  return { data, stats: computeStats(data) }
}
