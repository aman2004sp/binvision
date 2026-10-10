import { getCategoryMeta } from '../data/categories'

interface Props {
  id: string
  size?: 'sm' | 'md'
  short?: boolean
}

export default function CategoryBadge({ id, size = 'md', short = false }: Props) {
  const meta = getCategoryMeta(id)
  const Icon = meta.icon
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${meta.badge} ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      }`}
    >
      <Icon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} aria-hidden="true" />
      {short ? meta.short : meta.label}
    </span>
  )
}
