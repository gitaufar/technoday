import ContractsExpiringCard from './ContractsExpiringCard'

interface ContractExpiringData {
  id?: string
  title: string
  value: string
  vendor: string
  daysToExpiry: number
  riskLevel: 'High Risk' | 'Medium Risk' | 'Low Risk'
}

interface ContractsExpiringProps {
  contracts: ContractExpiringData[]
  onViewContract?: (contractId?: string) => void
  onViewAllContracts?: () => void
}

export default function ContractsExpiring({
  contracts,
  onViewContract,
  onViewAllContracts
}: ContractsExpiringProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Contracts Expiring Soon
      </h2>
      
      {/* Contract Cards */}
      <div className="space-y-4">
        {contracts.map((contract, index) => (
          <ContractsExpiringCard
            key={contract.id || index}
            title={contract.title}
            value={contract.value}
            vendor={contract.vendor}
            daysToExpiry={contract.daysToExpiry}
            riskLevel={contract.riskLevel}
            onViewContract={() => onViewContract?.(contract.id)}
          />
        ))}
      </div>

      {/* View All Button */}
      {contracts.length > 0 && (
        <div className="mt-6">
          <button 
            onClick={onViewAllContracts}
            className="w-full text-center text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
          >
            View All Expiring Contracts
          </button>
        </div>
      )}
    </div>
  )
}