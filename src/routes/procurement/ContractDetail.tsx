"use client"

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useContractsList } from '@/hooks/useProcurement'
import { 
  getContractWithDetails,
  getLegalNotes,
  type ContractWithDetails,
  type LegalNote
} from '@/services/contractService'
import { uploadAndAnalyzeContract } from '@/services/riskAnalysisService'
import { useAuth } from '@/auth/AuthProvider'
import supabase from '@/utils/supabase'
import { 
  Building2, 
  Calendar, 
  DollarSign, 
  Info, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Download,
  Eye,
  Upload,
  ArrowLeft,
  FileText,
  MessageSquare
} from 'lucide-react'

export default function ContractDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { role: userRole } = useAuth()
  const { rows } = useContractsList()
  
  // State untuk data dari database
  const [contractDetails, setContractDetails] = useState<ContractWithDetails | null>(null)
  const [legalNotes, setLegalNotes] = useState<LegalNote[]>([])
  const [loading, setLoading] = useState(true)
  
  // State untuk upload revision
  const [uploadingRevision, setUploadingRevision] = useState(false)
  const [revisionFile, setRevisionFile] = useState<File | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  
  // Function to check and update expired contracts
  const checkAndUpdateExpiredStatus = async (contract: ContractWithDetails) => {
    if (!contract.end_date || contract.status === 'Expired') return contract
    
    const currentDate = new Date()
    const endDate = new Date(contract.end_date)
    
    // Check if contract has expired
    if (currentDate > endDate && (contract.status === 'Active' || contract.status === 'Approved')) {
      try {
        // Update status to Expired in database
        const { error } = await supabase
          .from('contracts')
          .update({ status: 'Expired' })
          .eq('id', contract.id)
        
        if (error) {
          console.warn('Failed to update expired contract status:', error)
          return contract
        }
        
        // Return contract with updated status
        return { ...contract, status: 'Expired' as const }
      } catch (error) {
        console.warn('Error updating expired contract:', error)
        return contract
      }
    }
    
    return contract
  }
  
  // Find the contract by ID dari hook (untuk fallback)
  const contract = rows.find(row => row.id === id)

  // Fetch detailed data dari database
  useEffect(() => {
    if (!id) return
    
    const fetchContractDetails = async () => {
      try {
        setLoading(true)
        const [details, notes] = await Promise.all([
          getContractWithDetails(id),
          getLegalNotes(id)
        ])
        
        // Check and update expired status if needed
        const updatedDetails = details ? await checkAndUpdateExpiredStatus(details) : null
        
        setContractDetails(updatedDetails)
        setLegalNotes(notes || [])
      } catch (error) {
        console.error('Error fetching contract details:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchContractDetails()
  }, [id])

  // Handler untuk upload revision contract
  const handleUploadRevision = async () => {
    if (!revisionFile || !id || uploadingRevision) return
    
    try {
      setUploadingRevision(true)
      
      // Upload file dan jalankan AI analysis
      const result = await uploadAndAnalyzeContract(id, revisionFile)
      
      if (result && displayContract) {
        // Update contract status ke Submitted untuk review ulang
        try {
          const { error: statusError } = await supabase
            .from('contracts')
            .update({ status: 'Submitted' })
            .eq('id', id)
          
          if (statusError) {
            console.warn('Failed to update contract status:', statusError)
          }
        } catch (statusUpdateError) {
          console.warn('Error updating contract status:', statusUpdateError)
        }
        
        // Refresh contract details setelah upload
        const [updatedDetails, updatedNotes] = await Promise.all([
          getContractWithDetails(id),
          getLegalNotes(id)
        ])
        
        setContractDetails(updatedDetails)
        setLegalNotes(updatedNotes || [])
        
        // Reset state
        setRevisionFile(null)
        setShowUploadModal(false)
        
        // Show success message
        const detailsMsg = result?.contract_details?.success 
          ? "✅ Contract details updated" 
          : "⚠️ Details extraction failed";
        const analysisMsg = result?.analysis 
          ? "✅ AI analysis completed" 
          : "⚠️ AI analysis failed";
        
        const actionType = displayContract.status === 'Revision Requested' ? 'revision' : 'document'
        alert(`Contract ${actionType} uploaded successfully:\n${detailsMsg}\n${analysisMsg}\n✅ Status updated to Submitted`)
      }
    } catch (error) {
      console.error('Error uploading revision:', error)
      alert('Failed to upload contract revision')
    } finally {
      setUploadingRevision(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a PDF or Word document')
        return
      }
      
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024
      if (file.size > maxSize) {
        alert('File size must be less than 10MB')
        return
      }
      
      setRevisionFile(file)
    }
  }

  // Use detailed data if available, fallback to hook data
  const displayContract = contractDetails || contract
  
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <Clock className="mx-auto h-8 w-8 animate-spin text-blue-500" />
          <p className="mt-2 text-gray-500">Loading contract details...</p>
        </div>
      </div>
    )
  }

  if (!displayContract) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Contract Not Found</h2>
          <p className="text-gray-500">The requested contract could not be found.</p>
          <button
            onClick={() => navigate('/procurement/status')}
            className="mt-4 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Back to Status Tracking
          </button>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Revision Requested':
        return 'bg-red-100 text-red-700 border border-red-200'
      case 'Submitted':
        return 'bg-gray-100 text-gray-600 border border-gray-300'
      case 'Reviewed':
        return 'bg-orange-100 text-orange-700 border border-orange-200'
      case 'Approved':
      case 'Active':
        return 'bg-green-100 text-green-700 border border-green-200'
      case 'Expired':
        return 'bg-red-100 text-red-800 border border-red-300'
      case 'Rejected':
        return 'bg-gray-100 text-gray-800 border border-gray-300'
      default:
        return 'bg-gray-100 text-gray-600 border border-gray-300'
    }
  }

  const getProgressSteps = () => {
    // Always use our clean progress steps based on contract status
    // (Don't use raw lifecycle data as it can be messy)
    
    // Default steps berdasarkan status kontrak
    let steps = []

    switch (displayContract.status) {
      case 'Draft':
        steps = [
          { name: 'Submit', status: 'pending', date: null },
          { name: 'Legal Review', status: 'pending', date: null },
          { name: 'Revision', status: 'pending', date: null },
          { name: 'Active', status: 'pending', date: null }
        ]
        break
      
      case 'Submitted':
        steps = [
          { name: 'Submit', status: 'completed', date: null },
          { name: 'Legal Review', status: 'current', date: null },
          { name: 'Revision', status: 'pending', date: null },
          { name: 'Active', status: 'pending', date: null }
        ]
        break
      
      case 'Reviewed':
        steps = [
          { name: 'Submit', status: 'completed', date: null },
          { name: 'Legal Review', status: 'completed', date: null },
          { name: 'Revision', status: 'pending', date: null },
          { name: 'Active', status: 'pending', date: null }
        ]
        break
      
      case 'Revision Requested':
        steps = [
          { name: 'Submit', status: 'completed', date: null },
          { name: 'Legal Review', status: 'completed', date: null },
          { name: 'Revision', status: 'current', date: null },
          { name: 'Active', status: 'pending', date: null }
        ]
        break
      
      case 'Approved':
      case 'Active':
        steps = [
          { 
            name: 'Submit', 
            status: 'completed', 
            date: displayContract.created_at 
          },
          { 
            name: 'Legal Review', 
            status: 'completed', 
            date: null // Could be enhanced to get actual review date from legal_notes
          },
          { 
            name: 'Active', 
            status: 'completed', 
            date: displayContract.start_date || new Date().toISOString() 
          }
        ]
        break
      
      case 'Rejected':
        steps = [
          { name: 'Submit', status: 'completed', date: null },
          { name: 'Legal Review', status: 'completed', date: null },
          { name: 'Reject', status: 'completed', date: null }
        ]
        break
      
      case 'Expired':
        steps = [
          { 
            name: 'Submit', 
            status: 'completed', 
            date: displayContract.created_at 
          },
          { 
            name: 'Legal Review', 
            status: 'completed', 
            date: null 
          },
          { 
            name: 'Active', 
            status: 'completed', 
            date: displayContract.start_date || displayContract.created_at 
          },
          { 
            name: 'Expired', 
            status: 'completed', 
            date: displayContract.end_date 
          }
        ]
        break
      
      default:
        steps = [
          { name: 'Submit', status: 'pending', date: null },
          { name: 'Legal Review', status: 'pending', date: null },
          { name: 'Active', status: 'pending', date: null }
        ]
        break
    }

    return steps
  }

  const formatValue = (value: number | null) => {
    if (!value) return 'Rp 0'
    return `Rp ${value.toLocaleString('id-ID')}`
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  const progressSteps = getProgressSteps()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{displayContract.name || 'Untitled Contract'}</h1>
            <p className="text-sm text-gray-500">Contract ID: #{displayContract.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <button
            onClick={() => navigate('/procurement/status')}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft size={16} />
            Back to Status Tracking
          </button>
        </div>

        {/* Contract Overview */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Contract Info */}
          <div className="space-y-6">
            {/* Parties */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Contract Parties</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Pihak Pertama</p>
                    <p className="text-sm text-gray-600">{displayContract.first_party || 'PT ILCS'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Pihak Kedua</p>
                    <p className="text-sm text-gray-600">{displayContract.second_party || 'PT Teknologi Maju Indonesia'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contract Details */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Contract Details</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Nilai Kontrak</p>
                    <p className="text-sm text-gray-600">{formatValue(displayContract.value_rp)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Durasi Kontrak</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(displayContract.start_date)} - {formatDate(displayContract.end_date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Info className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Status Saat Ini</p>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(displayContract.status)}`}>
                      {displayContract.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Progress & Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Status */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-6 text-lg font-semibold text-gray-900">Progress Status</h3>
              <div className="space-y-4">
                {progressSteps.map((step) => (
                  <div key={step.name} className="flex items-start gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0 ${
                      step.name === 'Expired' ? 'bg-red-500' :
                      step.status === 'completed' ? 'bg-green-500' :
                      step.status === 'current' ? 'bg-blue-500' : 'bg-gray-300'
                    }`}>
                      {step.status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-white" />
                      ) : step.status === 'current' ? (
                        <Clock className="h-5 w-5 text-white" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">{step.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          step.name === 'Expired' ? 'bg-red-100 text-red-700' :
                          step.status === 'completed' ? 'bg-green-100 text-green-700' :
                          step.status === 'current' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {step.status}
                        </span>
                      </div>
                      {step.date && (
                        <p className="text-xs text-gray-500 mt-1">
                          {step.name === 'Submit' ? 'Submitted: ' : 
                           step.name === 'Active' ? 'Activated: ' : 
                           step.name === 'Expired' ? 'Expired: ' :
                           'Started: '}{formatDate(step.date)}
                          {typeof step === 'object' && 'duration' in step && typeof step.duration === 'number' && ` • Duration: ${step.duration} days`}
                        </p>
                      )}
                      {typeof step === 'object' && 'notes' in step && typeof step.notes === 'string' && step.notes && (
                        <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded p-2">
                          {step.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                
                {progressSteps.length === 0 && (
                  <div className="text-center py-8">
                    <Clock className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-500 mt-2">No lifecycle data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Legal Feedback */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Legal Feedback</h3>
                <span className="text-sm text-gray-500">{legalNotes.length} notes</span>
              </div>
              
              {/* Notes List - Read Only untuk Procurement */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {legalNotes.map((note) => (
                  <div key={note.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                        {note.author || 'Legal Officer'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {note.created_at ? new Date(note.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Just now'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {note.note}
                    </p>
                  </div>
                ))}
                
                {legalNotes.length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-500 mt-2">No legal feedback yet</p>
                    <p className="text-xs text-gray-400">Legal team will add review notes here once the contract is submitted</p>
                  </div>
                )}
              </div>
              
              {/* Info untuk Procurement User */}
              {legalNotes.length === 0 && displayContract.status === 'Draft' && (
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-900">Waiting for Legal Review</span>
                  </div>
                  <p className="text-sm text-amber-800 mt-1">
                    Submit the contract to legal team to get feedback and review notes.
                  </p>
                </div>
              )}
            </div>

            {/* Uploaded Document */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Contract Document</h3>
              
              {displayContract.file_url ? (
                <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {displayContract.name || 'Contract Document'}.pdf
                    </p>
                    <p className="text-sm text-gray-500">
                      Uploaded {displayContract.created_at ? formatDate(displayContract.created_at) : 'recently'}
                      {contractDetails?.contract_entities?.[0]?.analyzed_at && (
                        <> • Last analyzed: {formatDate(contractDetails.contract_entities[0].analyzed_at)}</>
                      )}
                    </p>
                    {contractDetails?.contract_entities?.[0]?.initial_risk && (
                      <p className="text-xs text-gray-400 mt-1">
                        Initial Risk Level: {contractDetails.contract_entities[0].initial_risk}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => window.open(displayContract.file_url!, '_blank')}
                      className="flex items-center gap-2 rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600"
                    >
                      <Download size={16} />
                      Download
                    </button>
                    <button 
                      onClick={() => window.open(displayContract.file_url!, '_blank')}
                      className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Eye size={16} />
                      View
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <h4 className="mt-4 text-lg font-medium text-gray-900">No document uploaded</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Upload a contract document to get started with analysis
                  </p>
                  <button className="mt-4 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600">
                    Upload Document
                  </button>
                </div>
              )}

              {/* AI Analysis Summary */}
              {contractDetails?.ai_risk_analysis && contractDetails.ai_risk_analysis.length > 0 && (
                <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">AI Risk Analysis</span>
                  </div>
                  <div className="text-sm text-blue-800">
                    <p>Risk Level: <span className="font-medium">{contractDetails.ai_risk_analysis[0].risk_level}</span></p>
                    <p>Confidence: <span className="font-medium">{(contractDetails.ai_risk_analysis[0].confidence * 100).toFixed(1)}%</span></p>
                    <p className="text-xs text-blue-600 mt-1">
                      Analyzed {formatDate(contractDetails.ai_risk_analysis[0].analyzed_at)} using {contractDetails.ai_risk_analysis[0].model_used}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              {displayContract.status === 'Revision Requested' && (
                <button 
                  onClick={() => setShowUploadModal(true)}
                  disabled={uploadingRevision}
                  className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:bg-gray-400"
                >
                  <Upload size={16} />
                  {uploadingRevision ? 'Uploading...' : 'Upload Revisi Kontrak'}
                </button>
              )}
              
              {displayContract.status === 'Draft' && (userRole === 'procurement' || userRole === 'management') && (
                <button 
                  onClick={() => setShowUploadModal(true)}
                  disabled={uploadingRevision}
                  className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:bg-gray-400"
                >
                  <Upload size={16} />
                  {uploadingRevision ? 'Uploading...' : 'Upload Contract Document'}
                </button>
              )}

              {/* Additional upload button for authorized users on any status */}
              {(displayContract.status !== 'Revision Requested' && displayContract.status !== 'Draft') && 
               (userRole === 'procurement' || userRole === 'management') && (
                <button 
                  onClick={() => setShowUploadModal(true)}
                  disabled={uploadingRevision}
                  className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:bg-gray-400"
                >
                  <Upload size={16} />
                  {uploadingRevision ? 'Uploading...' : 'Upload New Version'}
                </button>
              )}
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {displayContract.status === 'Revision Requested' ? 'Upload Revised Contract' : 'Upload Contract Document'}
                  </h3>
                  
                  <div className="space-y-4">
                    {/* File Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select File (PDF or Word)
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileSelect}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                    
                    {/* Selected File Info */}
                    {revisionFile && (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{revisionFile.name}</p>
                            <p className="text-xs text-gray-500">
                              {(revisionFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Processing Info */}
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                      <p className="text-sm text-blue-800">
                        <strong>What happens next:</strong>
                      </p>
                      <ul className="text-xs text-blue-700 mt-2 space-y-1">
                        <li>• File will be uploaded to secure storage</li>
                        <li>• AI will extract contract details automatically</li>
                        <li>• Risk analysis will be performed</li>
                        <li>• Contract status will be updated</li>
                      </ul>
                    </div>
                  </div>
                  
                  {/* Modal Actions */}
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => {
                        setShowUploadModal(false)
                        setRevisionFile(null)
                      }}
                      disabled={uploadingRevision}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUploadRevision}
                      disabled={!revisionFile || uploadingRevision}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 flex items-center gap-2"
                    >
                      {uploadingRevision ? (
                        <>
                          <Clock className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Upload size={16} />
                          Upload & Analyze
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
