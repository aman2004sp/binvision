import { useEffect, useState } from 'react'
import { BookOpen, Brain, Database, ShieldCheck } from 'lucide-react'
import CategoryBadge from '../components/CategoryBadge'
import { ErrorMessage, Loading } from '../components/Feedback'
import { getCategories, getHealth } from '../services/api'
import type { CategoryGuidance } from '../types'

export default function About() {
  const [cats, setCats] = useState<CategoryGuidance[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ai, setAi] = useState<boolean | null>(null)

  useEffect(() => {
    let live = true
    getCategories()
      .then((c) => live && setCats(c))
      .catch((e: Error) => live && setError(e.message))
    getHealth()
      .then((h) => live && setAi(h.ai_available))
      .catch(() => live && setAi(null))
    return () => {
      live = false
    }
  }, [])

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">About BinVision</h1>
        <p className="mt-1 max-w-2xl text-ink-soft">
          BinVision is an AI recycling coach: it helps you work out what an item is made of, where it generally goes, and how
          to get it ready, then helps you practise.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel icon={Brain} title="How classification works">
          <p>
            Your photo is sent to our server, which asks a vision AI model to name the visible item, its likely material and
            a category. The model's answer is validated and mapped onto ten fixed categories.
          </p>
          <p>
            Preparation steps and disposal routes come from a curated knowledge base, not from the model, so the AI cannot
            invent facilities, schedules or local rules. We show no confidence score because a model's self-reported
            certainty is not a reliable probability.
          </p>
          <p>
            Server AI status:{' '}
            <strong>{ai === null ? 'unknown' : ai ? 'configured' : 'not configured (demo mode)'}</strong>
          </p>
        </Panel>
        <Panel icon={ShieldCheck} title="Honest fallbacks">
          <p>
            Every result is labelled: <strong>AI classification</strong>, <strong>Rule-based guidance</strong> or{' '}
            <strong>Manual / demo mode</strong>. If the AI is unavailable (missing key, rate limit, outage) BinVision tells
            you and lets you choose a category yourself. It never pretends to have recognised an image.
          </p>
          <p>Uncertain results are flagged, and we are deliberately cautious with batteries, electronics, chemicals and broken glass.</p>
        </Panel>
        <Panel icon={Database} title="Your data">
          <p>
            Scan history, quiz scores and streaks live in your browser's local storage. They stay on this device and browser,
            are not synced and are not a global leaderboard. Uploaded images are processed to get a result and are not
            stored by BinVision. Image bytes are sent to the AI provider when AI classification is enabled.
          </p>
        </Panel>
        <Panel icon={BookOpen} title="Limits">
          <p>
            Disposal rules differ by municipality. The guidance here is general. AI can misidentify items; use{' '}
            <strong>Correct Category</strong> when it does. Corrections are saved locally for your own stats and do not retrain
            the model.
          </p>
        </Panel>
      </div>

      <section aria-labelledby="kb-h">
        <h2 id="kb-h" className="text-xl font-bold">Knowledge base</h2>
        <p className="text-sm text-ink-soft">General guidance per category, loaded from the server.</p>
        <div className="mt-4 space-y-3">
          {error && <ErrorMessage message={error} />}
          {!cats && !error && <Loading label="Loading knowledge base…" />}
          {cats?.map((c) => (
            <details key={c.id} className="rounded-2xl border border-line bg-white p-4">
              <summary className="flex cursor-pointer flex-wrap items-center gap-2 font-semibold">
                <CategoryBadge id={c.id} />
                <span className="text-sm font-normal text-ink-soft">{c.summary}</span>
              </summary>
              <div className="mt-3 space-y-3 text-sm">
                <p><strong>Examples:</strong> {c.examples.join(', ')}</p>
                <div>
                  <strong>Prepare:</strong>
                  <ul className="ml-5 list-disc">{c.preparation_steps.map((s) => <li key={s}>{s}</li>)}</ul>
                </div>
                <p><strong>Typical route:</strong> {c.disposal_route}</p>
                <div>
                  <strong>Common mistakes:</strong>
                  <ul className="ml-5 list-disc">{c.common_mistakes.map((s) => <li key={s}>{s}</li>)}</ul>
                </div>
                {c.safety && <p className="rounded-xl bg-red-50 p-3 text-red-900"><strong>Safety:</strong> {c.safety}</p>}
                <p className="text-ink-soft">{c.local_variation_note}</p>
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}

function Panel({ icon: Icon, title, children }: { icon: typeof Brain; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2 rounded-2xl border border-line bg-white p-5 text-sm leading-relaxed text-ink-soft">
      <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
        <Icon className="h-5 w-5 text-forest-700" aria-hidden="true" /> {title}
      </h2>
      {children}
    </section>
  )
}
