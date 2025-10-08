import { useCallback, useEffect, useMemo, useState } from "react"
import { Check, Download, Loader2 } from "lucide-react"

import { useAuth } from "@/auth/AuthProvider"
import { 
  getCompanyInvoices, 
  getCurrentPlan, 
  processSubscription, 
  downloadAllInvoices,
  type InvoiceRecord 
} from "@/services/billingService"
import { SubscriptionModal } from "@/components/SubscriptionModal"

type PlanKey = "basic" | "premium" | "enterprise"
type InvoiceStatus = "paid" | "due" | "failed" | "pending" | "refunded"

type PlanDefinition = {
  label: string
  price: string
  priceSuffix: string
  features: string[]
  buttonLabel: string
}

type Invoice = {
  id: string
  date: string | null
  plan: string
  amount: number
  status: InvoiceStatus
  downloadUrl: string | null
}

const PLAN_DEFINITIONS: Record<PlanKey, PlanDefinition> = {
  basic: {
    label: "Starter",
    price: "$0",
    priceSuffix: "per month",
    features: ["Up to 3 users", "100 contracts limit", "Basic upload & tracking", "Email support"],
    buttonLabel: "Choose Plan"
  },
  premium: {
    label: "Professional",
    price: "$220",
    priceSuffix: "per month",
    features: [
      "Up to 10,000 contracts / month",
      "AI Risk Analyzer",
      "100 GB storage",
      "Team collaboration & role management",
      "Priority email support",
      "Daily backup & 7-day log retention"
    ],
    buttonLabel: "Choose Plan"
  },
  enterprise: {
    label: "Enterprise",
    price: "$470",
    priceSuffix: "per month",
    features: [
      "Unlimited users",
      "Unlimited contracts",
      "Multi-company support",
      "Advanced reports",
      "24/7 SLA support"
    ],
    buttonLabel: "Upgrade Plan"
  }
}

// Price mapping in IDR for modal
const PLAN_PRICES: Record<PlanKey, number> = {
  basic: 0,
  premium: 220, // $220
  enterprise: 470 // $470
}

const INVOICE_STATUS_META: Record<InvoiceStatus, { label: string; className: string }> = {
  paid: { label: "Paid", className: "bg-emerald-50 text-emerald-600" },
  due: { label: "Due", className: "bg-amber-50 text-amber-600" },
  failed: { label: "Failed", className: "bg-rose-50 text-rose-600" },
  pending: { label: "Pending", className: "bg-slate-100 text-slate-600" },
  refunded: { label: "Refunded", className: "bg-blue-50 text-blue-600" }
}

const DEFAULT_STATUS_META = { label: "Unknown", className: "bg-slate-100 text-slate-500" }

function normalizeInvoiceStatus(status: string | null | undefined): InvoiceStatus {
  const normalized = (status ?? "").toLowerCase()
  if (normalized === "paid" || normalized === "due" || normalized === "failed" || normalized === "pending" || normalized === "refunded") {
    return normalized
  }
  return "due"
}

function mapInvoiceRecordToInvoice(record: InvoiceRecord): Invoice {
  const status = normalizeInvoiceStatus(record.status)
  const amount = typeof record.amount === "number" ? record.amount : Number(record.amount ?? 0)
  const issuedAt = record.issued_at ?? record.billing_date ?? record.created_at ?? null

  return {
    id: record.id,
    date: issuedAt,
    plan: record.plan_name ?? "Custom Plan",
    amount,
    status,
    downloadUrl: record.invoice_url ?? null
  }
}

function formatCurrency(amount: number): string {
  return `Rp ${amount.toLocaleString("en-US")}`
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(date)
}

export const BillingOwner = () => {
  const { companyId } = useAuth()

  const [currentPlan, setCurrentPlan] = useState<PlanKey>("basic")
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loadingInvoices, setLoadingInvoices] = useState(true)
  const [invoiceError, setInvoiceError] = useState<string | null>(null)
  const [changingPlan, setChangingPlan] = useState(false)
  const [downloadingAll, setDownloadingAll] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PlanKey | null>(null)

  const loadBillingData = useCallback(async () => {
    if (!companyId) return

    setLoadingInvoices(true)
    try {
      const [plan, invoiceRecords] = await Promise.all([
        getCurrentPlan(companyId),
        getCompanyInvoices(companyId)
      ])

      if (plan) {
        setCurrentPlan((plan as PlanKey) ?? "basic")
      }

      const mapped = (invoiceRecords ?? []).map(mapInvoiceRecordToInvoice)
      setInvoices(mapped)
      setInvoiceError(null)
    } catch (error) {
      console.error("Failed to load billing data", error)
      setInvoices([])
      setInvoiceError("Failed to load invoices.")
    } finally {
      setLoadingInvoices(false)
    }
  }, [companyId])

  useEffect(() => {
    loadBillingData()
  }, [loadBillingData])

  const handleOpenModal = (planKey: PlanKey) => {
    if (planKey === currentPlan) return
    setSelectedPlan(planKey)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedPlan(null)
  }

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
    if (!companyId || !selectedPlan) return

    setChangingPlan(true)
    try {
      const planName = PLAN_DEFINITIONS[selectedPlan].label
      const planPrice = PLAN_PRICES[selectedPlan]

      // Determine payment method from card number (first digit)
      const firstDigit = paymentData.cardNumber.charAt(0)
      const paymentMethod = firstDigit === "4" ? "visa" : firstDigit === "5" ? "mastercard" : "credit_card"

      // Process subscription (update plan + create invoice)
      const result = await processSubscription(
        companyId,
        selectedPlan,
        planPrice,
        paymentMethod,
        `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      )

      if (result.success) {
        setCurrentPlan(selectedPlan)
        
        // Refresh billing data to show new invoice
        await loadBillingData()
        
        alert(`Successfully subscribed to ${planName}! Invoice has been generated.`)
      } else {
        alert(result.error || "Failed to process subscription. Please try again.")
      }
    } catch (error) {
      console.error("Error processing payment:", error)
      alert("An error occurred while processing payment.")
    } finally {
      setChangingPlan(false)
    }
  }

  const handleDownloadAll = async () => {
    if (!companyId || downloadingAll || invoices.length === 0) return

    setDownloadingAll(true)
    try {
      await downloadAllInvoices(companyId)
    } catch (error) {
      console.error("Error downloading all invoices:", error)
      alert("Failed to download invoices. Please try again.")
    } finally {
      setDownloadingAll(false)
    }
  }

  const planCards = useMemo(() => {
    return (Object.keys(PLAN_DEFINITIONS) as PlanKey[]).map(planKey => {
      const definition = PLAN_DEFINITIONS[planKey]
      const isCurrent = planKey === currentPlan

      return {
        key: planKey,
        definition,
        isCurrent
      }
    })
  }, [currentPlan])

  const renderFeature = (feature: string) => (
    <li key={feature} className="flex items-start gap-3 text-sm text-slate-600 leading-relaxed">
      <span className="mt-0.5 rounded-full bg-emerald-100 p-1 text-emerald-500">
        <Check className="h-3 w-3" strokeWidth={2.5} />
      </span>
      <span>{feature}</span>
    </li>
  )

  if (!companyId) {
    return (
      <div className="grid min-h-[calc(100vh-6rem)] place-items-center bg-slate-50 px-6 text-center text-slate-500">
        You need an active company to manage billing.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-slate-900">Billing & Subscription</h1>
          <p className="text-sm text-slate-500">
            Manage your subscription plan, invoices, and billing preferences
          </p>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-slate-900">Choose Your Plan</h2>
            <div className="grid gap-4 lg:grid-cols-3">
              {planCards.map(({ key, definition, isCurrent }) => (
                <div
                  key={key}
                  className={`relative flex h-full flex-col gap-5 rounded-3xl border px-6 py-6 shadow-sm transition ${
                    isCurrent
                      ? "border-blue-500 ring-2 ring-blue-100"
                      : "border-slate-200 hover:border-blue-200 hover:shadow-md"
                  }`}
                >
                  {isCurrent && (
                    <span className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600">
                      Current
                    </span>
                  )}

                  <div className={`flex flex-col items-center gap-2 ${isCurrent ? "mt-8" : ""}`}>
                    <h3 className="text-lg font-semibold text-slate-900">{definition.label}</h3>
                    <p className="text-3xl font-bold text-slate-900">
                      {definition.price}
                      <span className="ml-1 text-base font-medium text-slate-500">{definition.priceSuffix}</span>
                    </p>
                  </div>

                  <ul className="flex flex-1 flex-col gap-3">
                    {definition.features.map(renderFeature)}
                  </ul>

                    <button
                      type="button"
                      onClick={() => !isCurrent && key !== "basic" && handleOpenModal(key)}
                      disabled={isCurrent || changingPlan}
                      className={`mt-auto inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                        isCurrent
                          ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
                          : key === "enterprise"
                            ? "bg-[#F58A33] text-white hover:bg-[#e67c27] focus:ring-[#F58A33]"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 focus:ring-slate-300"
                      } ${key === "basic" ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {changingPlan && !isCurrent && <Loader2 className="h-4 w-4 animate-spin" />}
                      {isCurrent ? "Current Plan" : definition.buttonLabel}
                    </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Payment & Invoice History</h2>
              <p className="text-sm text-slate-500">Download invoices or review your recent payments</p>
            </div>
            <button
              type="button"
              onClick={handleDownloadAll}
              disabled={downloadingAll || invoices.length === 0}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {downloadingAll ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download All
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Plan
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right">
                    Invoice
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {loadingInvoices && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                      <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-slate-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading invoices...
                      </div>
                    </td>
                  </tr>
                )}

                {!loadingInvoices && invoiceError && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-rose-500">
                      {invoiceError}
                    </td>
                  </tr>
                )}

                {!loadingInvoices && !invoiceError && invoices.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                      No invoices found for this company yet.
                    </td>
                  </tr>
                )}

                {!loadingInvoices &&
                  !invoiceError &&
                  invoices.map(invoice => {
                    const meta = INVOICE_STATUS_META[invoice.status] ?? DEFAULT_STATUS_META
                    return (
                      <tr key={invoice.id} className="transition hover:bg-slate-50">
                        <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-700">
                          {formatDate(invoice.date)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">{invoice.plan}</td>
                        <td className="whitespace-nowrap px-6 py-4">{formatCurrency(invoice.amount)}</td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${meta.className}`}
                          >
                            {meta.label}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          {invoice.downloadUrl ? (
                            <a
                              href={invoice.downloadUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </a>
                          ) : (
                            <span className="text-sm text-slate-400">Unavailable</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Subscription Modal */}
      {selectedPlan && (
        <SubscriptionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          planName={PLAN_DEFINITIONS[selectedPlan].label}
          planPrice={PLAN_PRICES[selectedPlan]}
          planFeatures={PLAN_DEFINITIONS[selectedPlan].features}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}
