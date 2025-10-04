interface ContractsExpiringCardProps {
  title: string
  value: string
  vendor: string
  daysToExpiry: number
  riskLevel: 'High Risk' | 'Medium Risk' | 'Low Risk'
  onViewContract?: () => void
}

export default function ContractsExpiringCard({
  title,
  value,
  vendor,
  daysToExpiry,
  riskLevel,
  onViewContract
}: ContractsExpiringCardProps) {
  const getRiskBadgeStyles = (risk: string) => {
    switch (risk) {
      case 'High Risk':
        return 'bg-red-100 text-red-800'
      case 'Medium Risk':
        return 'bg-orange-100 text-orange-800'
      case 'Low Risk':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDaysLeftBadgeStyles = (days: number) => {
    if (days <= 15) return 'bg-red-500 text-white'
    if (days <= 45) return 'bg-orange-500 text-white'
    return 'bg-green-500 text-white'
  }

  const getCardBackgroundColor = (days: number) => {
    if (days < 30) return 'bg-red-50 border-red-100'    // Merah untuk < 30 hari
    if (days < 60) return 'bg-orange-50 border-orange-100' // Kuning/Orange untuk < 60 hari
    return 'bg-green-50 border-green-100'               // Hijau untuk >= 60 hari
  }

  return (
    <div className={`rounded-lg p-4 border ${getCardBackgroundColor(daysToExpiry)}`}>
      {/* Header with title and days badge */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 text-base leading-tight flex-1 pr-2">
          {title}
        </h3>
        <div className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getDaysLeftBadgeStyles(daysToExpiry)}`}>
          {daysToExpiry} days
        </div>
      </div>

      {/* Contract details */}
      <div className="space-y-1 mb-4">
        <p className="text-gray-700 text-sm">
          <span className="font-medium">Value:</span> {value}
        </p>
        <p className="text-gray-700 text-sm">
          <span className="font-medium">Vendor:</span> {vendor}
        </p>
      </div>

      {/* Footer with risk badge and view button */}
      <div className="flex items-center justify-between">
        <span 
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getRiskBadgeStyles(riskLevel)}`}
        >
          {riskLevel}
        </span>
        <button 
          onClick={onViewContract}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
        >
          View Contract
        </button>
      </div>
    </div>
  )
}