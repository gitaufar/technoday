import supabase from '@/utils/supabase'
import { withAuthCheck } from '@/utils/authHelper'

// Types based on the database schema
export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  role: 'procurement' | 'legal' | 'manager'
  created_at: string
}

export interface RiskFinding {
  id: number
  contract_id: string | null
  section: string | null
  level: 'Low' | 'Medium' | 'High'
  title: string | null
  created_at: string | null
}

export interface LegalNote {
  id: number
  contract_id: string | null
  author: string | null
  note: string
  created_at: string | null
}

export interface ContractEntity {
  id: number
  contract_id: string | null
  first_party: string | null
  second_party: string | null
  value_rp: number | null
  duration_months: number | null
  penalty: string | null
  initial_risk: 'Low' | 'Medium' | 'High' | null
  analyzed_at: string | null
}

export interface ContractLifecycle {
  id: number
  contract_id: string | null
  stage: string
  started_at: string
  completed_at: string | null
  duration_days: number | null
  notes: string | null
  created_by: string | null
  profiles?: Profile
}

export interface ContractPerformance {
  id: number
  contract_id: string | null
  metric_type: string
  value: number
  division_average: number | null
  measured_at: string | null
}

export interface ContractWithDetails {
  id: string
  name: string
  first_party: string | null
  second_party: string | null
  value_rp: number | null
  duration_months: number | null
  start_date: string | null
  end_date: string | null
  risk: 'Low' | 'Medium' | 'High' | null
  status: 'Draft' | 'Submitted' | 'Reviewed' | 'Approved' | 'Revision Requested' | 'Active' | 'Expired' | 'Rejected'
  file_url: string | null
  created_by: string | null
  created_at: string | null
  // Related data
  risk_findings?: RiskFinding[]
  legal_notes?: LegalNote[]
  contract_entities?: ContractEntity[]
  contract_lifecycle?: ContractLifecycle[]
  contract_performance?: ContractPerformance[]
  ai_risk_analysis?: Array<{
    id: string
    analysis_result: any
    risk_level: string
    confidence: number
    model_used: string
    processing_time: number
    analyzed_at: string
  }>
}

/**
 * Get complete contract details dengan semua relasi
 */
export const getContractWithDetails = async (contractId: string): Promise<ContractWithDetails | null> => {
  return withAuthCheck(async () => {
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select(`
        *,
        risk_findings (*),
        legal_notes (*),
        contract_entities (*),
        contract_lifecycle (
          *,
          profiles:created_by (*)
        ),
        contract_performance (*),
        ai_risk_analysis (*)
      `)
      .eq('id', contractId)
      .single()

    if (contractError) {
      console.error('Error fetching contract:', contractError)
      throw contractError
    }

    return contract
  })
}

/**
 * Get legal notes untuk kontrak tertentu
 */
export const getLegalNotes = async (contractId: string): Promise<LegalNote[] | null> => {
  return withAuthCheck(async () => {
    const { data, error } = await supabase
      .from('legal_notes')
      .select('*')
      .eq('contract_id', contractId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching legal notes:', error)
      throw error
    }

      return data || []
    })
}

/**
 * Add new legal note
 */
export const addLegalNote = async (contractId: string, note: string, author?: string): Promise<LegalNote> => {
  return withAuthCheck(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .from('legal_notes')
      .insert({
        contract_id: contractId,
        note,
        author: author || user?.email || 'legal@ilcs'
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding legal note:', error)
      throw error
    }

    return data
  })
}

/**
 * Get risk findings untuk kontrak tertentu
 */
export const getRiskFindings = async (contractId: string): Promise<RiskFinding[] | null> => {
  return withAuthCheck(async () => {
    const { data, error } = await supabase
      .from('risk_findings')
      .select('*')
      .eq('contract_id', contractId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching risk findings:', error)
      throw error
    }

    return data || []
  })
}

/**
 * Get contract lifecycle stages
 */
export const getContractLifecycle = async (contractId: string): Promise<ContractLifecycle[] | null> => {
  return withAuthCheck(async () => {
    const { data, error } = await supabase
      .from('contract_lifecycle')
      .select(`
        *,
        profiles:created_by (*)
      `)
      .eq('contract_id', contractId)
      .order('started_at', { ascending: true })

    if (error) {
      console.error('Error fetching contract lifecycle:', error)
      throw error
    }

    return data || []
  })
}

/**
 * Update contract lifecycle stage
 */
export const updateContractLifecycle = async (
  contractId: string, 
  stage: string, 
  notes?: string
): Promise<ContractLifecycle> => {
  return withAuthCheck(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    // Complete previous stage if exists
    await supabase
      .from('contract_lifecycle')
      .update({ 
        completed_at: new Date().toISOString(),
        duration_days: null // Will be calculated by trigger/function
      })
      .eq('contract_id', contractId)
      .is('completed_at', null)

    // Add new stage
    const { data, error } = await supabase
      .from('contract_lifecycle')
      .insert({
        contract_id: contractId,
        stage,
        started_at: new Date().toISOString(),
        notes,
        created_by: user?.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error updating contract lifecycle:', error)
      throw error
    }

    return data
  })
}

/**
 * Get contract performance metrics
 */
export const getContractPerformance = async (contractId: string): Promise<ContractPerformance[] | null> => {
  return withAuthCheck(async () => {
    const { data, error } = await supabase
      .from('contract_performance')
      .select('*')
      .eq('contract_id', contractId)
      .order('measured_at', { ascending: false })

    if (error) {
      console.error('Error fetching contract performance:', error)
      throw error
    }

    return data || []
  })
}

/**
 * Get AI risk analysis results
 */
export const getAIRiskAnalysis = async (contractId: string) => {
  return withAuthCheck(async () => {
    const { data, error } = await supabase
      .from('ai_risk_analysis')
      .select('*')
      .eq('contract_id', contractId)
      .order('analyzed_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Error fetching AI risk analysis:', error)
      throw error
    }

    return data
  })
}