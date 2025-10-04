import { NavLink, Outlet } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useAuth } from '@/auth/AuthProvider'
import { BarChart3, Shield, Clock, FileText, type LucideIcon } from 'lucide-react'
import Logo from '@/assets/logo.svg'

const NAV_ITEMS: Array<{ to: string; label: string; end?: boolean; icon: LucideIcon }> = [
  { to: '/management', label: 'KPI Monitoring', end: true, icon: BarChart3 },
  { to: '/management/risk-heatmap', label: 'Risk Heatmap', icon: Shield },
  { to: '/management/lifecycle', label: 'Lifecycle Timeline', icon: Clock },
  { to: '/management/reports', label: 'Reports', icon: FileText },
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
  if (!role) return 'Management'
  return role.charAt(0).toUpperCase() + role.slice(1)
}

export default function ManagementLayout() {
  const nav = useMemo(() => NAV_ITEMS, [])
  const { profile, signOut } = useAuth()
  const displayName = profile?.full_name ?? profile?.email ?? 'OptiMind User'
  const roleLabel = formatRole(profile?.role ?? 'management')
  const initials = getInitials(profile?.full_name ?? profile?.email)
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    setMenuOpen(false)
    await signOut()
  }

  return (
    <div className="flex max-w-screen bg-[#F5F7FA]">
      <aside className="group w-[60px] overflow-hidden bg-white shadow-sm transition-all duration-300 hover:w-48">
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-2 px-3 py-4">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-[#357ABD]/10 text-sm font-semibold text-[#357ABD]">
              <img src={Logo} alt="OptiMind Logo" className="h-5 w-5" />
            </div>
            <div className="hidden group-hover:block">
              <div className="text-sm font-semibold text-slate-800">OptiMind | ILCS</div>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-1 pb-4">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `group/nav flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-all duration-200 justify-center group-hover:justify-start ${
                    isActive
                      ? 'bg-[#357ABD] text-white shadow'
                      : 'bg-transparent text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                {({ isActive }) => {
                  const Icon = item.icon
                  return (
                    <>
                      <Icon
                        className={`h-5 w-5 flex-shrink-0 ${
                          isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-900'
                        }`}
                        aria-hidden
                      />
                      <span
                        className={`hidden whitespace-nowrap text-sm font-medium opacity-0 transition-all duration-150 group-hover:ml-1 group-hover:inline group-hover:opacity-100 ${
                          isActive ? 'text-white group-hover:text-white' : 'text-slate-900 group-hover:text-slate-900'
                        }`}
                      >
                        {item.label}
                      </span>
                    </>
                  )
                }}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center gap-3 bg-white px-4 py-3 shadow-sm">
          <div className="w-[60px]" aria-hidden />  
          
          <div className="flex flex-1 items-center justify-center">
            <h1 className="text-lg font-semibold text-slate-800">Management</h1>
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
              <div className="absolute right-0 top-12 z-10 w-44 rounded-xl border border-slate-200 bg-white py-2 text-sm shadow-lg">
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
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}