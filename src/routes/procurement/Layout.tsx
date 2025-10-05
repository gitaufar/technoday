import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useAuth } from '@/auth/AuthProvider'
import Logo from '@/assets/logo.svg'

const NAV_ITEMS: Array<{ to: string; label: string; end?: boolean }> = [
  { to: '/procurement', label: 'Dashboard', end: true },
  { to: '/procurement/draft', label: 'Draft Contract' },
  { to: '/procurement/upload', label: 'Upload Contract' },
  { to: '/procurement/status', label: 'Status Tracking' },
]

function getInitials(name: string | null | undefined) {
  if (!name) return 'OM'
  const segments = name.trim().split(/\s+/).filter(Boolean)
  if (segments.length === 0) return 'OM'
  const first = segments[0][0]
  const last = segments.length > 1 ? segments[segments.length - 1][0] : segments[0][1] ?? ''
  return `${first ?? ''}${last ?? ''}`.toUpperCase()
}

function formatRole(role: string | null | undefined) {
  if (!role) return 'Procurement'
  return role.charAt(0).toUpperCase() + role.slice(1)
}

export default function ProcurementLayout() {
  const nav = useMemo(() => NAV_ITEMS, [])
  const navigate = useNavigate()
  const { profile, signOut, isOwner } = useAuth()
  const displayName = profile?.full_name ?? profile?.email ?? 'OptiMind User'
  const roleLabel = formatRole(profile?.role ?? 'procurement')
  const initials = getInitials(profile?.full_name ?? profile?.email)
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    setMenuOpen(false)
    await signOut()
  }

  const handleNavigate = (path: string) => {
    setMenuOpen(false)
    navigate(path)
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="group hidden w-[76px] overflow-hidden bg-white shadow-sm transition-all duration-300 hover:w-60 md:block">
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 px-4 py-5">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#357ABD]/10 text-sm font-semibold text-[#357ABD]">
              <img src={Logo} alt="OptiMind Logo" className="h-6 w-6" />
            </div>
            <div className="hidden group-hover:block">
              <div className="text-sm font-semibold text-slate-800">OptiMind | ILCS</div>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-2 pb-6">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `group/nav flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-200 justify-center group-hover:justify-start ${
                    isActive
                      ? 'bg-[#357ABD] text-white shadow'
                      : 'bg-transparent text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`h-5 w-5 flex items-center justify-center ${
                      isActive ? 'text-white' : 'text-slate-600 group-hover:text-slate-900'
                    }`}>
                      {item.label === 'Dashboard' && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                          <path d="M3 3v18h18"/>
                          <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
                        </svg>
                      )}
                      {item.label === 'Draft Contract' && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14,2 14,8 20,8"/>
                          <line x1="16" y1="13" x2="8" y2="13"/>
                          <line x1="16" y1="17" x2="8" y2="17"/>
                          <polyline points="10,9 9,9 8,9"/>
                          <path d="M12 5v14M5 12h14"/>
                        </svg>
                      )}
                      {item.label === 'Upload Contract' && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7,10 12,15 17,10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                      )}
                      {item.label === 'Status Tracking' && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                          <path d="M9 11l3 3L22 4"/>
                          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                        </svg>
                      )}
                    </div>
                    <span
                      className={`hidden whitespace-nowrap text-sm font-medium opacity-0 transition-all duration-150 group-hover:ml-1 group-hover:inline group-hover:opacity-100 ${
                        isActive ? 'text-white group-hover:text-white' : 'text-slate-900 group-hover:text-slate-900'
                      }`}
                    >
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center gap-4 bg-white px-6 py-4 shadow-sm">
          <div className="hidden w-[76px] md:block" aria-hidden />
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <h1 className="text-lg font-semibold text-slate-800">Procurement</h1>
            </div>
          </div>
          <div className="relative flex items-center">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-100"
            >
              <div className="grid h-9 w-9 place-items-center rounded-full bg-[#357ABD] text-sm font-semibold text-white">
                {initials}
              </div>
              <div className="hidden leading-tight text-left md:block">
                <div className="text-sm font-semibold text-slate-800">{displayName}</div>
                <div className="text-xs text-slate-500 capitalize">{roleLabel}</div>
              </div>
              <svg
                className={`h-4 w-4 text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : 'rotate-0'}`}
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-12 z-10 w-56 rounded-xl border border-slate-200 bg-white py-2 text-sm shadow-lg">
                {isOwner && (
                  <>
                    <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase">Switch Dashboard</div>
                    <button
                      type="button"
                      onClick={() => handleNavigate('/procurement')}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-slate-700 hover:bg-slate-50"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                      </svg>
                      Procurement
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavigate('/legal')}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-slate-700 hover:bg-slate-50"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 3v18h18" />
                        <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
                      </svg>
                      Legal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavigate('/management')}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-slate-700 hover:bg-slate-50"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 3v18h18" />
                        <path d="M18 17V9M13 17V5M8 17v-3" />
                      </svg>
                      Management
                    </button>
                    <div className="my-1 h-px bg-slate-200" />
                  </>
                )}
                <button
                  type="button"
                  onClick={() => handleNavigate('/settings/company')}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-slate-700 hover:bg-slate-50"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Company Info
                </button>
                <div className="my-1 h-px bg-slate-200" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-slate-600 hover:bg-slate-50"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
