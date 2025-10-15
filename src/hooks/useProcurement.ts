"use client"
import { useCallback, useEffect, useMemo, useState } from 'react'
import supabase from '@/utils/supabase'
import { useAuth } from '@/auth/AuthProvider'
import type { ContractRow, ProcurementKPI, Status, Risk } from '@/types/procurement'

export function useProcurementKPI() {
  const [kpi, setKpi] = useState<ProcurementKPI | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        
        // Get current user's company ID
        const { data: userData } = await supabase.auth.getUser()
        const userId = userData.user?.id
        
        if (!userId) {
          console.warn('User not authenticated')
          setLoading(false)
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', userId)
          .single()

        const companyId = profile?.company_id
        
        if (!companyId) {
          console.warn('User not associated with any company')
          setLoading(false)
          return
        }

        // Calculate KPI from contracts filtered by company_id
        const now = new Date()
        const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

        // Fetch all contracts for this company
        const { data: allContracts } = await supabase
          .from('contracts')
          .select('status, created_at')
          .eq('company_id', companyId)

        if (!allContracts) {
          setKpi({
            new_this_month: 0,
            new_last_month: 0,
            submitted_contracts: 0,
            active_contracts: 0,
            expired_contracts: 0
          })
          setLoading(false)
          return
        }

        // Count by status (case-insensitive)
        const submitted = allContracts.filter(c => 
          c.status?.toLowerCase() === 'submitted'
        ).length

        const active = allContracts.filter(c => 
          c.status?.toLowerCase() === 'active' || c.status?.toLowerCase() === 'approved'
        ).length

        const expired = allContracts.filter(c => 
          c.status?.toLowerCase() === 'expired'
        ).length

        // Count new contracts this month and last month
        const newThisMonth = allContracts.filter(c => 
          new Date(c.created_at) >= firstDayThisMonth
        ).length

        const newLastMonth = allContracts.filter(c => {
          const createdDate = new Date(c.created_at)
          return createdDate >= firstDayLastMonth && createdDate < firstDayThisMonth
        }).length

        setKpi({
          new_this_month: newThisMonth,
          new_last_month: newLastMonth,
          submitted_contracts: submitted,
          active_contracts: active,
          expired_contracts: expired
        })
      } catch (error) {
        console.error('Error fetching procurement KPI:', error)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const deltaPct = useMemo(() => {
    if (!kpi) return 0
    const { new_this_month, new_last_month } = kpi
    if (!new_last_month) return 100
    return Math.round(((new_this_month - new_last_month) / new_last_month) * 100)
  }, [kpi])

  return { kpi, deltaPct, loading }
}

export function useContractsList() {
  const [rows, setRows] = useState<ContractRow[]>([])
  const [loading, setLoading] = useState(true)

  const checkAndUpdateExpiredContracts = async (contracts: ContractRow[], companyId: string) => {
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
          .eq('company_id', companyId)
        
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
    try {
      setLoading(true)
      
      // Get current user's company ID
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id
      
      if (!userId) {
        console.warn('User not authenticated')
        setRows([])
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', userId)
        .single()

      const companyId = profile?.company_id
      
      if (!companyId) {
        console.warn('User not associated with any company')
        setRows([])
        setLoading(false)
        return
      }

      // Fetch contracts filtered by company_id
      const { data } = await supabase
        .from('contracts')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
      
      const contracts = (data ?? []) as ContractRow[]
      
      // Check and update expired contracts
      await checkAndUpdateExpiredContracts(contracts, companyId)
      
      // Fetch updated data after potential status changes
      const { data: updatedData } = await supabase
        .from('contracts')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
      
      setRows((updatedData ?? []) as ContractRow[])
    } catch (error) {
      console.error('Error fetching contracts:', error)
      setRows([])
    } finally {
      setLoading(false)
    }
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
