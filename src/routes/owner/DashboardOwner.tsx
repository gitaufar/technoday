"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight, Building2, Loader2, Plus, Users } from "lucide-react"

import { useAuth } from "@/auth/AuthProvider"
import supabase from "@/utils/supabase"
import { SubscriptionModal } from "@/components/SubscriptionModal"
import { processSubscription } from "@/services/billingService"

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

// Price mapping in IDR for modal
const PLAN_PRICES: Record<PlanKey, number> = {
  basic: 0,
  premium: 250000, // Rp 250,000
  enterprise: 470000 // Rp 470,000
}

// Plan features for modal
const PLAN_FEATURES: Record<PlanKey, string[]> = {
  basic: [
    "Up to 3 users",
    "500 contracts limit",
    "Basic upload & tracking",
    "Email support"
  ],
  premium: [
    "Up to 25 users",
    "2,000 contracts limit",
    "AI Risk Analyzer",
    "100 GB storage",
    "Team collaboration & role management",
    "Priority email support",
    "Daily backup & 7-day log retention"
  ],
  enterprise: [
    "Unlimited users",
    "Unlimited contracts",
    "Multi-company support",
    "Advanced reports",
    "Dedicated account manager",
    "24/7 SLA support"
  ]
}

export const DashboardOwner = () => {
  const navigate = useNavigate()
  const { profile, companyId } = useAuth()
  const [company, setCompany] = useState<CompanySummary | null>(null)
  const [stats, setStats] = useState<OwnerStats>({ members: 0, contracts: 0 })
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [upgradingPlan, setUpgradingPlan] = useState(false)

  const ownerName = useMemo(() => {
    const display = profile?.full_name ?? profile?.email ?? "there"
    return display.split(" ")[0]
  }, [profile?.full_name, profile?.email])

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
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
      setLoading(false)
    }
  }, [companyId])

  const handlePaymentSuccess = async (paymentData: {
    cardNumber: string
    expirationDate: string
    cvv: string
    fullName: string
    country: string
    addressLine1: string
    addressLine2: string
    isBusiness: boolean
  }) => {
    if (!companyId) return

    // Determine target plan (upg rade from current)
    const targetPlan: PlanKey = planKey === "basic" ? "premium" : "enterprise"
    
    setUpgradingPlan(true)
    try {
      const planName = PLAN_META[targetPlan].label
      const planPrice = PLAN_PRICES[targetPlan]

      // Determine payment method from card number
      const firstDigit = paymentData.cardNumber.charAt(0)
      const paymentMethod = firstDigit === "4" ? "visa" : firstDigit === "5" ? "mastercard" : "credit_card"

      // Process subscription
      const result = await processSubscription(
        companyId,
        targetPlan,
        planPrice,
        paymentMethod,
        `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      )

      if (result.success) {
        // Refresh dashboard data
        await loadDashboardData()
        
        alert(`Successfully upgraded to ${planName}! Your invoice has been generated.`)
      } else {
        alert(result.error || "Failed to upgrade plan. Please try again.")
      }
    } catch (error) {
      console.error("Error upgrading plan:", error)
      alert("An error occurred while upgrading plan.")
    } finally {
      setUpgradingPlan(false)
    }
  }

  // Load data on mount
  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  // Calculate plan metadata
  const planKey = (company?.subscription_plan as PlanKey) ?? "basic"
  const plan = PLAN_META[planKey] ?? PLAN_META.basic

  const contractProgress =
    plan.contractLimit > 0 ? Math.min(100, Math.round((stats.contracts / plan.contractLimit) * 100)) : 100
  const userProgress =
    plan.userLimit > 0 ? Math.min(100, Math.round((stats.members / plan.userLimit) * 100)) : 100

  // Navigation handlers
  const handleInviteMember = () => navigate("/owner/team")
  const handleViewCompany = () => navigate("/owner/settings")
  
  const handleUpgradeClick = () => {
    // For enterprise plan, show contact message
    if (planKey === "enterprise") {
      alert("You are already on the Enterprise plan. Contact our sales team for custom pricing.")
      return
    }
    
    // Open modal for basic/premium users
    setIsModalOpen(true)
  }

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
              onClick={handleUpgradeClick}
              disabled={upgradingPlan || planKey === "enterprise"}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#F58A33] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e67c27] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {upgradingPlan && <Loader2 className="h-4 w-4 animate-spin" />}
              {planKey === "enterprise" ? "Current Plan" : "Upgrade Plan"}
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

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        planName={planKey === "basic" ? "Professional" : "Enterprise"}
        planPrice={planKey === "basic" ? PLAN_PRICES.premium : PLAN_PRICES.enterprise}
        planFeatures={planKey === "basic" ? PLAN_FEATURES.premium : PLAN_FEATURES.enterprise}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  )
}
