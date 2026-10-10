import {
  BatteryWarning,
  CircleHelp,
  Cpu,
  Cylinder,
  FileText,
  Leaf,
  Package,
  Shirt,
  Trash2,
  Wine,
  type LucideIcon,
} from 'lucide-react'
import type { CategoryId } from '../types'

export interface CategoryMeta {
  id: CategoryId
  label: string
  short: string
  icon: LucideIcon
  /** Tailwind classes (full strings so the compiler can see them). */
  badge: string
  bar: string
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'paper_cardboard', label: 'Paper & Cardboard', short: 'Paper', icon: FileText, badge: 'bg-blue-50 text-blue-900 border-blue-200', bar: 'bg-blue-600' },
  { id: 'plastic', label: 'Plastic', short: 'Plastic', icon: Package, badge: 'bg-amber-50 text-amber-900 border-amber-200', bar: 'bg-amber-600' },
  { id: 'metal', label: 'Metal', short: 'Metal', icon: Cylinder, badge: 'bg-slate-100 text-slate-800 border-slate-300', bar: 'bg-slate-600' },
  { id: 'glass', label: 'Glass', short: 'Glass', icon: Wine, badge: 'bg-cyan-50 text-cyan-900 border-cyan-200', bar: 'bg-cyan-600' },
  { id: 'organic', label: 'Organic / Compostable', short: 'Organic', icon: Leaf, badge: 'bg-lime-50 text-lime-900 border-lime-200', bar: 'bg-lime-600' },
  { id: 'ewaste', label: 'E-waste', short: 'E-waste', icon: Cpu, badge: 'bg-violet-50 text-violet-900 border-violet-200', bar: 'bg-violet-600' },
  { id: 'batteries_hazardous', label: 'Batteries & Hazardous', short: 'Hazardous', icon: BatteryWarning, badge: 'bg-red-50 text-red-900 border-red-200', bar: 'bg-red-600' },
  { id: 'residual', label: 'Residual / Non-recyclable', short: 'Residual', icon: Trash2, badge: 'bg-stone-100 text-stone-800 border-stone-300', bar: 'bg-stone-600' },
  { id: 'textile', label: 'Textiles', short: 'Textiles', icon: Shirt, badge: 'bg-pink-50 text-pink-900 border-pink-200', bar: 'bg-pink-600' },
  { id: 'unknown', label: 'Unknown / Uncertain', short: 'Unknown', icon: CircleHelp, badge: 'bg-orange-50 text-orange-900 border-orange-200', bar: 'bg-orange-500' },
]

const BY_ID = new Map(CATEGORIES.map((c) => [c.id, c]))

export function getCategoryMeta(id: string): CategoryMeta {
  return BY_ID.get(id as CategoryId) ?? BY_ID.get('unknown')!
}

export const SELECTABLE_CATEGORIES = CATEGORIES.filter((c) => c.id !== 'unknown')
