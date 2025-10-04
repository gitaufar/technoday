import supabase from '@/utils/supabase'
import { withAuthCheck } from '@/utils/authHelper'
import { extractAndSaveContractDetails } from './contractDetailsService'

interface RiskAnalysisResponse {
  success: boolean
  risk_level: string
  confidence: number  // Will be converted to match DB numeric(4,3) format
  risk_factors: Array<{
    type: string
    description: string
    severity: string
    found_keywords: string[]
    keyword_count: number
  }>
  risk_assessment: {
    description: string
    confidence_interpretation: string
    recommendations: string[]
    risk_factor_count: number
    high_severity_factors: number
    medium_severity_factors: number
    low_severity_factors: number
  }
  processed_text_length: number
  model_used: string
  error_message: string | null
  analysis_timestamp: string
  processing_time: number
}

/**
 * Mengirim file ke API risk analysis dan menyimpan hasilnya ke database
 */
export async function analyzeContractRisk(contractId: string, file: File): Promise<RiskAnalysisResponse | null> {
  return withAuthCheck(async () => {
    try {
      // 1. Kirim file ke API risk analysis
      const formData = new FormData()
      formData.append('file', file)

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
      const response = await fetch(`${API_BASE_URL}/api/risk/analyze/file`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      const analysisResult: RiskAnalysisResponse = await response.json()

      // 2. Simpan hasil analysis ke tabel ai_risk_analysis
      const { error: insertError } = await supabase
        .from('ai_risk_analysis')
        .insert({
          contract_id: contractId,
          analysis_result: analysisResult, // Simpan seluruh response sebagai JSON
          risk_level: analysisResult.risk_level,
          confidence: analysisResult.confidence,
          model_used: analysisResult.model_used,
          processing_time: analysisResult.processing_time,
          analyzed_at: new Date().toISOString(),
        })

      if (insertError) {
        console.error('Error saving AI analysis to database:', insertError)
        console.error('Failed data:', {
          contract_id: contractId,
          analysis_result: analysisResult,
          risk_level: analysisResult.risk_level,
          confidence: analysisResult.confidence,
          model_used: analysisResult.model_used,
          processing_time: analysisResult.processing_time,
        })
        throw insertError
      }

      // 3. Update contract dengan risk level dari AI analysis
      const { error: updateError } = await supabase
        .from('contracts')
        .update({
          risk: analysisResult.risk_level,
        })
        .eq('id', contractId)

      if (updateError) {
        console.error('Error updating contract risk:', updateError)
        // Tidak throw error karena yang penting data AI analysis sudah tersimpan
      }

      return analysisResult

    } catch (error) {
      console.error('Error in analyzeContractRisk:', error)
      
      // Simpan error ke database untuk tracking
      await supabase
        .from('ai_risk_analysis')
        .insert({
          contract_id: contractId,
          analysis_result: {
            success: false,
            error_message: error instanceof Error ? error.message : 'Unknown error',
          },
          risk_level: 'Unknown',
          confidence: 0,
          model_used: 'error',
          analyzed_at: new Date().toISOString(),
        })

      return null
    }
  })
}

/**
 * Upload file ke storage dan langsung analyze risk
 */
export async function uploadAndAnalyzeContract(contractId: string, file: File) {
  return withAuthCheck(async () => {
    // 1. Upload file ke storage dulu
    const safeName = file.name.replace(/[^\w\-.]+/g, '_')
    const ts = Date.now()
    const filePath = `${contractId}/${ts}_${safeName}`

    const { error: uploadError } = await supabase.storage
      .from('pdf_storage')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })
      
    if (uploadError) throw uploadError

    // 2. Get public URL
    const { data } = supabase.storage.from('pdf_storage').getPublicUrl(filePath)
    const file_url = data?.publicUrl ?? null

    // 3. Update contract dengan file URL
    const { error: updateError } = await supabase
      .from('contracts')
      .update({ file_url })
      .eq('id', contractId)

    if (updateError) {
      console.error('Error updating contract file URL:', updateError)
      throw updateError
    }

    // 4. Jalankan contract details extraction dan AI analysis secara parallel
    const [contractDetails, analysisResult] = await Promise.allSettled([
      extractAndSaveContractDetails(contractId, file),
      analyzeContractRisk(contractId, file)
    ])
    
    return {
      file_url,
      contract_details: contractDetails.status === 'fulfilled' ? contractDetails.value : null,
      analysis: analysisResult.status === 'fulfilled' ? analysisResult.value : null,
      errors: {
        contract_details_error: contractDetails.status === 'rejected' ? contractDetails.reason : null,
        analysis_error: analysisResult.status === 'rejected' ? analysisResult.reason : null,
      }
    }
  })
}