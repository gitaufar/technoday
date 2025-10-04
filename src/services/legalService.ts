// Legal Service untuk Dashboard Legal - Integrasi dengan Supabase
// File: src/services/legalService.ts

import supabase from '../utils/supabase';
import { withAuthCheck } from '../utils/authHelper';
import type { Contract, ContractEntity, RiskFinding, LegalNote, LegalKPI } from '../types/db';

export interface LegalDashboardData {
  kpi: LegalKPI;
  recentContracts: Contract[];
  highRiskContracts: Contract[];
  pendingReviews: Contract[];
}

export interface ContractAnalysis {
  entities: ContractEntity | null;
  findings: RiskFinding[];
  notes: LegalNote[];
}

export interface RiskCenterData {
  totalContracts: number;
  riskDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  contracts: Contract[];
}

export class LegalService {
  /**
   * Get KPI data untuk legal dashboard
   */
  static async getLegalKPI(): Promise<LegalKPI> {
    return await withAuthCheck(async () => {
      try {
        // Hitung KPI dari data contracts yang ada
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        // Contracts this week
        const { count: contractsThisWeek } = await supabase
          .from('contracts')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', weekAgo.toISOString());

        // High risk contracts
        const { count: highRiskCount } = await supabase
          .from('contracts')
          .select('*', { count: 'exact', head: true })
          .eq('risk', 'high');

        // Pending AI analysis (contracts without entities)
        const { data: contractsWithoutEntities } = await supabase
          .from('contracts')
          .select(`
            id,
            contract_entities!left(contract_id)
          `)
          .is('contract_entities.contract_id', null);

        return {
          contracts_this_week: contractsThisWeek || 0,
          high_risk: highRiskCount || 0,
          pending_ai: contractsWithoutEntities?.length || 0
        };
      } catch (error) {
        console.error('Error fetching legal KPI:', error);
        // Always return a LegalKPI object, never null
        return {
          contracts_this_week: 0,
          high_risk: 0,
          pending_ai: 0
        };
      }
    }) as LegalKPI;
  }

  /**
   * Get dashboard data lengkap untuk legal
   */
  static async getDashboardData(): Promise<LegalDashboardData> {
    try {
      const [kpi, recentContracts, highRiskContracts, pendingReviews] = await Promise.all([
        this.getLegalKPI(),
        this.getRecentContracts(5),
        this.getHighRiskContracts(10),
        this.getPendingReviews(10)
      ]);

      return {
        kpi,
        recentContracts,
        highRiskContracts,
        pendingReviews
      };
    } catch (error) {
      console.error('Error fetching legal dashboard data:', error);
      throw error;
    }
  }

  /**
   * Get recent contracts
   */
  static async getRecentContracts(limit: number = 10): Promise<Contract[]> {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent contracts:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get high risk contracts
   */
  static async getHighRiskContracts(limit: number = 10): Promise<Contract[]> {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('risk', 'high')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching high risk contracts:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get contracts pending review
   */
  static async getPendingReviews(limit: number = 10): Promise<Contract[]> {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .in('status', ['pending', 'Pending Review'])
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching pending reviews:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get contract analysis (entities, findings, notes)
   */
  static async getContractAnalysis(contractId: string): Promise<ContractAnalysis> {
    try {
      const [entitiesResult, findingsResult, notesResult] = await Promise.all([
        // Get latest contract entities
        supabase
          .from('contract_entities')
          .select('*')
          .eq('contract_id', contractId)
          .order('analyzed_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        
        // Get risk findings
        supabase
          .from('risk_findings')
          .select('*')
          .eq('contract_id', contractId)
          .order('created_at', { ascending: false }),
        
        // Get legal notes
        supabase
          .from('legal_notes')
          .select('*')
          .eq('contract_id', contractId)
          .order('created_at', { ascending: false })
      ]);

      return {
        entities: entitiesResult.data,
        findings: findingsResult.data || [],
        notes: notesResult.data || []
      };
    } catch (error) {
      console.error('Error fetching contract analysis:', error);
      return {
        entities: null,
        findings: [],
        notes: []
      };
    }
  }

  /**
   * Run AI analysis on contract
   */
  static async runContractAnalysis(
    contractId: string, 
    analysisData?: Partial<ContractEntity>
  ): Promise<void> {
    try {
      // Get contract details first
      const { data: contract } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', contractId)
        .single();

      if (!contract) {
        throw new Error('Contract not found');
      }

      // Insert contract entities
      await supabase.from('contract_entities').insert([{
        contract_id: contractId,
        first_party: analysisData?.first_party || contract.first_party || 'PT ILCS',
        second_party: analysisData?.second_party || contract.second_party || 'Counterparty',
        value_rp: analysisData?.value_rp || contract.value_rp || 0,
        duration_months: analysisData?.duration_months || contract.duration_months || 12,
        penalty: analysisData?.penalty || 'Standard penalty clauses apply',
        initial_risk: analysisData?.initial_risk || contract.risk || 'medium',
        analyzed_at: new Date().toISOString()
      }]);

      // Insert sample risk findings
      const riskFindings = [
        {
          contract_id: contractId,
          section: 'Termination Clause',
          level: 'high' as const,
          title: 'High penalty for early termination detected'
        },
        {
          contract_id: contractId,
          section: 'Payment Terms',
          level: 'medium' as const,
          title: 'Payment terms may expose financial risk'
        },
        {
          contract_id: contractId,
          section: 'Liability',
          level: 'medium' as const,
          title: 'Limited liability clauses need review'
        }
      ];

      await supabase.from('risk_findings').insert(riskFindings);

      // Update contract status and risk level
      await supabase
        .from('contracts')
        .update({
          status: 'Reviewed',
          risk: analysisData?.initial_risk || 'high'
        })
        .eq('id', contractId);

    } catch (error) {
      console.error('Error running contract analysis:', error);
      throw error;
    }
  }

  /**
   * Add legal note to contract
   */
  static async addLegalNote(contractId: string, note: string, author?: string): Promise<void> {
    try {
      await supabase.from('legal_notes').insert([{
        contract_id: contractId,
        author: author || 'legal@company.com',
        note,
        created_at: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Error adding legal note:', error);
      throw error;
    }
  }

  /**
   * Update contract risk level
   */
  static async updateContractRisk(contractId: string, risk: Contract['risk']): Promise<void> {
    try {
      await supabase
        .from('contracts')
        .update({ risk })
        .eq('id', contractId);
    } catch (error) {
      console.error('Error updating contract risk:', error);
      throw error;
    }
  }

  /**
   * Update contract status
   */
  static async updateContractStatus(contractId: string, status: Contract['status']): Promise<void> {
    try {
      await supabase
        .from('contracts')
        .update({ status })
        .eq('id', contractId);
    } catch (error) {
      console.error('Error updating contract status:', error);
      throw error;
    }
  }

  /**
   * Get risk center data
   */
  static async getRiskCenterData(filters?: {
    risk?: string;
    status?: string;
  }): Promise<RiskCenterData> {
    try {
      let query = supabase.from('contracts').select('*');
      
      if (filters?.risk && filters.risk !== 'All') {
        query = query.eq('risk', filters.risk);
      }
      
      if (filters?.status && filters.status !== 'All') {
        query = query.eq('status', filters.status);
      }

      const { data: contracts, error } = await query
        .order('value_rp', { ascending: false });

      if (error) {
        throw error;
      }

      const riskDistribution = {
        high: contracts?.filter(c => c.risk === 'high').length || 0,
        medium: contracts?.filter(c => c.risk === 'medium').length || 0,
        low: contracts?.filter(c => c.risk === 'low').length || 0
      };

      return {
        totalContracts: contracts?.length || 0,
        riskDistribution,
        contracts: contracts || []
      };
    } catch (error) {
      console.error('Error fetching risk center data:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time updates for legal dashboard
   */
  static subscribeToLegalUpdates(
    onContractUpdate?: (payload: any) => void,
    onRiskFindingUpdate?: (payload: any) => void,
    onLegalNoteUpdate?: (payload: any) => void
  ) {
    const channel = supabase
      .channel('legal-dashboard')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'contracts' }, 
        onContractUpdate || (() => {})
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'risk_findings' }, 
        onRiskFindingUpdate || (() => {})
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'legal_notes' }, 
        onLegalNoteUpdate || (() => {})
      )
      .subscribe();

    return channel;
  }
}

export default LegalService;