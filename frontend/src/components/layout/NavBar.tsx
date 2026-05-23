import { Bell, LogOut, Menu, Settings, ShieldCheck, User, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const primaryNavLinks = [
  { to: '/', label: 'Home' },
  { to: '/threat-check', label: 'Threat Scanner' },
  { to: '/alerts', label: 'Alerts' },
  { to: '/women-safety', label: 'Women Safety' },
  { to: '/adult-safety', label: 'Adult Safety' },
  { to: '/community', label: 'Community' },
]

const secondaryNavLinks = [
  { to: '/evidence-vault', label: 'Evidence Vault' },
  { to: '/features', label: 'Features' },
  { to: '/about', label: 'About' },
]

export function NavBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  const displayName =
    (user?.user_metadata as { full_name?: string; name?: string } | undefined)?.full_name ||
    (user?.user_metadata as { full_name?: string; name?: string } | undefined)?.name ||
    user?.email

  const initials = displayName?.[0]?.toUpperCase()
    ?? user?.email?.[0]?.toUpperCase()
    ?? 'U'

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  const navLinks = useMemo(() => primaryNavLinks, [])

  useEffect(() => {
    if (!dropdownOpen) return
    const onClickAway = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickAway)
    return () => document.removeEventListener('mousedown', onClickAway)
  }, [dropdownOpen])

  const unread = 3

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#0b0f17]/90 backdrop-blur-xl transition-all duration-200">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="page-wrap grid min-h-[64px] grid-cols-[auto,1fr,auto] items-center gap-4 py-3">
        <Link to="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-[#4ed0ff] to-[#00a7f0] shadow-[0_10px_30px_rgba(78,208,255,0.28)] transition-transform duration-700 group-hover:-rotate-6 group-hover:scale-105">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <span className="font-headline text-lg font-black uppercase tracking-tight text-white transition-colors duration-300 group-hover:text-[#4ed0ff]">DHIP</span>
        </Link>

        <nav className="hidden h-full items-center justify-center gap-2 lg:flex">
          {navLinks.map((link) => {
            const active = isActive(link.to)
            return (
              <Link
                key={link.to}
                to={link.to}
                className="group relative inline-flex items-center px-4 pb-3 pt-2 text-sm font-semibold uppercase tracking-wide"
              >
                <span className={active ? 'text-[#f4f7fb]' : 'text-[#aab0b9] transition-colors duration-200 group-hover:text-white'}>
                  {link.label}
                </span>
                <span
                  className={active
                    ? 'absolute inset-x-4 -bottom-[2px] h-[2px] rounded-full bg-[#34c6f3]'
                    : 'absolute inset-x-4 -bottom-[2px] h-[2px] rounded-full bg-transparent transition group-hover:bg-white/35'}
                />
              </Link>
            )
          })}
          {secondaryNavLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="group relative inline-flex items-center px-4 pb-3 pt-2 text-xs font-semibold uppercase tracking-wide text-[#8fa0b4] hover:text-white"
            >
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="hidden items-center justify-end gap-3 lg:flex">
          {!user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-[#e8ecf3] shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition hover:border-[#34c6f3]/50 hover:text-white hover:shadow-[0_16px_34px_rgba(52,198,243,0.25)]"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-full border border-[#34c6f3]/40 bg-[#0f1621] px-4 py-2 text-sm font-semibold uppercase tracking-wide text-[#5cbfff] shadow-[0_10px_26px_rgba(52,198,243,0.25)] transition hover:border-[#34c6f3]/60 hover:text-white"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  type="button"
                  className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#c7cbd2] transition hover:border-[#34c6f3]/40 hover:text-[#34c6f3]"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unread ? <span className="absolute -top-1 -right-1 h-5 min-w-[18px] rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white flex items-center justify-center">{unread}</span> : null}
                </button>
              </div>
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#c7cbd2] transition hover:border-[#34c6f3]/40 hover:text-[#34c6f3]"
                aria-label="Settings"
                onClick={() => navigate('/profile')}
              >
                <Settings className="h-5 w-5" />
              </button>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[#34c6f3]/40 bg-gradient-to-br from-[#1d2a36] to-[#0f1621] text-sm font-bold uppercase text-white shadow-[0_10px_26px_rgba(52,198,243,0.28)] transition hover:scale-105"
                  aria-label="Profile"
                >
                  {initials}
                </button>
                {dropdownOpen ? (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-[#0d1320] shadow-xl">
                    <button onClick={() => { setDropdownOpen(false); navigate('/profile') }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-white hover:bg-white/5">
                      <User className="h-4 w-4" /> My Profile
                    </button>
                    <button onClick={() => { setDropdownOpen(false); navigate('/evidence-vault') }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-white hover:bg-white/5">
                      <ShieldCheck className="h-4 w-4" /> Evidence Vault
                    </button>
                    <button onClick={() => { setDropdownOpen(false); navigate('/profile') }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-white hover:bg-white/5">
                      <Settings className="h-4 w-4" /> Settings
                    </button>
                     <button onClick={async () => { setDropdownOpen(false); await logout(); navigate('/login') }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-rose-200 hover:bg-white/5">
                       <LogOut className="h-4 w-4" /> Logout
                     </button>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>

        <button onClick={() => setMobileOpen((v) => !v)} className="rounded-md border border-white/10 bg-[#161b24] p-2 text-[#e5e5e5] shadow-sm lg:hidden" aria-label="Open navigation menu">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-[60] bg-[#0e0e0f]/72 backdrop-blur-sm xl:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-[86%] max-w-sm border-l border-[#484849]/30 bg-[#131314] p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b border-[#484849]/20 pb-3">
              <p className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-[#adaaab]">Menu</p>
              <button onClick={() => setMobileOpen(false)} className="rounded-md border border-[#484849]/30 p-2 text-[#adaaab]" aria-label="Open navigation menu">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-2">
              {[...navLinks, ...secondaryNavLinks].map((link) => {
                const active = isActive(link.to)
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={active
                      ? 'rounded-md border border-[#5cbfff]/40 bg-[#5cbfff]/10 px-3 py-3 font-headline text-sm font-bold uppercase tracking-wide text-[#5cbfff]'
                      : 'rounded-md border border-[#484849]/30 bg-[#1a191b] px-3 py-3 font-headline text-sm font-bold uppercase tracking-wide text-[#e5e5e5]'}
                  >
                    {link.label}
                  </Link>
                )
              })}

              {!user ? (
                <div className="mt-4 grid gap-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="rounded-md border border-[#5cbfff]/40 bg-[#0f1621] px-3 py-3 text-center font-headline text-sm font-bold uppercase tracking-wider text-[#5cbfff] shadow-[0_10px_24px_rgba(92,191,255,0.18)]">Login</Link>
                  <Link to="/signup" onClick={() => setMobileOpen(false)} className="rounded-md border border-[#34c6f3]/40 bg-[#102032] px-3 py-3 text-center font-headline text-sm font-bold uppercase tracking-wider text-[#34c6f3] shadow-[0_10px_24px_rgba(52,198,243,0.18)]">Sign Up</Link>
                </div>
              ) : (
                <div className="mt-4 grid gap-2">
                  <button onClick={() => navigate('/profile')} className="rounded-md border border-[#484849]/30 bg-[#1a191b] px-3 py-3 font-headline text-xs font-bold uppercase tracking-wider text-[#e5e5e5]">Profile</button>
                  <button onClick={() => navigate('/evidence-vault')} className="rounded-md border border-[#484849]/30 bg-[#1a191b] px-3 py-3 font-headline text-xs font-bold uppercase tracking-wider text-[#e5e5e5]">Evidence Vault</button>
                  <button onClick={async () => { await logout(); navigate('/login') }} className="rounded-md bg-gradient-to-br from-[#5cbfff] to-[#00a7f0] px-3 py-3 font-headline text-xs font-bold uppercase tracking-wider text-[#003854]">Sign Out</button>
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
