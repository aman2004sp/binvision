import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Brain, Camera, Flame, Gamepad2, History, ImagePlus, ScanSearch, Target, Trash2 } from 'lucide-react'
import CategoryBadge from '../components/CategoryBadge'
import SourceBadge from '../components/SourceBadge'
import { ErrorMessage, EmptyState } from '../components/Feedback'
import { CATEGORIES } from '../data/categories'
import { useProgress } from '../hooks/useProgress'
import { setPendingFile } from '../utils/pendingFile'
import { MAX_UPLOAD_MB, validateImageFile } from '../utils/validation'

const STEPS = [
  { icon: Camera, title: 'Snap', body: 'Take or upload a photo of one waste item.' },
  { icon: Brain, title: 'Identify', body: 'BinVision suggests the item, material and category, and flags safety concerns.' },
  { icon: Target, title: 'Sort & learn', body: 'Follow the preparation steps, correct mistakes, then test yourself in the challenge.' },
]

export default function Dashboard() {
  const { data, stats } = useProgress()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    const problem = validateImageFile(f)
    if (problem) {
      setError(problem)
      return
    }
    setPendingFile(f)
    navigate('/scan')
  }

  const recent = [...data.scans].reverse().slice(0, 5)

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="grid items-center gap-8 lg:grid-cols-2">
        <div className="animate-fade-up">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-forest-100 px-3 py-1 text-sm font-medium text-forest-900">
            <ScanSearch className="h-4 w-4" aria-hidden="true" /> AI Recycling Coach
          </p>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-forest-950 sm:text-5xl">
            Not sure where it goes? Let BinVision guide you.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-ink-soft">
            Photograph a piece of waste to get its likely category, how to prepare it, and any safety notes. Then practise
            sorting in a quick challenge.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/scan" className="inline-flex items-center gap-2 rounded-full bg-forest-900 px-6 py-3 font-semibold text-white hover:bg-forest-800">
              <Camera className="h-5 w-5" aria-hidden="true" /> Scan an Item
            </Link>
            <Link to="/challenge" className="inline-flex items-center gap-2 rounded-full border border-forest-900 px-6 py-3 font-semibold text-forest-900 hover:bg-forest-50">
              <Gamepad2 className="h-5 w-5" aria-hidden="true" /> Start Sorting Challenge
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-line bg-white p-5 shadow-sm">
          <label
            htmlFor="dash-upload"
            className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-forest-200 bg-forest-50 px-6 py-10 text-center transition-colors hover:border-forest-600 focus-within:outline focus-within:outline-3 focus-within:outline-forest-700"
          >
            <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-forest-900 text-forest-200">
              <ImagePlus className="h-7 w-7" aria-hidden="true" />
            </span>
            <span className="text-lg font-semibold">Upload a photo to start</span>
            <span className="mt-1 text-sm text-ink-soft">JPEG, PNG or WebP · up to {MAX_UPLOAD_MB} MB</span>
          </label>
          <input id="dash-upload" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={onPick} />
          {error && <div className="mt-3"><ErrorMessage message={error} /></div>}
        </div>
      </section>

      {/* Progress */}
      <section aria-labelledby="progress-h">
        <h2 id="progress-h" className="text-xl font-bold">Your progress</h2>
        <p className="text-sm text-ink-soft">Calculated from activity saved in this browser on this device.</p>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Card label="Items scanned" value={String(stats.scans)} />
          <Card label="Quiz rounds" value={String(stats.rounds)} />
          <Card label="Quiz accuracy" value={stats.accuracy === null ? '—' : `${Math.round(stats.accuracy * 100)}%`} />
          <Card label="Day streak" value={String(stats.streakDays)} icon={<Flame className="h-4 w-4 text-orange-600" aria-hidden="true" />} />
        </div>
      </section>

      {/* Categories */}
      <section aria-labelledby="cats-h">
        <h2 id="cats-h" className="text-xl font-bold">What BinVision recognises</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {CATEGORIES.filter((c) => c.id !== 'unknown').map((c) => (
            <CategoryBadge key={c.id} id={c.id} />
          ))}
        </div>
      </section>

      {/* Recent + impact */}
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2" aria-labelledby="recent-h">
          <h2 id="recent-h" className="text-xl font-bold">Recent activity</h2>
          <div className="mt-4">
            {recent.length === 0 ? (
              <EmptyState
                icon={History}
                title="No scans yet"
                body="Your scanned items will appear here."
                action={<Link to="/scan" className="rounded-full bg-forest-900 px-5 py-2 text-sm font-semibold text-white">Scan your first item</Link>}
              />
            ) : (
              <ul className="divide-y divide-line rounded-2xl border border-line bg-white">
                {recent.map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{s.itemName}</p>
                      <p className="text-xs text-ink-soft">{new Date(s.timestamp).toLocaleString()}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <SourceBadge source={s.source} />
                      <CategoryBadge id={s.finalCategory} size="sm" short />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section aria-labelledby="impact-h">
          <h2 id="impact-h" className="text-xl font-bold">Learning impact</h2>
          <div className="mt-4 space-y-2 rounded-2xl border border-line bg-white p-4 text-sm">
            <Row label="Items marked learned" value={stats.learned} />
            <Row label="Your corrections" value={stats.corrections} />
            <Row label="Correct quiz answers" value={stats.correctAnswers} />
            <Link to="/impact" className="mt-2 inline-block font-semibold text-forest-800 underline">See full impact</Link>
          </div>
        </section>
      </div>

      {/* How it works */}
      <section aria-labelledby="how-h">
        <h2 id="how-h" className="text-xl font-bold">How it works</h2>
        <ol className="mt-4 grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-2xl border border-line bg-white p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-forest-100 text-forest-800">
                <s.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-3 font-semibold">{i + 1}. {s.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <p className="rounded-2xl bg-sand p-4 text-sm text-ink-soft">
        <Trash2 className="mr-2 inline h-4 w-4 align-text-bottom" aria-hidden="true" />
        Disposal rules vary by municipality. BinVision offers general guidance; check your local waste authority for the rules
        that apply to you.
      </p>
    </div>
  )
}

function Card({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <p className="flex items-center gap-1.5 text-sm text-ink-soft">{icon}{label}</p>
      <p className="mt-1 text-2xl font-bold text-forest-900">{value}</p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-soft">{label}</span>
      <span className="font-bold text-forest-900">{value}</span>
    </div>
  )
}
