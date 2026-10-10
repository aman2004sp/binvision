import type { CategoryId, ProgressData } from '../types'

export interface DayActivity {
  key: string
  label: string
  scans: number
  rounds: number
}

export interface Stats {
  scans: number
  learned: number
  corrections: number
  rounds: number
  correctAnswers: number
  questionsAnswered: number
  incorrectAnswers: number
  /** null when no questions have been answered. */
  accuracy: number | null
  bestScore: number | null
  recentScores: number[]
  categoryCounts: Partial<Record<CategoryId, number>>
  activity: DayActivity[]
  /** Consecutive local calendar days with at least one scan or completed round. */
  streakDays: number
  hasActivity: boolean
}

function dayKey(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function computeStats(data: ProgressData, now: number = Date.now(), days = 14): Stats {
  const categoryCounts: Partial<Record<CategoryId, number>> = {}
  for (const s of data.scans) {
    categoryCounts[s.finalCategory] = (categoryCounts[s.finalCategory] ?? 0) + 1
  }

  const correctAnswers = data.rounds.reduce((a, r) => a + r.correct, 0)
  const questionsAnswered = data.rounds.reduce((a, r) => a + r.total, 0)

  const activeDays = new Set<string>([...data.scans.map((s) => dayKey(s.timestamp)), ...data.rounds.map((r) => dayKey(r.timestamp))])

  // Streak: count back from today (or from yesterday if nothing has happened yet today).
  let streakDays = 0
  const cursor = new Date(now)
  if (!activeDays.has(dayKey(cursor.getTime()))) cursor.setDate(cursor.getDate() - 1)
  while (activeDays.has(dayKey(cursor.getTime()))) {
    streakDays += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  const activity: DayActivity[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = dayKey(d.getTime())
    activity.push({
      key,
      label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      scans: data.scans.filter((s) => dayKey(s.timestamp) === key).length,
      rounds: data.rounds.filter((r) => dayKey(r.timestamp) === key).length,
    })
  }

  return {
    scans: data.scans.length,
    learned: data.scans.filter((s) => s.learned).length,
    corrections: data.scans.filter((s) => s.corrected).length,
    rounds: data.rounds.length,
    correctAnswers,
    questionsAnswered,
    incorrectAnswers: questionsAnswered - correctAnswers,
    accuracy: questionsAnswered > 0 ? correctAnswers / questionsAnswered : null,
    bestScore: data.rounds.length ? Math.max(...data.rounds.map((r) => r.score)) : null,
    recentScores: data.rounds.slice(-5).map((r) => r.score).reverse(),
    categoryCounts,
    activity,
    streakDays,
    hasActivity: data.scans.length > 0 || data.rounds.length > 0,
  }
}
