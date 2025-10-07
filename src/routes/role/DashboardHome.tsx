import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import { getTopTeamMembers, getEmailInitial, type TeamMember } from '@/services/teamService'
import { getCompanySummary, type CompanySummary } from '@/services/companyService'

export const DashboardHome = () => {
  const { companyId } = useAuth()
  const navigate = useNavigate()
  const [company, setCompany] = useState<CompanySummary | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false

    const fetchData = async () => {
      if (!companyId) {
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        const [companySummary, topMembers] = await Promise.all([
          getCompanySummary(companyId),
          getTopTeamMembers(companyId, 3)
        ])

        if (ignore) return

        setCompany(companySummary)
        setMembers(topMembers)
      } catch (error) {
        console.error('Error fetching data:', error)
        setCompany(null)
        setMembers([])
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      ignore = true
    }
  }, [companyId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-500">Loading...</div>
      </div>
    )
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'procurement':
        return 'bg-blue-100 text-blue-700'
      case 'legal':
        return 'bg-green-100 text-green-700'
      case 'manager':
      case 'management':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Organization Dashboard</h1>
        <p className="text-sm text-slate-600 mt-1">Manage your organization, teams, and billing settings</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team & Roles - Takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Team & Roles</h2>
              <button
                onClick={() => navigate('/role/team')}
                className="text-sm text-[#357ABD] hover:text-[#2d6aa3] font-medium transition"
              >
                View All
              </button>
            </div>
            <div className="p-6">
              {members && members.length > 0 ? (
                <div className="space-y-3">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition"
                    >
                      <div className="flex items-center gap-3">
                        {member.avatar_url ? (
                          <img
                            src={member.avatar_url}
                            alt={member.full_name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#357ABD] to-[#4a90d9] flex items-center justify-center text-white font-semibold text-sm">
                            {getEmailInitial(member.email)}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-slate-900">
                            {member.full_name}
                          </div>
                          <div className="text-sm text-slate-500">{member.email}</div>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                          member.role
                        )}`}
                      >
                        {formatRole(member.role)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-slate-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <h3 className="mt-4 text-base font-medium text-slate-900">
                    Bring Your Team Onboard
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Invite team members to start collaborating on contracts and compliance tasks.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Company Management - Takes 1 column */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Company Management</h2>
            </div>
            <div className="p-6">
              {company ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base font-semibold text-slate-900">{company.name}</h3>
                      <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Active
                      </span>
                    </div>
                    <div className="text-sm text-slate-600">
                      {company.total_contracts || 0} Contracts
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/settings/company')}
                    className="w-full mt-4 text-sm text-[#357ABD] hover:text-[#2d6aa3] font-medium text-left transition"
                  >
                    View Company →
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-sm text-slate-500">No company information available</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
