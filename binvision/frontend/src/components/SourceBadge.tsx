import { BookOpen, Hand, Sparkles } from 'lucide-react'
import type { ResultSource } from '../types'

const CONFIG: Record<ResultSource, { label: string; hint: string; cls: string; icon: typeof Sparkles }> = {
  ai: {
    label: 'AI classification',
    hint: 'Identified from your photo by an AI vision model. It can be wrong.',
    cls: 'bg-forest-50 text-forest-900 border-forest-200',
    icon: Sparkles,
  },
  rules: {
    label: 'Rule-based guidance',
    hint: 'Guidance from the curated knowledge base. No image was analysed.',
    cls: 'bg-sky-50 text-sky-900 border-sky-200',
    icon: BookOpen,
  },
  demo_fallback: {
    label: 'Manual / demo mode (not AI)',
    hint: 'You chose the category; this is knowledge-base guidance, not image recognition.',
    cls: 'bg-amber-50 text-amber-900 border-amber-300',
    icon: Hand,
  },
}

export default function SourceBadge({ source }: { source: ResultSource }) {
  const c = CONFIG[source]
  const Icon = c.icon
  return (
    <span
      title={c.hint}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${c.cls}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {c.label}
    </span>
  )
}
