import React from 'react'

interface RiskSummaryCardProps {
  riskLevel: 'High Risk' | 'Medium Risk' | 'Low Risk'
  count: number
  percentage: number
  color: string
  bgColor: string
}

const RiskSummaryCard: React.FC<RiskSummaryCardProps> = ({
  riskLevel,
  count,
  percentage,
  color,
  bgColor
}) => {
  return (
    <div className={`${bgColor} rounded-lg p-4 border border-opacity-20`} style={{ borderColor: color }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-medium text-gray-900">{riskLevel}</span>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-gray-900">{count}</div>
          <div className="text-xs text-gray-500">{percentage}%</div>
        </div>
      </div>
    </div>
  )
}

export default RiskSummaryCard