"use client"
import { useState, useMemo } from 'react'
import type { ChangeEvent } from 'react'
import Card from '@/components/Card'
import { useContracts } from '@/hooks/useContracts'
import ContractListLegal from '@/components/Legal/ContractListLegal'

const STATUS = ['All', 'Submitted', 'Reviewed', 'Approved'] as const
const RISK = ['All', 'Low', 'Medium', 'High'] as const

type StatusFilter = typeof STATUS[number]
type RiskFilter = typeof RISK[number]

export default function LegalInbox() {
  const [status, setStatus] = useState<StatusFilter>('All')
  const [risk, setRisk] = useState<RiskFilter>('All')
  const { items } = useContracts({ status, risk })

  const contractsMapped = useMemo(
    () =>
      (items ?? [])
        .filter((c: any) => {
          const status = c.status?.toLowerCase() || ''
          return status !== 'reviewed' && status !== 'revision requested'
        })
        .map((c: any) => ({
          id: String(c.id),
          name: c.name ?? c.title ?? 'Untitled',
          party: [c.first_party, c.second_party].filter(Boolean).join(' - ') || '-',
          value:
            typeof c.value_rp === 'number'
              ? `Rp ${Number(c.value_rp).toLocaleString('id-ID')}`
              : (c.value ?? '-'),
          risk: c.risk ?? c.risk_level ?? 'Low',
        })),
    [items]
  )

  return (
    <div className="grid gap-6">
      <div className='flex flex-col mb-4 space-y-5'>
        <div className="text-3xl font-bold">
          Contract Inbox
        </div>
        <div className='text-sm text-gray-600'>
          Manage and review incoming contracts
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <Select label="Status :" value={status} options={STATUS} onChange={(e) => setStatus(e.target.value as StatusFilter)} />
          <Select label="Risk :" value={risk} options={RISK} onChange={(e) => setRisk(e.target.value as RiskFilter)} />
        </div>
      </Card>

      <ContractListLegal
        variant="inbox"
        contracts={contractsMapped}
      />
    </div>
  )
}

function Select<T extends readonly string[]>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: T
  value: T[number]
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-[#374151]">{label}</span>
      <select className="rounded-lg border px-2 py-1" value={value} onChange={onChange}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  )
}
