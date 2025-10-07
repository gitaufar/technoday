import { useEffect, useMemo, useState } from "react"
import { Loader2, Mail, MoreVertical, UserPlus } from "lucide-react"

import { useAuth } from "@/auth/AuthProvider"
import type { TeamMember } from "@/services/teamService"
import { getEmailInitial, getNameInitials, getTeamMembers } from "@/services/teamService"

type RoleOption = {
  label: string
  value: TeamMember["role"]
  badgeClass: string
}

type StatusMeta = {
  label: string
  badgeClass: string
}

const roleOptions: RoleOption[] = [
  { value: "management", label: "Manager", badgeClass: "bg-amber-50 text-amber-600" },
  { value: "procurement", label: "Procurement", badgeClass: "bg-blue-50 text-blue-600" },
  { value: "legal", label: "Legal", badgeClass: "bg-emerald-50 text-emerald-600" },
  { value: "owner", label: "Owner", badgeClass: "bg-purple-50 text-purple-600" }
]

const statusMap: Record<TeamMember["status"], StatusMeta> = {
  active: { label: "Active", badgeClass: "bg-emerald-50 text-emerald-600" },
  pending: { label: "Pending", badgeClass: "bg-amber-50 text-amber-600" },
  invited: { label: "Invited", badgeClass: "bg-sky-50 text-sky-600" }
}

function formatLastLogin(lastLogin: string | null): string {
  if (!lastLogin) return "Never"
  const last = new Date(lastLogin).getTime()
  if (Number.isNaN(last)) return "Never"

  const now = Date.now()
  const diffMs = now - last
  if (diffMs < 0) return "Just now"

  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  if (diffMinutes < 1) return "Just now"
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`

  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`

  const diffYears = Math.floor(diffMonths / 12)
  return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`
}

export const TeamOwner = () => {
  const { companyId } = useAuth()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<RoleOption["value"] | "">("")
  const [isInviting, setIsInviting] = useState(false)

  useEffect(() => {
    let isActive = true
    async function loadTeam() {
      if (!companyId) {
        setMembers([])
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const fetched = await getTeamMembers(companyId)
        if (isActive) {
          setMembers(fetched)
          setError(null)
        }
      } catch (err) {
        console.error(err)
        if (isActive) setError("Failed to load team members.")
      } finally {
        if (isActive) setLoading(false)
      }
    }
    loadTeam()
    return () => {
      isActive = false
    }
  }, [companyId])

  const roleLookup = useMemo(
    () => roleOptions.reduce<Record<TeamMember["role"], RoleOption>>((acc, option) => {
      acc[option.value] = option
      return acc
    }, {} as Record<TeamMember["role"], RoleOption>),
    []
  )

  const handleInvite = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!inviteEmail || !inviteRole) return
    setIsInviting(true)
    try {
      // Placeholder invite handler. Replace with integration to Supabase / API.
      await new Promise(resolve => setTimeout(resolve, 600))
      setInviteEmail("")
      setInviteRole("")
    } finally {
      setIsInviting(false)
    }
  }

  const renderAvatar = (member: TeamMember) => {
    if (member.avatar_url) {
      return (
        <img
          src={member.avatar_url}
          alt={member.full_name}
          className="h-10 w-10 rounded-full object-cover"
        />
      )
    }

    const initials = member.full_name
      ? getNameInitials(member.full_name)
      : getEmailInitial(member.email)

    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold uppercase text-slate-600">
        {initials}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6">
        <header className="flex flex-col gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Team Management</h1>
            <p className="text-sm text-slate-500">
              Manage your team members, roles, and access permissions
            </p>
          </div>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Invite New Member</h2>
              <p className="text-sm text-slate-500">
                Send an invite to add someone to your organization
              </p>
            </div>
          </div>

          <form
            onSubmit={handleInvite}
            className="mt-6 grid gap-4 lg:grid-cols-[2.25fr_1fr_auto] lg:items-end"
          >
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-600">Email Address</span>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-inner focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                <Mail className="h-4 w-4 text-slate-400" aria-hidden="true" />
                <input
                  value={inviteEmail}
                  onChange={event => setInviteEmail(event.target.value)}
                  placeholder="Enter email address"
                  type="email"
                  className="w-full border-none bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                  required
                />
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-600">Assign Role</span>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-inner focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                <UserPlus className="h-4 w-4 text-slate-400" aria-hidden="true" />
                <select
                  value={inviteRole}
                  onChange={event => setInviteRole(event.target.value as RoleOption["value"])}
                  className="w-full border-none bg-transparent text-sm text-slate-700 focus:outline-none"
                  required
                >
                  <option value="">Select Role</option>
                  {roleOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-600 lg:hidden">Action</span>
              <span className="hidden text-sm font-medium text-transparent lg:block">Send Invite</span>
              <button
                type="submit"
                disabled={isInviting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 lg:self-end"
              >
                {isInviting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Invite"
                )}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Team Members</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-6 py-4">Member Name</th>
                  <th scope="col" className="px-6 py-4">Email</th>
                  <th scope="col" className="px-6 py-4">Role</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4">Last Login</th>
                  <th scope="col" className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                      <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-slate-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading team members...
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-rose-500">
                      {error}
                    </td>
                  </tr>
                )}

                {!loading && !error && members.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      No team members found. Invite someone to get started.
                    </td>
                  </tr>
                )}

                {!loading &&
                  !error &&
                  members.map(member => {
                    const roleMeta = roleLookup[member.role] ?? roleOptions[0]
                    const statusMeta = statusMap[member.status] ?? statusMap.active

                    return (
                      <tr key={member.id} className="transition hover:bg-slate-50/70">
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-3">
                            {renderAvatar(member)}
                            <span className="font-semibold text-slate-900">{member.full_name}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-slate-600">{member.email}</td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${roleMeta.badgeClass}`}
                          >
                            {roleMeta.label}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusMeta.badgeClass}`}
                          >
                            {statusMeta.label}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                          {formatLastLogin(member.last_login)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <button
                            type="button"
                            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            aria-label={`More actions for ${member.full_name}`}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
