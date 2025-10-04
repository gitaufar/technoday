"use client"
import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import supabase from '@/utils/supabase'
import { ShieldCheck, FileDown } from 'lucide-react'

type Contract = {
  id: string
  name: string | null
  first_party: string | null
  second_party: string | null
  value_rp: string | number | null
  duration_months: number | null
  risk: 'High' | 'Medium' | 'Low' | null
  file_url: string | null
  created_at: string
}

type ContractEntities = {
  id: number
  contract_id: string
  first_party: string | null
  second_party: string | null
  value_rp: string | number | null
  duration_months: number | null
  penalty: string | null
  analyzed_at: string | null
}

function EntityItem({ label, value, className }: { label: string; value: ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg bg-gray-50 p-4 ${className || ''}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-gray-900">{value}</p>
    </div>
  )
}

function formatCurrencyID(v: unknown) {
  const n =
    typeof v === 'number'
      ? v
      : typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))
      ? Number(v)
      : 0
  return `Rp ${n.toLocaleString('id-ID')}`
}

export default function AIContract() {
  const [latestContract, setLatestContract] = useState<Contract | null>(null)
  const [entities, setEntities] = useState<ContractEntities | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      // 1) Ambil kontrak terbaru
      const { data: contract, error: cErr } = await supabase
        .from('contracts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (cErr) {
        console.error('Error fetching latest contract:', cErr)
        setLoading(false)
        return
      }
      setLatestContract(contract as Contract)

      // 2) Ambil entitas hasil analisis (jika ada) untuk kontrak tersebut
      if (contract?.id) {
        const { data: ents, error: eErr } = await supabase
          .from('contract_entities')
          .select('*')
          .eq('contract_id', contract.id)
          .order('analyzed_at', { ascending: false })
          .limit(1)

        if (eErr) {
          console.error('Error fetching contract entities:', eErr)
        } else if (ents && ents.length > 0) {
          setEntities(ents[0] as ContractEntities)
        }
      }

      setLoading(false)
    })()
  }, [])

  if (loading) {
    return <div className="rounded-xl border bg-white p-6 shadow-sm">Loading latest contract...</div>
  }

  if (!latestContract) {
    return <div className="rounded-xl border bg-white p-6 shadow-sm">No contract data found.</div>
  }

  const firstParty = entities?.first_party ?? latestContract.first_party ?? '-'
  const secondParty = entities?.second_party ?? latestContract.second_party ?? '-'
  const valueDisplay = formatCurrencyID(entities?.value_rp ?? latestContract.value_rp)
  const durationDisplay =
    (entities?.duration_months ?? latestContract.duration_months) != null
      ? `${entities?.duration_months ?? latestContract.duration_months} Bulan`
      : '-'
  const penalty = entities?.penalty ?? '-'
  const riskLabel = latestContract.risk ?? 'Low'

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">AI Contract Analyzer</h1>
          <p className="text-sm text-gray-500">Automated Contract Entity Extraction</p>
        </div>
        {latestContract.file_url && (
          <a
            href={latestContract.file_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
          >
            <FileDown className="h-4 w-4" /> PDF
          </a>
        )}
      </div>

      <hr className="my-4" />

      <div className="grid grid-cols-2 gap-4">
        <EntityItem label="Pihak Pertama" value={firstParty} />
        <EntityItem label="Pihak Kedua" value={secondParty} />
        <EntityItem label="Nilai Kontrak" value={valueDisplay} />
        <EntityItem label="Durasi" value={durationDisplay} />
        <EntityItem label="Denda/Penalty" value={penalty} className="col-span-2" />

        <div className="col-span-2 flex items-center gap-3 rounded-lg bg-blue-50 p-4">
          <ShieldCheck size={20} className="text-blue-600" />
          <p className="font-bold text-blue-800">Risk Level: {riskLabel}</p>
        </div>
      </div>
    </div>
  )
}