import { NavLink, Outlet } from "react-router-dom"
import { useMemo, useState } from "react"
import { useAuth } from "@/auth/AuthProvider"
import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  Settings,
  Users2,
  type LucideIcon
} from "lucide-react"
import Logo from "@/assets/logo.svg"

const NAV_ITEMS: Array<{ to: string; label: string; end?: boolean; icon: LucideIcon }> = [
  { to: "/owner", label: "Dashboard", end: true, icon: LayoutDashboard },
  { to: "/owner/team", label: "Team", icon: Users2 },
  { to: "/owner/billing", label: "Billing", icon: CreditCard },
  { to: "/owner/settings", label: "Organization Settings", icon: Settings }
]

function getInitials(name: string | null | undefined) {
  if (!name) return "OM"
  const segments = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (segments.length === 0) return "OM"
  const first = segments[0][0]
  const last = segments.length > 1 ? segments[segments.length - 1][0] : segments[0][1] ?? ""
  return `${first ?? ""}${last ?? ""}`.toUpperCase()
}

function formatRole(role: string | null | undefined) {
  if (!role) return "Owner"
  return role.charAt(0).toUpperCase() + role.slice(1)
}

export default function OwnerLayout() {
  const nav = useMemo(() => NAV_ITEMS, [])
  const { profile, signOut } = useAuth()
  const displayName = profile?.full_name ?? profile?.email ?? "OptiMind User"
  const roleLabel = formatRole(profile?.role ?? "owner")
  const initials = getInitials(profile?.full_name ?? profile?.email)
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    setMenuOpen(false)
    await signOut()
  }

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <aside className="group flex h-full w-[60px] min-h-screen flex-col overflow-hidden border-r border-slate-200 bg-white transition-all duration-300 hover:w-56">
        <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-4">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-[#357ABD]/10">
            <img src={Logo} alt="OptiMind Logo" className="h-5 w-5" />
          </div>
          <div className="hidden group-hover:block">
            <div className="text-sm font-semibold text-slate-900">OptiMind</div>
            <div className="text-xs text-slate-500">Owner Dashboard</div>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-2 py-6">
          {nav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `group/nav flex items-center gap-3 justify-center rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200 group-hover:justify-start ${
                  isActive
                    ? "bg-[#357ABD] text-white shadow"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              {({ isActive }) => {
                const Icon = item.icon
                return (
                  <>
                    <Icon
                      className={`h-5 w-5 flex-shrink-0 ${
                        isActive ? "text-white" : "text-slate-400 group-hover:text-slate-500"
                      }`}
                      aria-hidden
                    />
                    <span
                      className={`hidden whitespace-nowrap text-sm font-medium opacity-0 transition-all duration-150 group-hover:ml-1 group-hover:inline group-hover:opacity-100 ${
                        isActive ? "text-white" : "text-slate-700"
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
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8">
          <div className="text-lg font-semibold text-slate-900">Organization Dashboard</div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(open => !open)}
              className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              <div className="grid h-9 w-9 place-items-center rounded-full bg-[#357ABD] text-sm font-semibold text-white">
                {initials}
              </div>
              <div className="hidden leading-tight text-left sm:block">
                <div className="text-sm font-semibold text-slate-800">{displayName}</div>
                <div className="text-xs text-slate-500 capitalize">{roleLabel}</div>
              </div>
              <svg
                className={`h-4 w-4 text-slate-400 transition-transform ${menuOpen ? "rotate-180" : "rotate-0"}`}
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
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-slate-600 transition hover:bg-slate-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="flex flex-1 flex-col overflow-y-auto px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
