import React from 'react'
import RiskSummaryCard from './RiskSummaryCard'

interface RiskSummaryProps {
  total: number
  highRisk: number
  mediumRisk: number
  lowRisk: number
}

export const RiskSummary: React.FC<RiskSummaryProps> = ({ 
  total, 
  highRisk, 
  mediumRisk, 
  lowRisk 
}) => {
  // Calculate percentages
  const highRiskPercentage = total > 0 ? ((highRisk / total) * 100).toFixed(1) : 0
  const mediumRiskPercentage = total > 0 ? ((mediumRisk / total) * 100).toFixed(1) : 0
  const lowRiskPercentage = total > 0 ? ((lowRisk / total) * 100).toFixed(1) : 0

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Risk Summary</h2>
      
      <div className="space-y-3 mb-6">
        <RiskSummaryCard
          riskLevel="High Risk"
          count={highRisk}
          percentage={parseFloat(highRiskPercentage.toString())}
          color="#EF4444"
          bgColor="bg-red-50"
        />
        
        <RiskSummaryCard
          riskLevel="Medium Risk"
          count={mediumRisk}
          percentage={parseFloat(mediumRiskPercentage.toString())}
          color="#F59E0B"
          bgColor="bg-orange-50"
        />
        
        <RiskSummaryCard
          riskLevel="Low Risk"
          count={lowRisk}
          percentage={parseFloat(lowRiskPercentage.toString())}
          color="#10B981"
          bgColor="bg-green-50"
        />
      </div>
      
      <div className="border-t border-gray-100 pt-4">
        <div className="text-sm text-gray-600 mb-1">Total Contracts</div>
        <div className="text-2xl font-bold text-gray-900">{total}</div>
      </div>
    </div>
  )
}
