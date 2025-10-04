"use client"
import { useEffect, useMemo, useState } from 'react'
import supabase from '@/utils/supabase'

// Tipe data untuk setiap item risiko
type Finding = {
  id: string
  level: 'High' | 'Medium' | 'Low'
  title: string        // contoh: section/pasal
  description: string  // contoh: judul/temuan ringkas
}

function normalizeLevel(v: unknown): Finding['level'] {
  const s = String(v ?? '').toLowerCase()
  if (s === 'high') return 'High'
  if (s === 'medium') return 'Medium'
  if (s === 'low') return 'Low'
  return 'Low'
}

// Sub-komponen item
function RiskItem({ finding }: { finding: Finding }) {
  const styles = {
    High: { bar: 'bg-red-500', title: 'text-red-600', badge: 'bg-red-100 text-red-700' },
    Medium: { bar: 'bg-amber-400', title: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
    Low: { bar: 'bg-emerald-500', title: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
  } as const
  const s = styles[finding.level] ?? styles.Low

  return (
    <div className="flex items-stretch overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className={`w-1.5 flex-shrink-0 ${s.bar}`} />
      <div className="flex flex-grow items-center justify-between p-4">
        <div>
          <h4 className={`font-bold ${s.title}`}>{finding.title}</h4>
          <p className="mt-1 text-sm text-gray-600">{finding.description}</p>
        </div>
        <span className={`ml-4 flex-shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold ${s.badge}`}>
          {finding.level.toUpperCase()}
        </span>
      </div>
    </div>
  )
}

// Props opsional: jika findings tidak diberikan, komponen akan fetch kontrak & temuan terbaru sendiri
export default function RiskRadar({ findings, contractId }: { findings?: Finding[]; contractId?: string }) {
  const [autoFindings, setAutoFindings] = useState<Finding[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (findings && findings.length > 0) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        // 1) Tentukan kontrak target: pakai contractId jika disediakan, atau ambil kontrak terbaru yang belum reviewed
        let targetId = contractId ?? null
        if (!targetId) {
          const { data: latestList, error: cErr } = await supabase
            .from('contracts')
            .select('id')
            .neq('status', 'Reviewed') // Exclude reviewed contracts
            .order('created_at', { ascending: false })
            .limit(1)
          if (cErr) {
            console.error('Error fetching latest contract:', cErr)
            throw cErr
          }
          targetId = latestList?.[0]?.id ?? null
        }

        if (!targetId) {
          if (!cancelled) setAutoFindings([])
          return
        }

        // 2) Ambil temuan risiko untuk kontrak tersebut
        const { data: rf, error: rErr } = await supabase
          .from('risk_findings')
          .select('id, level, title, section, created_at')
          .eq('contract_id', targetId)
          .order('created_at', { ascending: false })
          .limit(10)
        
        if (rErr) {
          console.error('Error fetching risk findings:', rErr)
          // Don't throw - just show empty state
          if (!cancelled) setAutoFindings([])
          return
        }

        const mapped = (rf ?? []).map((row: any): Finding => ({
          id: String(row.id),
          level: normalizeLevel(row.level),
          title: row.section ?? 'Unknown Section',
          description: row.title ?? '-',
        }))

        if (!cancelled) setAutoFindings(mapped)
      } catch (e) {
        console.error('RiskRadar fetch error:', e)
        if (!cancelled) setAutoFindings([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [findings, contractId])

  const dataToShow = useMemo(() => findings ?? autoFindings, [findings, autoFindings])

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm h-fit max-h-96 overflow-y-auto">
      <h2 className="text-lg font-bold text-gray-900">Risk Radar</h2>
      <p className="text-sm text-gray-500">High-risk clauses detected by AI</p>

      {loading ? (
        <p className="mt-4 text-sm text-gray-500">Loading latest risks…</p>
      ) : dataToShow.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">No risks have been identified.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {dataToShow.map((f) => (
            <RiskItem key={f.id} finding={f} />
          ))}
        </div>
      )}
    </div>
  )
}