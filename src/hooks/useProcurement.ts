"use client"
import { useCallback, useEffect, useMemo, useState } from 'react'
import supabase from '@/utils/supabase'
import { useAuth } from '@/auth/AuthProvider'
import type { ContractRow, ProcurementKPI, Status, Risk } from '@/types/procurement'

export function useProcurementKPI() {
  const [kpi, setKpi] = useState<ProcurementKPI | null>(null)

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.from('procurement_kpi').select('*').single()
      setKpi(data as ProcurementKPI)
    })()
  }, [])

  const deltaPct = useMemo(() => {
    if (!kpi) return 0
    const { new_this_month, new_last_month } = kpi
    if (!new_last_month) return 100
    return Math.round(((new_this_month - new_last_month) / new_last_month) * 100)
  }, [kpi])

  return { kpi, deltaPct }
}

export function useContractsList() {
  const [rows, setRows] = useState<ContractRow[]>([])
  const [loading, setLoading] = useState(true)

  const checkAndUpdateExpiredContracts = async (contracts: ContractRow[]) => {
    const currentDate = new Date()
    const expiredContracts: string[] = []
    
    // Find contracts that should be expired
    contracts.forEach(contract => {
      if (contract.end_date && (contract.status === 'Active' || contract.status === 'Approved')) {
        const endDate = new Date(contract.end_date)
        if (currentDate > endDate) {
          expiredContracts.push(contract.id)
        }
      }
    })
    
    // Update expired contracts in batch
    if (expiredContracts.length > 0) {
      try {
        const { error } = await supabase
          .from('contracts')
          .update({ status: 'Expired' })
          .in('id', expiredContracts)
        
        if (error) {
          console.warn('Failed to update expired contracts:', error)
        } else {
          console.log(`Updated ${expiredContracts.length} expired contracts`)
        }
      } catch (error) {
        console.warn('Error updating expired contracts:', error)
      }
    }
  }

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('contracts').select('*').order('created_at', { ascending: false })
    const contracts = (data ?? []) as ContractRow[]
    
    // Check and update expired contracts
    await checkAndUpdateExpiredContracts(contracts)
    
    // Fetch updated data after potential status changes
    const { data: updatedData } = await supabase.from('contracts').select('*').order('created_at', { ascending: false })
    setRows((updatedData ?? []) as ContractRow[])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAll()
    const ch = supabase
      .channel('contracts-procurement')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contracts' }, fetchAll)
      .subscribe()
    return () => {
      supabase.removeChannel(ch)
    }
  }, [fetchAll])

  return { rows, loading }
}

export function useCreateContract() {
  const { session } = useAuth()
  const create = useCallback(async (payload: Partial<ContractRow>) => {
    const { error } = await supabase.from('contracts').insert([
      {
        name: payload.name,
        first_party: payload.first_party,
        second_party: payload.second_party,
        value_rp: payload.value_rp ?? null,
        duration_months: payload.duration_months ?? null,
        start_date: payload.start_date ?? null,
        end_date: payload.end_date ?? null,
        status: (payload.status as Status) ?? 'Draft',
        risk: null,
        created_by: session?.user?.id ?? payload.created_by ?? null,
      },
    ])
    if (error) throw error
  }, [session?.user?.id])

  return { create }
}

export function useUpdateContract() {
  const update = useCallback(async (id: string, patch: Partial<ContractRow>) => {
    const { error } = await supabase.from('contracts').update(patch).eq('id', id)
    if (error) throw error
  }, [])

  return { update }
}

export type StatusFilter = 'All' | 'Pending Review' | 'Approved' | 'Revision Requested' | 'Draft' | 'Active' | 'Expired'
export type RiskFilter = 'All' | Risk

export function useStatusFiltering(source: ContractRow[]) {
  const [status, setStatus] = useState<StatusFilter>('All')
  const [risk, setRisk] = useState<RiskFilter>('All')
  const [q, setQ] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const filtered = useMemo(() => {
    return source
      .filter((r) => (status === 'All' ? true : r.status === status))
      .filter((r) => (risk === 'All' ? true : r.risk === risk))
      .filter((r) =>
        q
          ? r.name?.toLowerCase().includes(q.toLowerCase()) || (r.second_party ?? '').toLowerCase().includes(q.toLowerCase())
          : true,
      )
      .filter((r) => (from ? new Date(r.created_at) >= new Date(from) : true))
      .filter((r) => (to ? new Date(r.created_at) <= new Date(to) : true))
  }, [source, status, risk, q, from, to])

  return { status, setStatus, risk, setRisk, q, setQ, from, setFrom, to, setTo, filtered }
}
