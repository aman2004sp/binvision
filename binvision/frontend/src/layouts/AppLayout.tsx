import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { BarChart3, Camera, Gamepad2, Home, Info, Menu, X } from 'lucide-react'
import Logo from '../components/Logo'

const NAV = [
  { to: '/', label: 'Dashboard', icon: Home, end: true },
  { to: '/scan', label: 'Scan', icon: Camera, end: false },
  { to: '/challenge', label: 'Challenge', icon: Gamepad2, end: false },
  { to: '/impact', label: 'Impact', icon: BarChart3, end: false },
  { to: '/about', label: 'About', icon: Info, end: false },
]

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-forest-900 text-white' : 'text-ink hover:bg-sand'
  }`

export default function AppLayout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-line bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={linkClass}>
                <n.icon className="h-4 w-4" aria-hidden="true" />
                {n.label}
              </NavLink>
            ))}
          </nav>
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <nav id="mobile-nav" className="border-t border-line bg-cream px-4 py-3 md:hidden" aria-label="Mobile">
            <ul className="flex flex-col gap-1">
              {NAV.map((n) => (
                <li key={n.to}>
                  <NavLink to={n.to} end={n.end} className={linkClass}>
                    <n.icon className="h-4 w-4" aria-hidden="true" />
                    {n.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-line bg-forest-950 text-forest-100">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm md:flex-row md:items-center md:justify-between">
          <div>
            <Logo light />
            <p className="mt-2 text-forest-200">See the waste. Know where it goes.</p>
          </div>
          <p className="max-w-md text-forest-200">
            Disposal rules vary by municipality. BinVision gives general guidance only; always follow your local
            waste authority. Progress is stored in this browser on this device.
          </p>
        </div>
      </footer>
    </div>
  )
}
