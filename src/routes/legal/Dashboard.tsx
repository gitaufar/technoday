"use client"
import { useMemo } from 'react'
import { useContracts, useLegalKPI } from '@/hooks/useContracts'
import ContractListLegal from '@/components/Legal/ContractListLegal'
import CardDashboard from '@/components/Legal/CardDashboard'
import { FileText, AlertTriangle, Clock, RefreshCw } from 'lucide-react'
import RiskRadar from '@/components/Legal/RiskRadar'
import AIContract from '@/components/Legal/AIContract'

export default function LegalDashboard() {
  const { error: kpiError, refresh: refreshKPI } = useLegalKPI()
  const { items, error: contractsError } = useContracts()

  // Removed latest since RiskRadar now auto-fetches latest contract

  // Loading state removed since components fetch independently

  // Error handling
  if (kpiError || contractsError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">{kpiError || contractsError}</p>
          <button
            onClick={refreshKPI}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  const contractsMapped = useMemo(
    () =>
      (items ?? [])
        .filter((it: any) => it.status !== 'Reviewed') // Filter out reviewed contracts
        .slice(0, 10)
        .map((it: any) => {
          // Safeguard format nilai dari numeric Supabase (string) atau number
          const raw = it?.value_rp ?? it?.value
          const num =
            typeof raw === 'number'
              ? raw
              : typeof raw === 'string' && raw.trim() !== '' && !Number.isNaN(Number(raw))
              ? Number(raw)
              : null
          return {
            id: String(it.id),
            name: it.name ?? it.title ?? 'Untitled',
            party: [it.first_party, it.second_party].filter(Boolean).join(' → ') || it.party || it.counterparty || '-',
            value: num !== null ? `Rp ${num.toLocaleString('id-ID')}` : (raw ?? '-'),
            risk: it.risk ?? it.risk_level ?? 'low',
          }
        }),
    [items]
  )

  // Calculate real-time KPI from filtered contracts
  const realTimeKPI = useMemo(() => {
    const activeContracts = (items ?? []).filter((it: any) => it.status !== 'Reviewed')
    const thisWeekStart = new Date()
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay()) // Start of week
    
    return {
      contracts_this_week: activeContracts.filter((it: any) => {
        const createdAt = new Date(it.created_at)
        return createdAt >= thisWeekStart
      }).length,
      high_risk: activeContracts.filter((it: any) => {
        const risk = (it.risk ?? it.risk_level ?? '').toLowerCase()
        return risk === 'high'
      }).length,
      pending_ai: activeContracts.filter((it: any) => {
        const status = (it.status ?? '').toLowerCase()
        return status === 'draft' || status === 'pending' || status === 'on review' || status === 'revision requested'
      }).length
    }
  }, [items])

  return (
    <div className="grid gap-6">

      <div className="grid gap-4 md:grid-cols-3">
        <CardDashboard title="Contract This Week" value={realTimeKPI?.contracts_this_week ?? 0} right={<FileText className="h-5 w-5 text-blue-600" />} />
        <CardDashboard title="High Risk Contracts" value={realTimeKPI?.high_risk ?? 0} right={<AlertTriangle className="h-5 w-5 text-red-600" />} />
        <CardDashboard title="Pending Review" value={realTimeKPI?.pending_ai ?? 0} right={<Clock className="h-5 w-5 text-amber-600" />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-4">
        <ContractListLegal variant="dashboard" contracts={contractsMapped} />

        <div className="space-y-4">
          {/* AIContract otomatis ambil kontrak terbaru */}
          <AIContract />

          {/* RiskRadar diarahkan ke kontrak terbaru secara eksplisit */}
          <div className="max-h-96">
            <RiskRadar />
          </div>
        </div>
      </div>
    </div>
  )
}