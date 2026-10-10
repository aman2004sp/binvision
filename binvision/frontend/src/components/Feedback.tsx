import type { ReactNode } from 'react'
import { AlertTriangle, Loader2, type LucideIcon } from 'lucide-react'

export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center justify-center gap-3 py-10 text-ink-soft">
      <Loader2 className="h-6 w-6 animate-spin motion-reduce:animate-none" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

export function ErrorMessage({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div role="alert" className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-900">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-relaxed">{message}</p>
        {action && <div className="mt-3">{action}</div>}
      </div>
    </div>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon
  title: string
  body: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-white/60 px-6 py-10 text-center">
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-forest-100 text-forest-800">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink-soft">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
