import { AlertTriangle, BookmarkCheck, BookmarkPlus, CheckCircle2, Info, PenLine, RotateCcw, UserCheck } from 'lucide-react'
import { useState } from 'react'
import CategoryBadge from './CategoryBadge'
import SourceBadge from './SourceBadge'
import { SELECTABLE_CATEGORIES } from '../data/categories'
import type { CategoryId, ClassificationResult } from '../types'

interface Props {
  result: ClassificationResult
  imageUrl: string | null
  originalCategory: CategoryId
  corrected: boolean
  learned: boolean
  onCorrect: (category: CategoryId) => void
  onToggleLearned: () => void
  onScanAnother: () => void
  correctionBusy?: boolean
}

export default function ResultCard({
  result,
  imageUrl,
  originalCategory,
  corrected,
  learned,
  onCorrect,
  onToggleLearned,
  onScanAnother,
  correctionBusy = false,
}: Props) {
  const [picking, setPicking] = useState(false)
  const [checked, setChecked] = useState<Record<number, boolean>>({})

  return (
    <article className="animate-fade-up overflow-hidden rounded-3xl border border-line bg-white shadow-sm" aria-live="polite">
      <div className="grid gap-0 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {imageUrl && (
          <div className="bg-sand">
            <img src={imageUrl} alt="The item you uploaded" className="h-full max-h-80 w-full object-contain md:max-h-none" />
          </div>
        )}
        <div className={`space-y-4 p-5 sm:p-6 ${imageUrl ? '' : 'md:col-span-2'}`}>
          <div className="flex flex-wrap items-center gap-2">
            {corrected ? (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-900">
                  <UserCheck className="h-3.5 w-3.5" aria-hidden="true" /> Corrected by you
                </span>
                <SourceBadge source="rules" />
              </>
            ) : (
              <SourceBadge source={result.source} />
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight">{result.item_name}</h2>
            <p className="mt-1 text-sm text-ink-soft">Material: {result.material}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <CategoryBadge id={result.category} />
            {result.confidence !== null && (
              <span className="text-sm text-ink-soft">Confidence: {Math.round(result.confidence * 100)}%</span>
            )}
          </div>

          {corrected && (
            <p className="rounded-xl bg-violet-50 p-3 text-sm text-violet-900">
              You changed this from <strong>{originalCategory.replace(/_/g, ' ')}</strong>. Your correction is saved on this
              device only and is not used to retrain the AI.
            </p>
          )}

          {result.uncertain && !corrected && (
            <div role="note" className="flex gap-2 rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm text-orange-900">
              <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>
                This result is uncertain. Try a clearer, well-lit photo of a single item, or use{' '}
                <strong>Correct Category</strong> to choose the category yourself.
              </p>
            </div>
          )}

          {result.warning && (
            <div role="alert" className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>
                <strong>Safety: </strong>
                {result.warning}
              </p>
            </div>
          )}

          <section aria-labelledby="disposal-h">
            <h3 id="disposal-h" className="text-sm font-semibold uppercase tracking-wide text-forest-800">Where it goes</h3>
            <p className="mt-1">{result.disposal_instruction}</p>
          </section>

          <section aria-labelledby="prep-h">
            <h3 id="prep-h" className="text-sm font-semibold uppercase tracking-wide text-forest-800">Prepare it</h3>
            <ul className="mt-2 space-y-2">
              {result.preparation_steps.map((step, i) => (
                <li key={i}>
                  <label className="flex cursor-pointer items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 accent-forest-700"
                      checked={!!checked[i]}
                      onChange={(e) => setChecked((c) => ({ ...c, [i]: e.target.checked }))}
                    />
                    <span className={checked[i] ? 'text-ink-soft line-through' : ''}>{step}</span>
                  </label>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="why-h">
            <h3 id="why-h" className="text-sm font-semibold uppercase tracking-wide text-forest-800">Why</h3>
            <p className="mt-1 text-sm text-ink-soft">{result.reason}</p>
          </section>

          {result.fallback_reason && (
            <p className="text-xs text-ink-soft">Note: {result.fallback_reason}</p>
          )}

          <p className="border-t border-line pt-3 text-xs text-ink-soft">{result.local_rules_notice}</p>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={onToggleLearned}
              aria-pressed={learned}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                learned ? 'bg-forest-100 text-forest-900' : 'bg-forest-900 text-white hover:bg-forest-800'
              }`}
            >
              {learned ? <BookmarkCheck className="h-4 w-4" aria-hidden="true" /> : <BookmarkPlus className="h-4 w-4" aria-hidden="true" />}
              {learned ? 'Learned' : 'Mark as Learned'}
            </button>
            <button
              onClick={() => setPicking((v) => !v)}
              aria-expanded={picking}
              className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold hover:bg-sand"
            >
              <PenLine className="h-4 w-4" aria-hidden="true" /> Correct Category
            </button>
            <button
              onClick={onScanAnother}
              className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold hover:bg-sand"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Scan Another Item
            </button>
          </div>

          {picking && (
            <fieldset className="rounded-2xl border border-line bg-cream p-3" disabled={correctionBusy}>
              <legend className="px-1 text-sm font-semibold">What is the right category?</legend>
              <div className="mt-1 flex flex-wrap gap-2">
                {SELECTABLE_CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onCorrect(c.id)
                      setPicking(false)
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium ${c.badge} ${
                      c.id === result.category ? 'ring-2 ring-forest-700' : ''
                    }`}
                  >
                    {c.id === result.category && <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
                    {c.short}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
        </div>
      </div>
    </article>
  )
}
