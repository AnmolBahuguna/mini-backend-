import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      <div className="page-wrap flex min-h-screen flex-col items-center justify-center gap-6 text-center">
        <div className="rounded-full bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">404</div>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Page not found</h1>
        <p className="max-w-xl text-sm text-gray-300 sm:text-base">The page you are looking for does not exist or has moved. Please return to the dashboard or explore other sections.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/" className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-blue-500">Go Home</Link>
          <Link to="/features" className="rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white/80 hover:border-white/40">View Features</Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
