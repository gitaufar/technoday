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
