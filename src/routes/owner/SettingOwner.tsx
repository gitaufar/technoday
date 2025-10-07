import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, Loader2, ShieldAlert } from "lucide-react"

import { useAuth } from "@/auth/AuthProvider"
import supabase from "@/utils/supabase"
import { deactivateCompany, updateCompany, type CreateCompanyRequest } from "@/services/companyService"

type FormState = {
  organizationName: string
  legalEntityName: string
  taxId: string
  contactEmail: string
  contactPhone: string
}

type Feedback = { type: "success" | "error"; message: string } | null

export const SettingOwner = () => {
  const { companyId } = useAuth()
  const [form, setForm] = useState<FormState>({
    organizationName: "",
    legalEntityName: "",
    taxId: "",
    contactEmail: "",
    contactPhone: ""
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [supportsTaxId, setSupportsTaxId] = useState(true)
  const [deleting, setDeleting] = useState(false)

  const hasCompany = useMemo(() => Boolean(companyId), [companyId])

  useEffect(() => {
    let ignore = false

    async function fetchCompany() {
      if (!companyId) {
        setLoading(false)
        setFeedback({ type: "error", message: "Company context not found." })
        return
      }

      try {
        const { data, error } = await supabase.from("companies").select("*").eq("id", companyId).maybeSingle()

        if (error) {
          throw error
        }

        if (!ignore && data) {
          const row = data as {
            name?: string | null
            description?: string | null
            email?: string | null
            phone?: string | null
            tax_id?: string | null
          }

          const taxAvailable = Object.prototype.hasOwnProperty.call(row, "tax_id")
          setSupportsTaxId(taxAvailable)

          setForm({
            organizationName: row.name ?? "",
            legalEntityName: row.description ?? "",
            taxId: taxAvailable ? row.tax_id ?? "" : "",
            contactEmail: row.email ?? "",
            contactPhone: row.phone ?? ""
          })
        }
      } catch (error) {
        console.error("Failed to load organization profile", error)
        if (!ignore) {
          setFeedback({
            type: "error",
            message: "Failed to load organization details."
          })
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    setLoading(true)
    fetchCompany()

    return () => {
      ignore = true
    }
  }, [companyId])

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = event => {
    const { name, value } = event.target
    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async event => {
    event.preventDefault()
    if (!companyId || saving) return

    setSaving(true)
    setFeedback(null)

    try {
      const trimmed = {
        organizationName: form.organizationName.trim(),
        legalEntityName: form.legalEntityName.trim(),
        taxId: form.taxId.trim(),
        contactEmail: form.contactEmail.trim(),
        contactPhone: form.contactPhone.trim()
      }

      const updates: Record<string, unknown> = {
        name: trimmed.organizationName || null,
        description: trimmed.legalEntityName || null,
        email: trimmed.contactEmail || null,
        phone: trimmed.contactPhone || null
      }

      if (supportsTaxId) {
        updates.tax_id = trimmed.taxId || null
      }

      await updateCompany(companyId, updates as Partial<CreateCompanyRequest> & Record<string, unknown>)

      setFeedback({ type: "success", message: "Organization details updated successfully." })
    } catch (error) {
      console.error("Failed to update organization details", error)
      setFeedback({ type: "error", message: "Failed to update organization. Please try again." })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!companyId || deleting) return
    const confirmed = window.confirm(
      "This will deactivate your organization and remove access for all members. Continue?"
    )
    if (!confirmed) return

    setDeleting(true)
    setFeedback(null)

    try {
      await deactivateCompany(companyId)
      setFeedback({ type: "success", message: "Organization has been deactivated." })
    } catch (error) {
      console.error("Failed to deactivate organization", error)
      setFeedback({ type: "error", message: "Failed to deactivate organization." })
    } finally {
      setDeleting(false)
    }
  }

  if (!hasCompany) {
    return (
      <div className="grid min-h-[calc(100vh-6rem)] place-items-center bg-slate-50 px-6 text-center text-slate-500">
        You need to create or select an organization before updating settings.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold text-slate-900">Organization Settings</h1>
          <p className="text-sm text-slate-500">
            Update your organization profile and manage ownership settings
          </p>
        </header>

        {feedback && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              feedback.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-600"
            }`}
          >
            {feedback.message}
          </div>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Organization Profile</h2>
            <p className="text-sm text-slate-500">
              Keep your organization information accurate for invoices and communication
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-sm text-slate-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading organization profile...
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">Organization Name</span>
                  <input
                    name="organizationName"
                    value={form.organizationName}
                    onChange={handleChange}
                    placeholder="OptiMind Inc."
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">Legal Entity Name</span>
                  <input
                    name="legalEntityName"
                    value={form.legalEntityName}
                    onChange={handleChange}
                    placeholder="PT Indonesia Logistics Corporation Services"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">
                    Tax ID <span className="text-xs font-normal text-slate-400">(Optional)</span>
                  </span>
                  <input
                    name="taxId"
                    value={form.taxId}
                    onChange={handleChange}
                    placeholder="Enter tax identification number"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100"
                    disabled={!supportsTaxId}
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">Contact Email</span>
                  <input
                    name="contactEmail"
                    type="email"
                    value={form.contactEmail}
                    onChange={handleChange}
                    placeholder="admin@company.com"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">Contact Phone</span>
                  <input
                    name="contactPhone"
                    value={form.contactPhone}
                    onChange={handleChange}
                    placeholder="+62 21 1234 5678"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </label>
              </div>

              {!supportsTaxId && (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-600">
                  Tax ID storage is not yet enabled for your workspace.
                </p>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#346DD4] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#255bc2] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="rounded-3xl border border-rose-200 bg-rose-50/70 p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-rose-100 p-2 text-rose-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-rose-700">Danger Zone</h2>
              <p className="text-sm text-rose-600">
                These actions are irreversible. Please proceed with caution.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-80"
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  Delete Organization
                </button>
                <button
                  type="button"
                  onClick={() => setFeedback({ type: "error", message: "Ownership transfer flow is not yet implemented." })}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-400 hover:text-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2"
                >
                  Transfer Ownership
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
