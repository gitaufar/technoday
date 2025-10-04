import React from 'react'

interface ContractExpirationGraphProps {
  className?: string
}

interface ContractData {
  period: string
  expiringContracts: number
  expiredContracts: number
}

const ContractExpirationGraph: React.FC<ContractExpirationGraphProps> = ({ className = '' }) => {
  const contractData: ContractData[] = [
    { period: 'Next 30 Days', expiringContracts: 12, expiredContracts: 3 },
    { period: 'Next 60 Days', expiringContracts: 8, expiredContracts: 2 },
    { period: 'Next 90 Days', expiringContracts: 15, expiredContracts: 1 }
  ]

  const chartHeight = 280
  const maxChartValue = 20 // Based on screenshot scale

  const getBarHeight = (value: number) => {
    return (value / maxChartValue) * (chartHeight - 60) // Leave space for labels
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Contract Expiration Timeline</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Next 90 days</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6L8 10L12 6" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      <div className="relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-4">
          <span>20</span>
          <span>15</span>
          <span>10</span>
          <span>5</span>
          <span>0</span>
        </div>

        {/* Y-axis label */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-gray-500 font-medium">
          Number of Contracts
        </div>

        {/* Chart area */}
        <div className="ml-16">
          {/* Grid lines */}
          <div className="relative" style={{ height: `${chartHeight}px` }}>
            {[0, 5, 10, 15, 20].map((value) => (
              <div
                key={value}
                className="absolute w-full border-t border-gray-100"
                style={{ 
                  bottom: `${(value / maxChartValue) * (chartHeight - 60)}px` 
                }}
              />
            ))}

            {/* Bars */}
            <div className="absolute bottom-10 w-full h-full flex items-end justify-between px-8">
              {contractData.map((item, index) => (
                <div key={index} className="flex items-end gap-2">
                  {/* Expiring Contracts Bar */}
                  <div className="relative group">
                    <div
                      className="bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-colors cursor-pointer"
                      style={{ 
                        height: `${getBarHeight(item.expiringContracts)}px`,
                        width: '32px'
                      }}
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.expiringContracts}
                    </div>
                  </div>

                  {/* Expired Contracts Bar */}
                  <div className="relative group">
                    <div
                      className="bg-gray-400 rounded-t-sm hover:bg-gray-500 transition-colors cursor-pointer"
                      style={{ 
                        height: `${getBarHeight(item.expiredContracts)}px`,
                        width: '32px'
                      }}
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.expiredContracts}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* X-axis labels */}
            <div className="absolute bottom-0 w-full flex justify-between px-8">
              {contractData.map((item, index) => (
                <div key={index} className="text-xs text-gray-500 text-center" style={{ width: '70px' }}>
                  {item.period}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-sm text-gray-700 font-medium">Expiring Contracts</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full" />
            <span className="text-sm text-gray-700 font-medium">Expired Contracts</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContractExpirationGraph