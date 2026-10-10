import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, Camera, RotateCcw } from 'lucide-react'
import ConfirmDialog from '../components/ConfirmDialog'
import { EmptyState } from '../components/Feedback'
import { CATEGORIES } from '../data/categories'
import { useProgress } from '../hooks/useProgress'
import { resetProgress } from '../utils/progressStore'

export default function Impact() {
  const { data, stats } = useProgress()
  const [confirming, setConfirming] = useState(false)

  const total = stats.scans
  const maxCount = Math.max(1, ...Object.values(stats.categoryCounts).map((n) => n ?? 0))
  const maxDay = Math.max(1, ...stats.activity.map((d) => d.scans + d.rounds))
  const aiScans = data.scans.filter((s) => s.source === 'ai').length
  const manualScans = data.scans.filter((s) => s.source === 'demo_fallback').length

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Your impact</h1>
        <p className="mt-1 text-ink-soft">
          Everything here is counted from your own activity, stored in this browser on this device only. It is not shared
          and is not a global leaderboard.
        </p>
      </header>

      {!stats.hasActivity ? (
        <EmptyState
          icon={BarChart3}
          title="Nothing to show yet"
          body="Scan an item or play a challenge round and your learning stats will appear here."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link to="/scan" className="inline-flex items-center gap-2 rounded-full bg-forest-900 px-5 py-2 text-sm font-semibold text-white">
                <Camera className="h-4 w-4" aria-hidden="true" /> Scan an item
              </Link>
              <Link to="/challenge" className="rounded-full border border-line px-5 py-2 text-sm font-semibold">Play challenge</Link>
            </div>
          }
        />
      ) : (
        <>
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Summary">
            <Metric label="Scans completed" value={String(stats.scans)} />
            <Metric label="Quiz rounds" value={String(stats.rounds)} />
            <Metric label="Correct answers" value={`${stats.correctAnswers} / ${stats.questionsAnswered}`} />
            <Metric label="Quiz accuracy" value={stats.accuracy === null ? '—' : `${Math.round(stats.accuracy * 100)}%`} />
            <Metric label="Your corrections" value={String(stats.corrections)} />
            <Metric label="Marked learned" value={String(stats.learned)} />
            <Metric label="Best score" value={stats.bestScore === null ? '—' : String(stats.bestScore)} />
            <Metric label="Day streak" value={String(stats.streakDays)} />
          </section>

          <section className="rounded-3xl border border-line bg-white p-5" aria-labelledby="dist-h">
            <h2 id="dist-h" className="text-lg font-semibold">Scans by category</h2>
            <p className="text-xs text-ink-soft">Uses your corrected category where you made a correction.</p>
            {total === 0 ? (
              <p className="mt-3 text-sm text-ink-soft">No scans yet.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {CATEGORIES.filter((c) => (stats.categoryCounts[c.id] ?? 0) > 0).map((c) => {
                  const n = stats.categoryCounts[c.id] ?? 0
                  return (
                    <li key={c.id}>
                      <div className="flex justify-between text-sm">
                        <span>{c.label}</span>
                        <span className="font-semibold">{n}</span>
                      </div>
                      <div className="mt-1 h-3 overflow-hidden rounded-full bg-sand">
                        <div className={`h-full ${c.bar}`} style={{ width: `${(n / maxCount) * 100}%` }} />
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
            {total > 0 && (
              <p className="mt-4 text-xs text-ink-soft">
                {aiScans} AI-classified · {manualScans} manual/demo · {total - aiScans - manualScans} other
              </p>
            )}
          </section>

          <section className="rounded-3xl border border-line bg-white p-5" aria-labelledby="act-h">
            <h2 id="act-h" className="text-lg font-semibold">Activity, last 14 days</h2>
            <p className="text-xs text-ink-soft">Scans plus completed quiz rounds per day.</p>
            <div className="mt-4 flex h-40 items-end gap-1" role="img" aria-label="Bar chart of daily scans and quiz rounds over the last 14 days">
              {stats.activity.map((d) => {
                const n = d.scans + d.rounds
                return (
                  <div key={d.key} className="flex h-full flex-1 flex-col items-center justify-end" title={`${d.label}: ${d.scans} scans, ${d.rounds} rounds`}>
                    <div className="w-full rounded-t bg-forest-600" style={{ height: n === 0 ? '2px' : `${(n / maxDay) * 100}%`, opacity: n === 0 ? 0.25 : 1 }} />
                  </div>
                )
              })}
            </div>
            <div className="mt-1 flex justify-between text-xs text-ink-soft">
              <span>{stats.activity[0].label}</span>
              <span>{stats.activity[stats.activity.length - 1].label}</span>
            </div>
          </section>
        </>
      )}

      <section className="rounded-2xl border border-line bg-white p-5 text-sm text-ink-soft">
        <h2 className="text-base font-semibold text-ink">About these numbers</h2>
        <p className="mt-1">
          BinVision does not estimate kilograms recycled, carbon saved or similar environmental figures, because it has no
          verified way to measure them from a photo. Only counts of your own actions are shown.
        </p>
      </section>

      <div>
        <button onClick={() => setConfirming(true)} className="inline-flex items-center gap-2 rounded-full border border-red-300 px-5 py-2 text-sm font-semibold text-red-800 hover:bg-red-50">
          <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reset progress
        </button>
      </div>

      <ConfirmDialog
        open={confirming}
        title="Reset all progress?"
        body="This permanently deletes your scan history, quiz scores and streak from this browser. It cannot be undone."
        confirmLabel="Delete everything"
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          resetProgress()
          setConfirming(false)
        }}
      />
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <p className="text-sm text-ink-soft">{label}</p>
      <p className="mt-1 text-2xl font-bold text-forest-900">{value}</p>
    </div>
  )
}
