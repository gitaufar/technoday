"use client"
import { useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import Card from '@/components/Card'
import { useContracts } from '@/hooks/useContracts'
import { AlertTriangle, AlertCircle, Info, RefreshCw } from 'lucide-react'
import CardDashboard from '@/components/Legal/CardDashboard'
import ContractListLegal from '@/components/Legal/ContractListLegal'

export default function LegalRiskCenter() {
  const [fltRisk, setFltRisk] = useState<'Low' | 'Medium' | 'High' | 'All'>('All')
  const [fltStatus, setFltStatus] = useState<'Pending Review' | 'Reviewed' | 'Revision Requested' | 'All'>('All')

  // Use filters in the hook for better performance
  const contractFilter = useMemo(() => ({
    risk: fltRisk !== 'All' ? fltRisk.toLowerCase() : undefined,
    status: fltStatus !== 'All' ? fltStatus : undefined
  }), [fltRisk, fltStatus])

  const { items, error, refresh } = useContracts(contractFilter)

  // Filter out reviewed/revision requested contracts and calculate risk distribution
  const activeItems = useMemo(() => {
    return items.filter((i: any) => {
      const status = i.status?.toLowerCase() || ''
      return status !== 'reviewed' && status !== 'revision requested'
    })
  }, [items])

  const riskDistribution = useMemo(() => {
    const high = activeItems.filter((i) => i.risk === 'High').length
    const medium = activeItems.filter((i) => i.risk === 'Medium').length  
    const low = activeItems.filter((i) => i.risk === 'Low').length
    return { high, medium, low, total: activeItems.length }
  }, [activeItems])

  // Sort by value (highest first) using active items only
  const sortedItems = useMemo(() => {
    return [...activeItems].sort((a, b) => Number(b.value_rp || 0) - Number(a.value_rp || 0))
  }, [activeItems])

  const contractsMapped = useMemo(
    () =>
      sortedItems.map((c: any) => ({
        id: String(c.id),
        name: c.name ?? c.title ?? 'Untitled',
        party: [c.first_party, c.second_party].filter(Boolean).join(' → ') || c.party || c.counterparty || '-',
        risk: c.risk ?? c.risk_level ?? 'low',
        clause: c.clause ?? c.clause_text ?? c.issue ?? 'Various risk factors identified',
        section: c.section ?? c.clause_number ?? 'Multiple sections',
        status: c.status ?? c.review_status ?? 'Pending Review',
        value: c.value_rp ? `Rp ${Number(c.value_rp).toLocaleString('id-ID')}` : '-'
      })),
    [sortedItems]
  )

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Risk Center</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refresh}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-row items-center justify-between mb-4">
      {/* Bagian Kiri: Judul dan Subjudul */}
      <div>
        <div className="text-3xl font-bold">
          Risk Center
        </div>
        <div className='text-sm text-gray-600'>
          Monitor and manage contract clauses with potential risks
        </div>
      </div>

      {/* Bagian Kanan: Tombol Export */}
      {/* 
<div>
  <ButtonBlue
    text="Export Report"
    onClick={() => exportReport()}
    iconRight={<Download size={16} />} // 2. Tambahkan ikon di sini
  />
</div>
*/}

    </div>


      <div className="grid gap-4 md:grid-cols-3">
        <CardDashboard
          title="High Risk Clauses"
          value={riskDistribution.high}
          right={<AlertTriangle className="h-5 w-5 text-red-600" />}
        />
        <CardDashboard
          title="Medium Risk Clauses"
          value={riskDistribution.medium}
          right={<AlertCircle className="h-5 w-5 text-amber-600" />}
        />
        <CardDashboard
          title="Low Risk Clauses"
          value={riskDistribution.low}
          right={<Info className="h-5 w-5 text-blue-600" />}
        />
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <Select
            label="Risk Level:"
            value={fltRisk}
            onChange={(e) => setFltRisk(e.target.value as typeof fltRisk)}
            options={['All', 'Low', 'Medium', 'High']}
          />
          <Select
            label="Status:"
            value={fltStatus}
            onChange={(e) => setFltStatus(e.target.value as typeof fltStatus)}
            options={['All', 'Pending Review', 'Reviewed', 'Revision Requested']}
          />
          <div className="text-sm text-gray-600">
            Showing {contractsMapped.length} of {riskDistribution.total} contracts
          </div>
        </div>
      </Card>

      <ContractListLegal
        variant="riskCenter"
        contracts={contractsMapped}
      />
    </div>
  )
}

function Select({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly any[]
  value: any
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-gray-600">{label}</span>
      <select className="rounded-lg border px-2 py-1" value={value} onChange={onChange}>
        {options.map((o: any) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  )
}
