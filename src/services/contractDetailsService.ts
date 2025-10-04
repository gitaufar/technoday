import supabase from '@/utils/supabase'
import { withAuthCheck } from '@/utils/authHelper'

interface ContractParty {
  name: string
  type: string
  address: string
}

interface ContractDetailsResponse {
  success: boolean
  contract_details: {
    contract_name: string
    first_party: ContractParty
    second_party: ContractParty
    contract_end_date: string
    contract_start_date: string
    contract_duration: string
    contract_value: string
    contract_type: string
    key_terms: string[]
  }
  extracted_text: string
  confidence_score: number
  analysis_method: string
  error_message: string | null
  processing_time: number
}

/**
 * Extract contract details dari file menggunakan API
 */
export const extractContractDetails = async (file: File): Promise<ContractDetailsResponse> => {
  return withAuthCheck(async () => {
    const formData = new FormData()
    formData.append('file', file)

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
    const response = await fetch(`${API_BASE_URL}/contract/details`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Contract details API error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  })
}

/**
 * Parse contract value dari string ke number
 */
const parseContractValue = (valueString: string): number => {
  // Extract numbers dari format "Rp 4.338.283.000,00"
  const cleanValue = valueString.replace(/[^\d,]/g, '').replace(',', '.')
  return parseFloat(cleanValue) || 0
}

/**
 * Parse duration dari string ke months
 */
const parseDurationToMonths = (durationString: string): number => {
  // Extract number dari format "365 hari kalender" 
  const days = parseInt(durationString.match(/(\d+)/)?.[1] || '0')
  return Math.round(days / 30) // Convert days to approximate months
}

/**
 * Parse date dari string ke Date object
 */
const parseContractDate = (dateString: string): Date | null => {
  try {
    // Handle format "20 Februari 2025"
    const months = {
      'Januari': '01', 'Februari': '02', 'Maret': '03', 'April': '04',
      'Mei': '05', 'Juni': '06', 'Juli': '07', 'Agustus': '08', 
      'September': '09', 'Oktober': '10', 'November': '11', 'Desember': '12'
    }
    
    const parts = dateString.split(' ')
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0')
      const month = months[parts[1] as keyof typeof months] || '01'
      const year = parts[2]
      return new Date(`${year}-${month}-${day}`)
    }
    
    // Fallback - try direct parsing
    const parsed = new Date(dateString)
    if (!isNaN(parsed.getTime())) {
      return parsed
    }
    return null
  } catch {
    return null
  }
}

/**
 * Simpan contract details ke database
 */
export const saveContractDetails = async (contractId: string, details: ContractDetailsResponse): Promise<void | null> => {
  return withAuthCheck(async () => {
    const contractDetails = details.contract_details
    
    // Parse values untuk database
    const valueRp = parseContractValue(contractDetails.contract_value)
    const durationMonths = parseDurationToMonths(contractDetails.contract_duration)
    const startDate = parseContractDate(contractDetails.contract_start_date)
    const endDate = parseContractDate(contractDetails.contract_end_date)

    // Update contract dengan extracted details
    const { error: updateError } = await supabase
      .from('contracts')
      .update({
        name: contractDetails.contract_name,
        first_party: contractDetails.first_party.name,
        second_party: contractDetails.second_party.name,
        value_rp: valueRp,
        duration_months: durationMonths,
        start_date: startDate?.toISOString().split('T')[0], // Format YYYY-MM-DD
        end_date: endDate?.toISOString().split('T')[0],
      })
      .eq('id', contractId)

    if (updateError) {
      console.error('Error updating contract with details:', updateError)
      throw updateError
    }

    // Save the entity details (allows multiple analysis records per contract)
    const { error: insertError } = await supabase
      .from('contract_entities')
      .insert({
        contract_id: contractId,
        first_party: details.contract_details.first_party.name,
        second_party: details.contract_details.second_party.name,
        value_rp: valueRp,
        duration_months: durationMonths,
        analyzed_at: new Date().toISOString(),
      })

    if (insertError) {
      // Log but don't throw - contract update succeeded
      console.warn('Failed to save entity details (contract updated successfully):', insertError)
    }
    // Ensure the function always returns void
    return
  })
}

/**
 * Extract details dan save ke database dalam satu operasi
 */
export const extractAndSaveContractDetails = async (contractId: string, file: File): Promise<ContractDetailsResponse> => {
  const details = await extractContractDetails(file)
  
  if (details.success) {
    await saveContractDetails(contractId, details)
  } else {
    console.warn('Contract details extraction failed:', details.error_message)
  }
  
  return details
}