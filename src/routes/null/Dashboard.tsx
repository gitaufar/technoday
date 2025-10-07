"use client"

import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight, Building2, Plus } from "lucide-react"

import { useAuth } from "@/auth/AuthProvider"

export default function OrganizationDashboard() {
  const navigate = useNavigate()
  const { profile } = useAuth()

  const greetingName = useMemo(() => {
    const display = profile?.full_name ?? profile?.email ?? "there"
    return display.split(" ")[0]
  }, [profile?.full_name, profile?.email])

  const handleCreateCompany = () => {
    navigate("/create-project/create")
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-sm font-medium text-[#357ABD]">Welcome, {greetingName}</p>
        <h1 className="text-2xl font-semibold text-slate-900">Organization Dashboard</h1>
        <p className="text-sm text-slate-500">
          Manage your organization profile, teams, and billing preferences in one place.
        </p>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 px-6 pt-8 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Company Management</h2>
            <p className="text-sm text-slate-500">
              Set up your company profile to unlock all OptiMind features.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCreateCompany}
            className="inline-flex items-center gap-2 rounded-lg bg-[#357ABD] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2e6dad]"
          >
            <Plus className="h-4 w-4" />
            Create New Company
          </button>
        </div>

        <div className="px-6 pb-8">
          <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-8 py-16 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#357ABD] shadow-sm">
              <Building2 className="h-8 w-8" />
            </div>
            <div className="space-y-2 max-w-lg">
              <h3 className="text-lg font-semibold text-slate-900">Set Up Your Company</h3>
              <p className="text-sm text-slate-500">
                Start by creating your company profile. This helps you manage contracts, invite team members,
                and configure billing settings tailored to your organization.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCreateCompany}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#357ABD] shadow-sm transition hover:bg-[#357ABD] hover:text-white"
            >
              Set Up Company
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
