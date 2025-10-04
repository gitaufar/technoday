export type Risk = 'Low'|'Medium'|'High'
export type Status = 'Draft'|'Submitted'|'Reviewed'|'Approved'|'Revision Requested'|'Rejected'|'Active'|'Expired'

export type ContractRow = {
  id: string
  name: string
  first_party: string | null
  second_party: string | null
  value_rp: number | null
  duration_months: number | null
  start_date: string | null
  end_date: string | null
  risk: Risk | null
  status: Status
  file_url: string | null
  created_by: string | null
  created_at: string
  updated_at?: string | null
}

export type ProcurementKPI = {
  new_this_month: number
  new_last_month: number
  pending_legal_review: number
  approved_cnt: number
  approval_rate_pct: number
}
