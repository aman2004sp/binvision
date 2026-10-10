import { Link } from 'react-router-dom'
import { ScanSearch } from 'lucide-react'

export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="inline-flex items-center gap-2 font-bold tracking-tight" aria-label="BinVision home">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-900 text-forest-200">
        <ScanSearch className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className={`text-lg ${light ? 'text-white' : 'text-forest-900'}`}>BinVision</span>
    </Link>
  )
}
