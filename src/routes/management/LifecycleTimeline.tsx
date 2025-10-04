import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import LifecycleKPICard from '../../components/management/LifecycleTimeline/LifecycleKPICard'
import ContractLifecycleTimeline from '../../components/management/LifecycleTimeline/ContractLifecycleTimeline'
import ContractsExpiring from '../../components/management/LifecycleTimeline/ContractsExpiring'
import { managementService, type ManagementKPIData, type ContractSummary } from '../../services/managementService'

interface ContractExpiringCard {
  title: string
  value: string
  vendor: string
  daysToExpiry: number
  riskLevel: 'High Risk' | 'Medium Risk' | 'Low Risk'
}

export default function LifecycleTimeline() {
  const navigate = useNavigate()
  const [selectedDivision, setSelectedDivision] = useState('All Divisions')
  const [selectedPeriod, setSelectedPeriod] = useState('Next 90 Days')
  const [isHighRiskOnly, setIsHighRiskOnly] = useState(false)
  const [kpiData, setKpiData] = useState<ManagementKPIData | null>(null)
  const [contracts, setContracts] = useState<ContractSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [kpiResult, contractsResult] = await Promise.all([
          managementService.getManagementKPI(),
          managementService.getContractsSummary(30) // Get contracts for lifecycle analysis
        ])
        
        setKpiData(kpiResult)
        setContracts(contractsResult)
      } catch (error) {
        console.error('Error fetching lifecycle data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleViewContract = (contractId?: string) => {
    if (contractId) {
      navigate(`/management/contracts/${contractId}`)
    }
  }

  const handleViewAllContracts = () => {
    navigate('/management/reports')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-gray-500">Loading lifecycle timeline...</div>
      </div>
    )
  }

  if (!kpiData) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-red-500">Error loading lifecycle data</div>
      </div>
    )
  }

  // Transform contracts data for timeline and expiring cards
  const timelineContracts = contracts.slice(0, 10).map(contract => {
    const createdDate = new Date(contract.created_at)
    const endDate = new Date(contract.end_date)
    const currentDate = new Date()
    
    // Assume contract started 12 months before end date or from created date
    const assumedStartDate = new Date(endDate)
    assumedStartDate.setMonth(endDate.getMonth() - 12)
    const startDate = createdDate < assumedStartDate ? createdDate : assumedStartDate
    
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)) // months
    const currentMonth = Math.ceil((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
    
    const daysToExpiry = Math.floor((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
    let status: "active" | "expiring-soon" | "critical" | "expired" = "active"
    
    if (daysToExpiry < 0) {
      status = "expired"
    } else if (daysToExpiry <= 15) {
      status = "critical"
    } else if (daysToExpiry <= 60) {
      status = "expiring-soon"
    }

    return {
      id: contract.id,
      name: contract.name,
      value: `Rp ${contract.value_rp.toLocaleString()}`,
      timeline: {
        start: startDate.toLocaleDateString('en', { month: 'short' }),
        end: endDate.toLocaleDateString('en', { month: 'short' }),
        duration: Math.max(1, duration),
        currentMonth: Math.max(1, Math.min(currentMonth, duration))
      },
      status
    }
  })

  const expiringContracts: ContractExpiringCard[] = contracts.slice(0, 5).map(contract => {
    const daysToExpiry = Math.floor((new Date(contract.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return {
      title: contract.name,
      value: `Rp ${contract.value_rp.toLocaleString()}`,
      vendor: contract.second_party,
      daysToExpiry: Math.max(0, daysToExpiry),
      riskLevel: contract.risk === 'high' ? 'High Risk' : contract.risk === 'medium' ? 'Medium Risk' : 'Low Risk'
    }
  })

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <LifecycleKPICard
          title="Active Contracts"
          value={kpiData.active_contracts}
          variant="active"
        />
        <LifecycleKPICard
          title="Expiring ≤30 Days"
          value={kpiData.expiring_30_days}
          variant="expiring-30"
        />
        <LifecycleKPICard
          title="Expiring ≤60 Days"
          value={kpiData.expiring_60_days}
          variant="expiring-60"
        />
        <LifecycleKPICard
          title="Expired"
          value={kpiData.expired_contracts}
          variant="expired"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contract Lifecycle Timeline */}
        <div className="lg:col-span-2">
          <ContractLifecycleTimeline
            contracts={timelineContracts}
            selectedDivision={selectedDivision}
            selectedPeriod={selectedPeriod}
            isHighRiskOnly={isHighRiskOnly}
            onDivisionChange={setSelectedDivision}
            onPeriodChange={setSelectedPeriod}
            onHighRiskToggle={setIsHighRiskOnly}
          />
        </div>

        {/* Contracts Expiring Soon */}
        <ContractsExpiring
          contracts={expiringContracts}
          onViewContract={handleViewContract}
          onViewAllContracts={handleViewAllContracts}
        />
      </div>
    </div>
  )
}