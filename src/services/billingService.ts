import supabase from "@/utils/supabase"

export type InvoiceRecord = {
  id: string
  company_id: string | null
  plan_name: string | null
  amount: number | null
  status: string | null
  invoice_url: string | null
  issued_at: string | null
  billing_date?: string | null
  created_at?: string | null
  period_start?: string | null
  period_end?: string | null
}

/**
 * Fetch billing invoices for a company ordered from newest to oldest.
 */
export async function getCompanyInvoices(companyId: string): Promise<InvoiceRecord[]> {
  const { data, error } = await supabase
    .from("billing_invoices")
    .select("*")
    .eq("company_id", companyId)
    .order("issued_at", { ascending: false })

  if (error) {
    console.error("Error fetching company invoices:", error)
    throw error
  }

  return (data as InvoiceRecord[]) ?? []
}

/**
 * Get current subscription plan for a company
 */
export async function getCurrentPlan(companyId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("companies")
    .select("subscription_plan")
    .eq("id", companyId)
    .maybeSingle()

  if (error) {
    console.error("Error fetching current plan:", error)
    throw error
  }

  return data?.subscription_plan ?? null
}

/**
 * Update subscription plan for a company
 */
export async function updateSubscriptionPlan(
  companyId: string,
  planName: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("companies")
      .update({ 
        subscription_plan: planName,
        updated_at: new Date().toISOString()
      })
      .eq("id", companyId)

    if (error) {
      console.error("Error updating subscription plan:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error updating subscription plan:", error)
    return false
  }
}

/**
 * Create a new billing invoice after successful payment
 */
export async function createInvoice(
  companyId: string,
  planName: string,
  amount: number,
  paymentMethod: string = "credit_card",
  transactionId?: string
): Promise<InvoiceRecord | null> {
  try {
    const now = new Date()
    const nextMonth = new Date(now)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    
    const dueDate = new Date(now)
    dueDate.setDate(dueDate.getDate() + 14) // 14 days payment term

    // Generate invoice number (you can use the database function instead)
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    const invoiceNumber = `INV-${year}${month}-${random}`

    const invoiceData = {
      company_id: companyId,
      plan_name: planName,
      amount,
      status: "paid", // Since payment was successful
      invoice_number: invoiceNumber,
      issued_at: now.toISOString(),
      billing_date: now.toISOString(),
      due_date: dueDate.toISOString(),
      paid_at: now.toISOString(),
      period_start: now.toISOString(),
      period_end: nextMonth.toISOString(),
      payment_method: paymentMethod,
      transaction_id: transactionId || `TXN-${Date.now()}`,
      notes: "Payment processed via subscription modal"
    }

    const { data, error } = await supabase
      .from("billing_invoices")
      .insert(invoiceData)
      .select()
      .single()

    if (error) {
      console.error("Error creating invoice:", error)
      throw error
    }

    return data as InvoiceRecord
  } catch (error) {
    console.error("Error creating invoice:", error)
    return null
  }
}

/**
 * Process subscription: Update plan and create invoice
 */
export async function processSubscription(
  companyId: string,
  planName: string,
  amount: number,
  paymentMethod: string = "credit_card",
  transactionId?: string
): Promise<{ success: boolean; invoice?: InvoiceRecord; error?: string }> {
  try {
    // 1. Update subscription plan
    const planUpdated = await updateSubscriptionPlan(companyId, planName)
    if (!planUpdated) {
      return { success: false, error: "Failed to update subscription plan" }
    }

    // 2. Create invoice
    const invoice = await createInvoice(companyId, planName, amount, paymentMethod, transactionId)
    if (!invoice) {
      return { success: false, error: "Failed to create invoice" }
    }

    return { success: true, invoice }
  } catch (error) {
    console.error("Error processing subscription:", error)
    return { success: false, error: "An error occurred while processing subscription" }
  }
}

/**
 * Download all invoices for a company as CSV or trigger batch download
 */
export async function downloadAllInvoices(companyId: string): Promise<void> {
  try {
    const invoices = await getCompanyInvoices(companyId)
    
    // Create CSV content
    const headers = ["Date", "Plan", "Amount", "Status", "Invoice Number"]
    const rows = invoices.map(inv => [
      inv.issued_at || "-",
      inv.plan_name || "-",
      inv.amount?.toString() || "0",
      inv.status || "-",
      inv.id
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n")

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    
    link.setAttribute("href", url)
    link.setAttribute("download", `invoices_${companyId}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error("Error downloading all invoices:", error)
    throw error
  }
}
