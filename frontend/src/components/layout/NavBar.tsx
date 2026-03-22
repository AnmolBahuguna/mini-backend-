import { Menu, ShieldCheck, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../store/AuthContext'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/threat-check', label: 'Threat Check' },
  { to: '/alerts', label: 'Alerts' },
  { to: '/women-safety', label: 'Women Safety' },
  { to: '/adult-safety', label: 'Adult Safety' },
  { to: '/evidence', label: 'Evidence Vault' },
  { to: '/community', label: 'Community' },
  { to: '/features', label: 'Features' },
  { to: '/about', label: 'About' },
]

export function NavBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <header className={scrolled ? 'fixed inset-x-0 top-0 z-50 h-16 bg-[#0e0e0f]/90 shadow-[0_0_40px_rgba(144,147,255,0.08)] backdrop-blur-xl transition-all duration-300' : 'fixed inset-x-0 top-0 z-50 h-16 bg-[#0e0e0f]/72 backdrop-blur-xl transition-all duration-300'}>
      <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[#484849]/20 to-transparent" />
      <div className="page-wrap flex h-full items-center justify-between gap-4">
        <Link to="/" className="group flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-[#5cbfff] to-[#00a7f0] shadow-[0_0_16px_rgba(92,191,255,0.28)] transition-transform duration-500 group-hover:rotate-[360deg]">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <span className="font-headline text-base font-black uppercase tracking-tight text-white transition-all duration-300 group-hover:text-[#5cbfff]">DHIP</span>
        </Link>

        <nav className="hidden items-center gap-5 xl:flex">
          {navLinks.map((link) => {
            const active = location.pathname === link.to
            return (
              <Link
                key={link.to}
                to={link.to}
                className={active
                  ? 'border-b-2 border-[#5cbfff] pb-1 font-headline text-xs font-bold uppercase tracking-wider text-[#5cbfff]'
                  : 'pb-1 font-headline text-xs font-bold uppercase tracking-wider text-[#adaaab] transition-colors duration-200 hover:text-white'}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="hidden items-center gap-2 xl:flex">
          {!user ? (
            <>
              <Link to="/auth/login" className="rounded-md px-3 py-2 font-headline text-xs font-bold uppercase tracking-wider text-[#adaaab] hover:bg-[#201f21] hover:text-white">Sign In</Link>
              <Link to="/auth/signup" className="rounded-md bg-gradient-to-br from-[#5cbfff] to-[#00a7f0] px-4 py-2 font-headline text-xs font-bold uppercase tracking-wider text-[#003854] shadow-[0_0_16px_rgba(92,191,255,0.24)] hover:shadow-[0_0_22px_rgba(92,191,255,0.34)]">Get Started</Link>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/profile')} className="rounded-md border border-[#484849]/30 bg-[#1a191b] px-3 py-2 font-headline text-xs font-bold uppercase tracking-wider text-[#e5e5e5] hover:border-[#5cbfff]/40 hover:text-[#5cbfff]">
                Avatar
              </button>
              <button
                onClick={() => signOut()}
                className="rounded-md bg-gradient-to-br from-[#5cbfff] to-[#00a7f0] px-4 py-2 font-headline text-xs font-bold uppercase tracking-wider text-[#003854]"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>

        <button onClick={() => setMobileOpen((v) => !v)} className="rounded-md border border-[#484849]/30 bg-[#1a191b] p-2 text-[#e5e5e5] shadow-sm xl:hidden" aria-label="Open navigation menu">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 bg-[#0e0e0f]/72 backdrop-blur-sm xl:hidden">
          <div className="absolute right-0 top-0 h-full w-[86%] max-w-sm border-l border-[#484849]/30 bg-[#131314] p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-[#484849]/20 pb-3">
              <p className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-[#adaaab]">Menu</p>
              <button onClick={() => setMobileOpen(false)} className="rounded-md border border-[#484849]/30 p-2 text-[#adaaab]" aria-label="Open navigation menu">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={location.pathname === link.to ? 'rounded-md border border-[#5cbfff]/40 bg-[#5cbfff]/10 px-3 py-3 font-headline text-sm font-bold uppercase tracking-wide text-[#5cbfff]' : 'rounded-md border border-[#484849]/30 bg-[#1a191b] px-3 py-3 font-headline text-sm font-bold uppercase tracking-wide text-[#e5e5e5]'}
              >
                {link.label}
              </Link>
            ))}

            {!user ? (
              <div className="mt-4 grid gap-2">
                <Link to="/auth/login" onClick={() => setMobileOpen(false)} className="rounded-md border border-[#484849]/30 bg-[#1a191b] px-3 py-3 text-center font-headline text-xs font-bold uppercase tracking-wider text-[#e5e5e5]">Sign In</Link>
                <Link to="/auth/signup" onClick={() => setMobileOpen(false)} className="rounded-md bg-gradient-to-br from-[#5cbfff] to-[#00a7f0] px-3 py-3 text-center font-headline text-xs font-bold uppercase tracking-wider text-[#003854]">Get Started</Link>
              </div>
            ) : (
              <div className="mt-4 grid gap-2">
                <button onClick={() => navigate('/profile')} className="rounded-md border border-[#484849]/30 bg-[#1a191b] px-3 py-3 font-headline text-xs font-bold uppercase tracking-wider text-[#e5e5e5]">Profile</button>
                <button onClick={() => signOut()} className="rounded-md bg-gradient-to-br from-[#5cbfff] to-[#00a7f0] px-3 py-3 font-headline text-xs font-bold uppercase tracking-wider text-[#003854]">Sign Out</button>
              </div>
            )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}

export default NavBar
