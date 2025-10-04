import React from 'react'

interface RiskDistributionProps {
  className?: string
  kpiData?: {
    low_risk_percentage: number
    medium_risk_percentage: number
    high_risk_percentage: number
  } | null
}

interface RiskData {
  label: string
  percentage: number
  color: string
}

const RiskDistribution: React.FC<RiskDistributionProps> = ({ className = '', kpiData }) => {
  const riskData: RiskData[] = [
    { 
      label: `Low Risk: ${kpiData?.low_risk_percentage?.toFixed(1) || '0.0'}%`, 
      percentage: kpiData?.low_risk_percentage || 0, 
      color: '#10B981' 
    },
    { 
      label: `Medium Risk: ${kpiData?.medium_risk_percentage?.toFixed(1) || '0.0'}%`, 
      percentage: kpiData?.medium_risk_percentage || 0, 
      color: '#F59E0B' 
    },
    { 
      label: `High Risk: ${kpiData?.high_risk_percentage?.toFixed(1) || '0.0'}%`, 
      percentage: kpiData?.high_risk_percentage || 0, 
      color: '#EF4444' 
    }
  ]

  // Calculate angles for pie chart
  let currentAngle = 0
  const segments = riskData.map(item => {
    const startAngle = currentAngle
    const endAngle = currentAngle + (item.percentage / 100) * 360
    currentAngle = endAngle
    return {
      ...item,
      startAngle,
      endAngle
    }
  })

  const createPath = (centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle)
    const end = polarToCartesian(centerX, centerY, radius, startAngle)
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"
    
    return [
      "M", centerX, centerY,
      "L", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ")
  }

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    }
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Risk Distribution</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Last 30 days</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6L8 10L12 6" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      <div className="flex flex-col items-center">
        {/* Pie Chart */}
        <div className="relative mb-8">
          <svg width="240" height="240" viewBox="0 0 240 240">
            {segments.map((segment, index) => (
              <path
                key={index}
                d={createPath(120, 120, 100, segment.startAngle, segment.endAngle)}
                fill={segment.color}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            ))}
            {/* Inner circle to create donut effect */}
            <circle
              cx="120"
              cy="120"
              r="50"
              fill="white"
            />
          </svg>
        </div>

        {/* Legend */}
        <div className="w-full space-y-3">
          {riskData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {item.label.split(':')[0]}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RiskDistribution