"use client"

import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight, Building2, Loader2, Plus, Users } from "lucide-react"

import { useAuth } from "@/auth/AuthProvider"
import supabase from "@/utils/supabase"

type CompanySummary = {
  id: string
  name: string
  description: string | null
  industry: string | null
  subscription_plan: string | null
  subscription_status: string | null
  created_at: string
  updated_at: string
}

type OwnerStats = {
  members: number
  contracts: number
}

type PlanKey = "basic" | "premium" | "enterprise"

const PLAN_META: Record<
  PlanKey,
  { label: string; price: string; billing: string; contractLimit: number; userLimit: number }
> = {
  basic: { label: "Starter", price: "$0/month", billing: "Billed monthly", contractLimit: 500, userLimit: 3 },
  premium: {
    label: "Professional",
    price: "$99/month",
    billing: "Billed monthly",
    contractLimit: 2000,
    userLimit: 25
  },
  enterprise: {
    label: "Enterprise",
    price: "Custom pricing",
    billing: "Talk to sales",
    contractLimit: 0,
    userLimit: 0
  }
}

export const DashboardOwner = () => {
  const navigate = useNavigate()
  const { profile, companyId } = useAuth()
  const [company, setCompany] = useState<CompanySummary | null>(null)
  const [stats, setStats] = useState<OwnerStats>({ members: 0, contracts: 0 })
  const [loading, setLoading] = useState(true)

  const ownerName = useMemo(() => {
    const display = profile?.full_name ?? profile?.email ?? "there"
    return display.split(" ")[0]
  }, [profile?.full_name, profile?.email])

  useEffect(() => {
    let ignore = false

    const fetchData = async () => {
      if (!companyId) {
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        const [
          { data: companyData, error: companyError },
          { count: membersCount, error: membersError },
          { count: contractsCount, error: contractsError }
        ] = await Promise.all([
          supabase.from("companies").select("*").eq("id", companyId).maybeSingle(),
          supabase
            .from("company_users")
            .select("id", { count: "exact", head: true })
            .eq("company_id", companyId)
            .eq("status", "active"),
          supabase.from("contracts").select("id", { count: "exact", head: true }).eq("company_id", companyId)
        ])

        if (ignore) return

        if (companyError) {
          throw companyError
        }

        if (companyData) {
          setCompany(companyData as CompanySummary)
        }

        if (membersError) {
          console.error("Failed to load member count", membersError)
        }

        if (contractsError) {
          console.error("Failed to load contract count", contractsError)
        }

        setStats({
          members: membersCount ?? 0,
          contracts: contractsCount ?? 0
        })
      } catch (error) {
        console.error("Failed to load owner dashboard data", error)
        setCompany(null)
        setStats({ members: 0, contracts: 0 })
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

  const planKey = (company?.subscription_plan as PlanKey) ?? "basic"
  const plan = PLAN_META[planKey] ?? PLAN_META.basic

  const contractProgress =
    plan.contractLimit > 0 ? Math.min(100, Math.round((stats.contracts / plan.contractLimit) * 100)) : 100
  const userProgress =
    plan.userLimit > 0 ? Math.min(100, Math.round((stats.members / plan.userLimit) * 100)) : 100

  const handleInviteMember = () => navigate("/owner/team")
  const handleViewCompany = () => navigate("/owner/settings")

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-[#357ABD]">Welcome, {ownerName}</p>
        <h1 className="text-2xl font-semibold text-slate-900">Organization Dashboard</h1>
        <p className="text-sm text-slate-500">
          Manage your organization, teams, and billing settings from one place.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Team &amp; Roles</h2>
              <p className="text-sm text-slate-500">Bring your teammates onboard and assign their roles.</p>
            </div>
            <button
              type="button"
              onClick={handleInviteMember}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Invite Member
            </button>
          </div>

          <div className="mt-6 flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-16 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#357ABD] shadow-sm">
              <Users className="h-8 w-8" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900">Bring Your Team Onboard</p>
              <p className="mt-1 text-sm text-slate-500">
                Invite team members to start collaborating on contracts and compliance tasks.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h3 className="text-lg font-semibold text-slate-900">Plan &amp; Billing</h3>
          <div className="mt-6 space-y-5">
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-800">Current Plan</p>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-[#357ABD]">
                  {plan.label}
                </span>
              </div>
              <p className="text-2xl font-semibold text-slate-900">
                {loading && !company ? <Loader2 className="h-5 w-5 animate-spin" /> : plan.price}
              </p>
              <p className="text-sm text-slate-500">{plan.billing}</p>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                  <span>Contracts</span>
                  <span>
                    {stats.contracts}{" "}
                    {plan.contractLimit > 0 ? (
                      <span className="text-sm font-normal text-slate-500">/ {plan.contractLimit}</span>
                    ) : (
                      <span className="text-sm font-normal text-slate-500">/ Unlimited</span>
                    )}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-[#357ABD]"
                    style={{ width: `${contractProgress}%` }}
                    aria-hidden
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                  <span>Users</span>
                  <span>
                    {stats.members}
                    {plan.userLimit > 0 ? (
                      <span className="text-sm font-normal text-slate-500"> / {plan.userLimit}</span>
                    ) : (
                      <span className="text-sm font-normal text-slate-500"> / Unlimited</span>
                    )}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-[#357ABD]"
                    style={{ width: `${userProgress}%` }}
                    aria-hidden
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              className="w-full rounded-lg bg-[#F58A33] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e67c27]"
            >
              Upgrade Plan
            </button>
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Company Management</h3>
            <p className="text-sm text-slate-500">
              Keep your organization data up to date and manage the companies you oversee.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5">
          {loading ? (
            <div className="flex items-center justify-center gap-3 text-sm font-semibold text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin text-[#357ABD]" />
              Loading company information...
            </div>
          ) : company ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="text-base font-semibold text-slate-900">{company.name}</h4>
                <p className="text-sm text-slate-500">
                  {stats.contracts} {stats.contracts === 1 ? "Contract" : "Contracts"}
                </p>
                <button
                  type="button"
                  onClick={handleViewCompany}
                  className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#357ABD] transition hover:text-[#2e6dad]"
                >
                  View Company
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  company.subscription_status === "active"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {company.subscription_status === "active" ? "Active" : "Trial"}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#357ABD] shadow-sm">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-900">No Company Found</p>
                <p className="mt-1 text-sm text-slate-500">
                  Create your organization profile to manage contracts and invite teams.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
