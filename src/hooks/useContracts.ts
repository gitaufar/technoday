"use client"
import { useEffect, useState, useCallback } from 'react'
import supabase from '@/utils/supabase'
import LegalService from '@/services/legalService'
import type { Contract, LegalKPI, ContractEntity, RiskFinding, LegalNote } from '@/types/db'

export function useLegalKPI() {
  const [kpi, setKpi] = useState<LegalKPI | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchKPI = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const kpiData = await LegalService.getLegalKPI()
      setKpi(kpiData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch KPI')
      console.error('Error fetching legal KPI:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchKPI()
    
    // Set up real-time subscription for KPI updates
    const channel = LegalService.subscribeToLegalUpdates(
      () => fetchKPI(), // Refresh KPI when contracts change
      () => fetchKPI(), // Refresh KPI when risk findings change
      () => fetchKPI()  // Refresh KPI when notes change
    )

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchKPI])

  return { kpi, loading, error, refresh: fetchKPI }
}

export function useContracts(filter?: { status?: string; risk?: string }) {
  const [items, setItems] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      let query = supabase.from('contracts').select('*').order('created_at', { ascending: false })
      
      if (filter?.status && filter.status !== 'All') {
        query = query.eq('status', filter.status)
      }
      if (filter?.risk && filter.risk !== 'All') {
        query = query.eq('risk', filter.risk)
      }

      const { data, error: queryError } = await query
      
      if (queryError) {
        setError(queryError.message)
        console.error('Error fetching contracts:', queryError)
      } else {
        setItems((data ?? []) as Contract[])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contracts')
      console.error('Error fetching contracts:', err)
    } finally {
      setLoading(false)
    }
  }, [filter?.risk, filter?.status])

  useEffect(() => {
    fetchAll()
    
    // Set up real-time subscription
    const ch = supabase
      .channel('contracts-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contracts' }, fetchAll)
      .subscribe()
      
    return () => {
      supabase.removeChannel(ch)
    }
  }, [fetchAll])

  const updateStatus = useCallback(async (id: string, status: Contract['status']) => {
    try {
      await LegalService.updateContractStatus(id, status)
      // Real-time subscription akan handle update otomatis
    } catch (err) {
      console.error('Error updating contract status:', err)
      throw err
    }
  }, [])

  const setRisk = useCallback(async (id: string, risk: Contract['risk']) => {
    try {
      await LegalService.updateContractRisk(id, risk)
      // Real-time subscription akan handle update otomatis
    } catch (err) {
      console.error('Error updating contract risk:', err)
      throw err
    }
  }, [])

  return { items, loading, error, updateStatus, setRisk, refresh: fetchAll }
}

export function useAnalyzer(contractId?: string) {
  const [entities, setEntities] = useState<ContractEntity | null>(null)
  const [findings, setFindings] = useState<RiskFinding[]>([])
  const [notes, setNotes] = useState<LegalNote[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!contractId) {
      setEntities(null)
      setFindings([])
      setNotes([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const analysis = await LegalService.getContractAnalysis(contractId)
      setEntities(analysis.entities)
      setFindings(analysis.findings)
      setNotes(analysis.notes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contract analysis')
      console.error('Error fetching contract analysis:', err)
    } finally {
      setLoading(false)
    }
  }, [contractId])

  useEffect(() => {
    refresh()
    
    if (!contractId) return

    // Set up real-time subscriptions for this specific contract
    const ch = supabase
      .channel(`legal-${contractId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contract_entities', filter: `contract_id=eq.${contractId}` },
        refresh,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'risk_findings', filter: `contract_id=eq.${contractId}` },
        refresh,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'legal_notes', filter: `contract_id=eq.${contractId}` },
        refresh,
      )
      .subscribe()

    return () => {
      supabase.removeChannel(ch)
    }
  }, [contractId, refresh])

  const runAnalysis = useCallback(
    async (id: string, seed?: Partial<ContractEntity>) => {
      try {
        await LegalService.runContractAnalysis(id, seed)
        // Real-time subscription akan handle refresh otomatis
      } catch (err) {
        console.error('Error running analysis:', err)
        throw err
      }
    },
    []
  )

  const addNote = useCallback(
    async (id: string, note: string, author?: string) => {
      try {
        await LegalService.addLegalNote(id, note, author)
        // Real-time subscription akan handle refresh otomatis  
      } catch (err) {
        console.error('Error adding note:', err)
        throw err
      }
    },
    []
  )

  return { entities, findings, notes, loading, error, runAnalysis, addNote, refresh }
}
