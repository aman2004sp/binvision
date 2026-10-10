import type { ProgressData, QuizRoundRecord, ScanRecord } from '../types'

export const STORAGE_KEY = 'binvision:progress:v1'

const memoryFallback = new Map<string, string>()

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return memoryFallback.get(key) ?? null
  }
}

function writeRaw(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    memoryFallback.set(key, value)
  }
}

function removeRaw(key: string): void {
  try {
    window.localStorage.removeItem(key)
  } catch {
    memoryFallback.delete(key)
  }
}

export function emptyProgress(): ProgressData {
  return { version: 1, scans: [], rounds: [] }
}

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const isStr = (v: unknown): v is string => typeof v === 'string'

function sanitizeScan(v: unknown): ScanRecord | null {
  if (!v || typeof v !== 'object') return null
  const r = v as Record<string, unknown>
  if (!isStr(r.id) || !isNum(r.timestamp) || !isStr(r.itemName)) return null
  if (!isStr(r.originalCategory) || !isStr(r.finalCategory)) return null
  const source = r.source === 'ai' || r.source === 'rules' || r.source === 'demo_fallback' ? r.source : 'demo_fallback'
  return {
    id: r.id,
    timestamp: r.timestamp,
    itemName: r.itemName.slice(0, 120),
    originalCategory: r.originalCategory as ScanRecord['originalCategory'],
    finalCategory: r.finalCategory as ScanRecord['finalCategory'],
    corrected: r.corrected === true,
    source,
    learned: r.learned === true,
  }
}

function sanitizeRound(v: unknown): QuizRoundRecord | null {
  if (!v || typeof v !== 'object') return null
  const r = v as Record<string, unknown>
  if (!isStr(r.id) || !isNum(r.timestamp) || !isNum(r.score) || !isNum(r.correct) || !isNum(r.total)) return null
  if (r.total <= 0 || r.correct < 0 || r.correct > r.total) return null
  return { id: r.id, timestamp: r.timestamp, score: r.score, correct: r.correct, total: r.total }
}

/** Loads progress; corrupt or missing data yields an empty, valid structure. */
export function loadProgress(): ProgressData {
  const raw = readRaw(STORAGE_KEY)
  if (!raw) return emptyProgress()
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const scans = Array.isArray(parsed.scans) ? parsed.scans.map(sanitizeScan).filter((s): s is ScanRecord => s !== null) : []
    const rounds = Array.isArray(parsed.rounds) ? parsed.rounds.map(sanitizeRound).filter((s): s is QuizRoundRecord => s !== null) : []
    return { version: 1, scans, rounds }
  } catch {
    return emptyProgress()
  }
}

export function saveProgress(data: ProgressData): void {
  writeRaw(STORAGE_KEY, JSON.stringify(data))
}

export function clearProgress(): void {
  removeRaw(STORAGE_KEY)
}
