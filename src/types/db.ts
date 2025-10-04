export type Risk = 'Low'|'Medium'|'High'
export type Status = 'Draft'|'Pending Review'|'Reviewed'|'Approved'|'Revision Requested'|'Rejected'|'Active'|'Expired'

export type Contract = {
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
}

export type ContractEntity = {
  id: number
  contract_id: string
  first_party: string | null
  second_party: string | null
  value_rp: number | null
  duration_months: number | null
  penalty: string | null
  initial_risk: Risk | null
  analyzed_at: string
}

export type RiskFinding = {
  id: number
  contract_id: string
  section: string | null
  level: Risk
  title: string
  created_at: string
}

export type LegalNote = {
  id: number
  contract_id: string
  author: string | null
  note: string
  created_at: string
}

export type Approval = {
  id: number
  contract_id: string
  action: 'approve'|'request_revision'|'reject'
  actor: string | null
  created_at: string
}

export type LegalKPI = {
  contracts_this_week: number
  high_risk: number
  pending_ai: number
}
