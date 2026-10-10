import { Link, Route, Routes } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import Dashboard from './pages/Dashboard'
import Scan from './pages/Scan'
import Challenge from './pages/Challenge'
import Impact from './pages/Impact'
import About from './pages/About'

function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="mt-2 text-ink-soft">That page does not exist.</p>
      <Link to="/" className="mt-6 inline-block rounded-full bg-forest-900 px-6 py-3 font-semibold text-white">
        Back to dashboard
      </Link>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="scan" element={<Scan />} />
        <Route path="challenge" element={<Challenge />} />
        <Route path="impact" element={<Impact />} />
        <Route path="about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
