import type { CategoryId, ProgressData, QuizRoundRecord, ResultSource, ScanRecord } from '../types'
import { clearProgress, emptyProgress, loadProgress, saveProgress, STORAGE_KEY } from './storage'

let state: ProgressData = loadProgress()
const listeners = new Set<() => void>()

function commit(next: ProgressData): void {
  state = next
  saveProgress(next)
  listeners.forEach((l) => l())
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getSnapshot(): ProgressData {
  return state
}

// Keep tabs in sync.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY || e.key === null) {
      state = loadProgress()
      listeners.forEach((l) => l())
    }
  })
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function addScan(input: { itemName: string; category: CategoryId; source: ResultSource }): string {
  const record: ScanRecord = {
    id: newId(),
    timestamp: Date.now(),
    itemName: input.itemName,
    originalCategory: input.category,
    finalCategory: input.category,
    corrected: false,
    source: input.source,
    learned: false,
  }
  commit({ ...state, scans: [...state.scans, record] })
  return record.id
}

export function correctScan(id: string, category: CategoryId): void {
  commit({
    ...state,
    scans: state.scans.map((s) =>
      s.id === id ? { ...s, finalCategory: category, corrected: category !== s.originalCategory } : s,
    ),
  })
}

export function setLearned(id: string, learned: boolean): void {
  commit({ ...state, scans: state.scans.map((s) => (s.id === id ? { ...s, learned } : s)) })
}

export function addRound(input: { score: number; correct: number; total: number }): void {
  const round: QuizRoundRecord = { id: newId(), timestamp: Date.now(), ...input }
  commit({ ...state, rounds: [...state.rounds, round] })
}

export function resetProgress(): void {
  clearProgress()
  commit(emptyProgress())
}
