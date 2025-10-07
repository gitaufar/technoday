import { useState, useEffect } from 'react'
import { useAuth } from '@/auth/AuthProvider'
import { MoreVertical } from 'lucide-react'
import { getTeamMembers, getEmailInitial, type TeamMember } from '@/services/teamService'

export const Team = () => {
  const { companyId } = useAuth()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (companyId) {
      fetchTeamMembers()
    }
  }, [companyId])

  const fetchTeamMembers = async () => {
    if (!companyId) return

    try {
      setLoading(true)
      const data = await getTeamMembers(companyId)
      setMembers(data)
    } catch (error) {
      console.error('Error fetching team members:', error)
      setMembers([])
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'management':
        return 'bg-orange-100 text-orange-700'
      case 'procurement':
        return 'bg-blue-100 text-blue-700'
      case 'legal':
        return 'bg-teal-100 text-teal-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'invited':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const formatLastLogin = (lastLogin: string | null) => {
    if (!lastLogin) return 'Never'
    
    const now = new Date()
    const loginDate = new Date(lastLogin)
    const diffMs = now.getTime() - loginDate.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    
    return loginDate.toLocaleDateString()
  }

  const capitalizeRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1)
  }

  const capitalizeStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-slate-500">Loading team members...</div>
      </div>
    )
  }

  return (
    <div className="h-full bg-[#F5F7FA] p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Team Management</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage your team members, roles, and access permissions
          </p>
        </div>

        {/* Team Members Table */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-900">Team Members</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                    Member Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                      No team members yet
                    </td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50">
                      {/* Member Name */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          {member.avatar_url ? (
                            <img
                              src={member.avatar_url}
                              alt={member.full_name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white">
                              {getEmailInitial(member.email)}
                            </div>
                          )}
                          <span className="text-sm font-medium text-slate-900">
                            {member.full_name}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="text-sm text-slate-600">{member.email}</span>
                      </td>

                      {/* Role */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getRoleBadgeColor(
                            member.role
                          )}`}
                        >
                          {capitalizeRole(member.role)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeColor(
                            member.status
                          )}`}
                        >
                          {capitalizeStatus(member.status)}
                        </span>
                      </td>

                      {/* Last Login */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="text-sm text-slate-600">
                          {formatLastLogin(member.last_login)}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <button
                          type="button"
                          className="text-slate-400 hover:text-slate-600"
                          aria-label="More actions"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}