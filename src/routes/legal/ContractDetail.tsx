"use client"
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAnalyzer } from '@/hooks/useContracts'
import supabase from '@/utils/supabase'

import CardDetailContract from '@/components/Legal/CardDetailContract'
import RiskAnalysisCard from '@/components/Legal/RiskAnalysis'
import LegalNotes from '@/components/Legal/LegalNotes'
import InteractiveDocumentViewer from '@/components/Legal/AIRecommendation'

export default function ContractDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  // Pastikan hook memberikan nilai default jika datanya belum siap
  const { findings = [] } = useAnalyzer(id ?? undefined) || { findings: [] }

  const [meta, setMeta] = useState<any>(null)
  const [notes, setNotes] = useState<any[]>([])
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Ambil detail kontrak
  useEffect(() => {
    if (!id) return
    ;(async () => {
      setLoading(true)
      const { data, error } = await supabase.from('contracts').select('*').eq('id', id).single()
      if (!error) setMeta(data)
      setLoading(false)
    })()
  }, [id])

  // Ambil AI analysis results
  useEffect(() => {
    if (!id) return
    ;(async () => {
      const { data, error } = await supabase
        .from('ai_risk_analysis')
        .select('analysis_result')
        .eq('contract_id', id)
        .single()
      
      if (!error && data?.analysis_result) {
        try {
          const parsedAnalysis = typeof data.analysis_result === 'string' 
            ? JSON.parse(data.analysis_result) 
            : data.analysis_result
          setAiAnalysis(parsedAnalysis)
        } catch (parseError) {
          console.error('Error parsing AI analysis:', parseError)
          setAiAnalysis(null)
        }
      }
    })()
  }, [id])

  // Ambil catatan legal dari legal_notes
  useEffect(() => {
    if (!id) return
    ;(async () => {
      const { data, error } = await supabase.from('legal_notes').select('*').eq('contract_id', id).order('created_at', { ascending: false })
      if (!error) setNotes(data ?? [])
    })()
  }, [id])

  const addNote = async (contractId: string, note: string) => {
    const { data, error } = await supabase.from('legal_notes').insert({ 
      contract_id: contractId, 
      note,
      author: 'legal@ilcs.co.id'
    }).select('*').single()
    if (!error && data) setNotes((prev) => [data, ...prev])
  }

  // ==================================================================
  // Persiapan Data untuk Komponen (Tanpa Data Dummy)
  // ==================================================================

  const penaltyFinding = findings.find((f: any) => String(f.section ?? f.title ?? '').toLowerCase().includes('penalty'))

  const contractDetails = {
    firstParty: meta?.first_party ?? '-',
    secondParty: meta?.second_party ?? '-',
    contractValue: `Rp ${Number(meta?.value_rp ?? meta?.value ?? 0).toLocaleString('id-ID')}`,
    status: meta?.status || 'On Review',
    duration: meta?.duration_months != null ? `${meta.duration_months} Bulan` : '-',
    startDate: meta?.start_date ? new Date(meta.start_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-',
    penalty: penaltyFinding?.title?.split(': ')?.[1] ?? '-',
    // Menggunakan risk_level dari AI analysis, fallback ke risk_findings
    riskLevel: (aiAnalysis?.risk_level ? `${aiAnalysis.risk_level} Risk` : 
               (findings.some((f: any) => f.level === 'High') ? 'High Risk' : 
                findings.some((f: any) => f.level === 'Medium') ? 'Medium Risk' : 'Low Risk')) as 'High Risk' | 'Medium Risk' | 'Low Risk',
  }

  // Helper function untuk mengubah snake_case menjadi Title Case
  const formatRiskType = (type: string): string => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  // Risk Analysis data dari ai_risk_analysis.analysis_result
  const analysisData = aiAnalysis?.risk_factors?.map((factor: any) => ({
    title: formatRiskType(factor.type), // Mengubah force_majeure menjadi Force Majeure
    riskLevel: factor.severity || 'Low', // Menggunakan severity dari AI analysis
    description: factor.description || 'No description available.',
    documentLink: `#${factor.type}`, // Link berdasarkan type
    // Tambahan data untuk display yang lebih kaya
    keywordCount: factor.keyword_count || 0,
    foundKeywords: factor.found_keywords || []
  })) || []

  // AI Recommendation data dari ai_risk_analysis.analysis_result
  const aiRecommendationData = {
    riskLevel: aiAnalysis?.risk_level || 'Unknown',
    confidence: aiAnalysis?.confidence || 0,
    riskFactors: aiAnalysis?.risk_factors || [],
    riskAssessment: aiAnalysis?.risk_assessment || {},
    modelUsed: aiAnalysis?.model_used || 'AI Model',
    processingTime: aiAnalysis?.processing_time || 0,
    analysisTimestamp: aiAnalysis?.analysis_timestamp || new Date().toISOString(),
    recommendations: aiAnalysis?.risk_assessment?.recommendations || [],
    // Format untuk komponen sections
    sections: [
      {
        title: 'Risk Assessment',
        content: aiAnalysis?.risk_assessment?.description || 'No risk assessment available',
        highlight: (aiAnalysis?.risk_level?.toLowerCase() === 'high' ? 'high' : 
                   aiAnalysis?.risk_level?.toLowerCase() === 'medium' ? 'medium' : 'low') as 'low' | 'medium' | 'high'
      },
      {
        title: 'Confidence Level', 
        content: `${Math.round((aiAnalysis?.confidence || 0) * 100)}% - ${aiAnalysis?.risk_assessment?.confidence_interpretation || 'No confidence data'}`,
        highlight: 'low' as const
      },
      {
        title: 'Model Information',
        content: `Analysis by: ${aiAnalysis?.model_used || 'AI Model'} | Processing time: ${aiAnalysis?.processing_time?.toFixed(2) || 0}s`,
        highlight: 'low' as const
      },
      ...aiAnalysis?.risk_factors?.map((factor: any) => ({
        title: `${factor.type.replace(/_/g, ' ').toUpperCase()} Risk`,
        content: `${factor.description} (Severity: ${factor.severity}) - Found ${factor.keyword_count} related keywords: ${factor.found_keywords?.join(', ') || 'N/A'}`,
        highlight: (factor.severity?.toLowerCase() === 'high' ? 'high' : 
                   factor.severity?.toLowerCase() === 'medium' ? 'medium' : 'low') as 'low' | 'medium' | 'high'
      })) || []
    ],
    // Format untuk komponen suggestions 
    suggestions: aiAnalysis?.risk_assessment?.recommendations?.map((rec: string, index: number) => ({
      title: `Recommendation ${index + 1}`,
      originalContent: `Based on ${aiAnalysis?.model_used || 'AI'} analysis, this contract requires attention in ${aiAnalysis?.risk_assessment?.risk_factor_count || 0} areas`,
      suggestedContent: rec,
      riskLevel: (aiAnalysis?.risk_level?.toLowerCase() === 'high' ? 'high' : 
                 aiAnalysis?.risk_level?.toLowerCase() === 'medium' ? 'medium' : 'low') as 'low' | 'medium' | 'high'
    })) || []
  }

  const formattedNotes = (notes ?? []).map((n: any) => ({
    id: n.id,
    author: n.author || 'Unknown',
    timestamp: n.created_at ? new Date(n.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '',
    content: n.note,
  }))

  const handleSaveNote = (newNoteContent: string) => {
    if (id) addNote(id, newNoteContent)
  }

  // Handler untuk approve contract
  const handleApprove = async () => {
    if (!id || actionLoading) return
    
    setActionLoading('approve')
    try {
      // Update contract status - sesuai dengan tabel contracts di Supabase
      const { error: contractError } = await supabase
        .from('contracts')
        .update({ 
          status: 'Reviewed',
          created_at: new Date().toISOString() // Update timestamp
        })
        .eq('id', id)
      
      if (contractError) {
        console.error('Contract update error:', contractError)
        throw contractError
      }

      // Add legal note untuk audit trail
      const { error: noteError } = await supabase
        .from('legal_notes')
        .insert({
          contract_id: id,
          author: 'legal@ilcs.co.id',
          note: 'Contract Reviewed by Legal team and forwarded to Management for review.'
        })

      if (noteError) {
        console.error('Note insert error:', noteError)
        // Don't throw - note is not critical
      }

      // Insert lifecycle record sesuai dengan tabel contract_lifecycle
      const { error: lifecycleError } = await supabase
        .from('contract_lifecycle')
        .insert({
          contract_id: id,
          stage: 'management_review',
          started_at: new Date().toISOString(),
          notes: 'Contract approved by legal team and sent to management for review'
        })

      if (lifecycleError) {
        console.error('Lifecycle insert error:', lifecycleError)
        // Don't throw - lifecycle is not critical
      }
      
      // Update local state
            setMeta((prev: any) => ({ ...prev, status: 'Reviewed' }))
      
      // Refresh notes to show the new audit note
      const { data: updatedNotes } = await supabase
        .from('legal_notes')
        .select('*')
        .eq('contract_id', id)
        .order('created_at', { ascending: false })
      
      if (updatedNotes) setNotes(updatedNotes)
      
      alert('Contract reviewed successfully! It has been forwarded to management for final review.')
      
      // Navigate back to inbox after successful review
      setTimeout(() => {
        navigate('/legal/inbox')
      }, 1500)
    } catch (error) {
      console.error('Error approving contract:', error)
      alert('Failed to review contract. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  // Handler untuk request revision
  const handleRequestRevision = async () => {
    if (!id || actionLoading) return
    
    setActionLoading('revision')
    try {
      // Update contract status - sesuai dengan tabel contracts di Supabase
      const { error: contractError } = await supabase
        .from('contracts')
        .update({ 
          status: 'Revision Requested',
          created_at: new Date().toISOString() // Update timestamp
        })
        .eq('id', id)
      
      if (contractError) {
        console.error('Contract update error:', contractError)
        throw contractError
      }

      // Add legal note untuk audit trail
      const { error: noteError } = await supabase
        .from('legal_notes')
        .insert({ 
          contract_id: id, 
          author: 'legal@ilcs.co.id', 
          note: 'Contract returned to procurement for revision'
        })

      if (noteError) {
        console.error('Note insert error:', noteError)
        // Don't throw - note is not critical
      }

      // Insert lifecycle record sesuai dengan tabel contract_lifecycle
      const { error: lifecycleError } = await supabase
        .from('contract_lifecycle')
        .insert({
          contract_id: id,
          stage: 'procurement_revision',
          started_at: new Date().toISOString(),
          notes: 'Contract returned to procurement for revision by legal team'
        })

      if (lifecycleError) {
        console.error('Lifecycle insert error:', lifecycleError)
        // Don't throw - lifecycle is not critical
      }
      
      // Update local state
      setMeta((prev: any) => ({ 
        ...prev, 
        status: 'Revision Requested'
      }))
      
      // Refresh notes to show the new audit note
      const { data: updatedNotes } = await supabase
        .from('legal_notes')
        .select('*')
        .eq('contract_id', id)
        .order('created_at', { ascending: false })
      
      if (updatedNotes) setNotes(updatedNotes)
      
      alert('Contract successfully returned to procurement for revision.')
      
      // Navigate back to inbox after successful revision request
      setTimeout(() => {
        navigate('/legal/inbox')
      }, 1500)
    } catch (error) {
      console.error('Error requesting revision:', error)
      alert('Failed to request revision. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  // Handler untuk save draft notes
  const handleSaveDraft = async () => {
    if (!id || actionLoading) return
    
    setActionLoading('draft')
    try {
      const { error } = await supabase
        .from('contracts')
        .update({ 
          status: 'Draft',
          draft_saved_at: new Date().toISOString(),
          draft_saved_by: 'legal@ilcs.co.id'
        })
        .eq('id', id)
      
      if (error) throw error
      
      // Update local state
      setMeta((prev: any) => ({ ...prev, status: 'Draft' }))
      
      alert('Contract saved as draft. You can continue editing later.')
    } catch (error) {
      console.error('Error saving draft:', error)
      alert('Failed to save draft. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading || !meta) {
    return <div className="p-6">Loading contract details...</div>
  }

  return (
    <div className="space-y-6">
      <CardDetailContract contract={contractDetails} />

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:gap-8 lg:grid-cols-2 items-start">
        <div className="h-full">
          <RiskAnalysisCard risks={analysisData} />
        </div>
        <div className="h-full">
          <InteractiveDocumentViewer
          documentTitle={`AI Risk Analysis - ${aiRecommendationData.riskLevel} Risk (${Math.round((aiRecommendationData.confidence || 0) * 100)}% confidence)`}
          sections={aiRecommendationData.sections}
          suggestions={aiRecommendationData.suggestions}
        />
        </div>
      </div>

      <LegalNotes notes={formattedNotes} onSaveNote={handleSaveNote} />

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Current Status: <span className="font-semibold text-gray-900">{meta?.status || 'Unknown'}</span>
          {meta?.workflow_stage && (
            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              {meta.workflow_stage.replace(/_/g, ' ').toUpperCase()}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSaveDraft}
            disabled={actionLoading !== null}
            className={`rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-700 transition-colors ${
              actionLoading !== null 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-gray-50'
            }`}
          >
            {actionLoading === 'draft' ? 'Saving...' : 'Save Draft Notes'}
          </button>
          <button 
            onClick={handleRequestRevision}
            disabled={actionLoading !== null || meta?.status === 'Reviewed'}
            className={`rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white transition-colors ${
              actionLoading !== null || meta?.status === 'Approved'
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-orange-600'
            }`}
          >
            {actionLoading === 'revision' ? 'Processing...' : 'Request Revision'}
          </button>
          <button 
            onClick={handleApprove}
            disabled={actionLoading !== null || meta?.status === 'Reviewed'}
            className={`rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition-colors ${
              actionLoading !== null || meta?.status === 'Approved'
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-green-700'
            }`}
          >
            {actionLoading === 'approve' ? 'Reviewing...' : 'Review Contract'}
          </button>
        </div>
      </div>
    </div>
  )
}