import { useRef, useState } from 'react'
import { ArrowRight, CheckCircle2, Flame, Play, RotateCcw, Trophy, XCircle } from 'lucide-react'
import { POINTS_PER_CORRECT, QUESTIONS_PER_ROUND, QUIZ_QUESTIONS } from '../data/quiz'
import { useProgress } from '../hooks/useProgress'
import { addRound } from '../utils/progressStore'

interface RoundQuestion {
  id: string
  prompt: string
  explanation: string
  options: { text: string; correct: boolean }[]
}

function shuffle<T>(items: T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildRound(): RoundQuestion[] {
  return shuffle(QUIZ_QUESTIONS)
    .slice(0, QUESTIONS_PER_ROUND)
    .map((q) => ({
      id: q.id,
      prompt: q.prompt,
      explanation: q.explanation,
      options: shuffle(q.options.map((text, i) => ({ text, correct: i === q.correctIndex }))),
    }))
}

export default function Challenge() {
  const { data, stats } = useProgress()
  const [round, setRound] = useState<RoundQuestion[] | null>(null)
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [results, setResults] = useState<boolean[]>([])
  const [finished, setFinished] = useState(false)
  const saved = useRef(false)

  const start = () => {
    setRound(buildRound())
    setIndex(0)
    setSelected(null)
    setResults([])
    setFinished(false)
    saved.current = false
  }

  const answer = (i: number) => {
    if (!round || selected !== null) return // one answer per question
    setSelected(i)
    setResults((r) => [...r, round[index].options[i].correct])
  }

  const next = () => {
    if (!round || selected === null) return
    if (index + 1 < round.length) {
      setIndex(index + 1)
      setSelected(null)
      return
    }
    if (!saved.current) {
      saved.current = true
      const correct = results.filter(Boolean).length
      addRound({ score: correct * POINTS_PER_CORRECT, correct, total: round.length })
    }
    setFinished(true)
  }

  const leaderboard = [...data.rounds].sort((a, b) => b.score - a.score || b.timestamp - a.timestamp).slice(0, 5)

  // ---- Intro ----
  if (!round) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Sorting challenge</h1>
          <p className="mt-1 text-ink-soft">
            {QUESTIONS_PER_ROUND} questions per round, {POINTS_PER_CORRECT} points per correct answer. No account needed.
          </p>
        </header>
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Rounds completed" value={String(stats.rounds)} />
          <Stat label="Best score" value={stats.bestScore === null ? '—' : String(stats.bestScore)} />
          <Stat label="Day streak" value={String(stats.streakDays)} icon={<Flame className="h-4 w-4 text-orange-600" aria-hidden="true" />} />
        </div>
        <button onClick={start} className="inline-flex items-center gap-2 rounded-full bg-forest-900 px-6 py-3 font-semibold text-white hover:bg-forest-800">
          <Play className="h-5 w-5" aria-hidden="true" /> Start round
        </button>
        <Leaderboard rounds={leaderboard} />
      </div>
    )
  }

  // ---- Summary ----
  if (finished) {
    const correct = results.filter(Boolean).length
    const score = correct * POINTS_PER_CORRECT
    const accuracy = Math.round((correct / round.length) * 100)
    return (
      <div className="space-y-6">
        <div className="animate-fade-up rounded-3xl border border-line bg-white p-6 text-center sm:p-10">
          <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-forest-100 text-forest-800">
            <Trophy className="h-7 w-7" aria-hidden="true" />
          </span>
          <h1 className="text-3xl font-bold">Round complete</h1>
          <p className="mt-4 text-5xl font-extrabold text-forest-900">{score}</p>
          <p className="text-sm text-ink-soft">points</p>
          <p className="mt-3">
            {correct} of {round.length} correct · {accuracy}% accuracy
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button onClick={start} className="inline-flex items-center gap-2 rounded-full bg-forest-900 px-6 py-3 font-semibold text-white hover:bg-forest-800">
              <RotateCcw className="h-5 w-5" aria-hidden="true" /> Play again
            </button>
            <button onClick={() => setRound(null)} className="rounded-full border border-line px-6 py-3 font-semibold hover:bg-sand">
              Back to overview
            </button>
          </div>
        </div>
        <Leaderboard rounds={leaderboard} />
      </div>
    )
  }

  // ---- Question ----
  const q = round[index]
  const answered = selected !== null
  const isLast = index + 1 === round.length
  const currentScore = results.filter(Boolean).length * POINTS_PER_CORRECT

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <div className="flex items-center justify-between text-sm text-ink-soft">
          <span>Question {index + 1} of {round.length}</span>
          <span>Score: {currentScore}</span>
        </div>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-sand"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={round.length}
          aria-valuenow={index + (answered ? 1 : 0)}
          aria-label="Round progress"
        >
          <div className="h-full bg-forest-600 transition-all" style={{ width: `${((index + (answered ? 1 : 0)) / round.length) * 100}%` }} />
        </div>
      </div>

      <section className="rounded-3xl border border-line bg-white p-5 sm:p-6" aria-labelledby="q-prompt">
        <h2 id="q-prompt" className="text-xl font-semibold">{q.prompt}</h2>
        <div className="mt-4 grid gap-3" role="group" aria-label="Answer options">
          {q.options.map((o, i) => {
            const isSelected = selected === i
            let cls = 'border-line bg-white hover:bg-sand'
            if (answered) {
              if (o.correct) cls = 'border-forest-600 bg-forest-50 text-forest-950'
              else if (isSelected) cls = 'border-red-400 bg-red-50 text-red-950'
              else cls = 'border-line bg-white opacity-60'
            }
            return (
              <button
                key={i}
                onClick={() => answer(i)}
                disabled={answered}
                aria-pressed={isSelected}
                className={`flex items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3 text-left font-medium ${cls}`}
              >
                <span>{o.text}</span>
                {answered && o.correct && <CheckCircle2 className="h-5 w-5 shrink-0 text-forest-700" aria-label="Correct answer" />}
                {answered && isSelected && !o.correct && <XCircle className="h-5 w-5 shrink-0 text-red-600" aria-label="Your answer, incorrect" />}
              </button>
            )
          })}
        </div>

        {answered && (
          <div role="status" className="animate-fade-up mt-4 rounded-2xl bg-sand p-4 text-sm">
            <p className="font-semibold">{results[results.length - 1] ? 'Correct! +100 points' : 'Not quite. +0 points'}</p>
            <p className="mt-1 text-ink-soft">{q.explanation}</p>
          </div>
        )}
      </section>

      <div className="flex justify-end">
        <button
          onClick={next}
          disabled={!answered}
          className="inline-flex items-center gap-2 rounded-full bg-forest-900 px-6 py-3 font-semibold text-white hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLast ? 'See results' : 'Next question'} <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <p className="flex items-center gap-1.5 text-sm text-ink-soft">{icon}{label}</p>
      <p className="mt-1 text-2xl font-bold text-forest-900">{value}</p>
    </div>
  )
}

function Leaderboard({ rounds }: { rounds: { id: string; score: number; correct: number; total: number; timestamp: number }[] }) {
  return (
    <section className="rounded-3xl border border-line bg-white p-5" aria-labelledby="lb-h">
      <h2 id="lb-h" className="flex items-center gap-2 text-lg font-semibold">
        <Trophy className="h-5 w-5 text-forest-700" aria-hidden="true" /> Your best rounds
      </h2>
      <p className="text-xs text-ink-soft">Local leaderboard: only rounds played in this browser on this device. Not a global ranking.</p>
      {rounds.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">No rounds yet. Play one to set your first score.</p>
      ) : (
        <ol className="mt-3 divide-y divide-line">
          {rounds.map((r, i) => (
            <li key={r.id} className="flex items-center justify-between py-2 text-sm">
              <span>
                <span className="mr-2 font-semibold text-forest-800">#{i + 1}</span>
                {new Date(r.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
              <span>
                <strong>{r.score}</strong> pts · {r.correct}/{r.total}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
