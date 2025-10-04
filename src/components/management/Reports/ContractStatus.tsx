interface ContractStatusData {
  label: string
  value: number
  color: string
}

interface ContractStatusProps {
  kpiData?: {
    active_contracts: number
    pending_contracts: number
    expired_contracts: number
    total_contracts: number
  } | null
}

export default function ContractStatus({ kpiData }: ContractStatusProps) {
  // Generate data from KPI - Updated logic: Active = active, Expired = expired, Pending = others
  const chartData: ContractStatusData[] = [
    { label: 'Active', value: kpiData?.active_contracts || 0, color: '#10B981' },
    { label: 'Pending', value: kpiData?.pending_contracts || 0, color: '#F59E0B' },
    { label: 'Expired', value: kpiData?.expired_contracts || 0, color: '#EF4444' },
    { label: 'Total', value: kpiData?.total_contracts || 0, color: '#3B82F6' }
  ]

  const maxValue = Math.max(...chartData.map((item: ContractStatusData) => item.value))
  const yAxisMax = Math.ceil(maxValue / 50) * 50 // Round up to nearest 50

  // Generate Y-axis labels
  const yAxisLabels = []
  for (let i = 0; i <= yAxisMax; i += 50) {
    yAxisLabels.push(i)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Contract Status</h3>
      
      {/* Chart Container */}
      <div className="relative">
        {/* Chart Area */}
        <div className="flex items-end justify-between h-64 mb-4">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-8">
            {yAxisLabels.reverse().map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>

          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {yAxisLabels.map((_, index) => (
              <div key={index} className="border-t border-gray-100 w-full"></div>
            ))}
          </div>
          
          {/* Bars */}
          <div className="flex items-end justify-between w-full h-full relative z-10 px-4">
            {chartData.map((item, index) => {
              const barHeight = (item.value / yAxisMax) * 100
              return (
                <div key={index} className="flex flex-col items-center flex-1 max-w-[60px]">
                  {/* Bar */}
                  <div 
                    className="w-12 rounded-t-sm mb-2 transition-all duration-300 hover:opacity-80"
                    style={{ 
                      height: `${barHeight}%`,
                      backgroundColor: item.color,
                      minHeight: item.value > 0 ? '4px' : '0px'
                    }}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* X-axis labels */}
        <div className="flex items-center justify-between px-4">
          {chartData.map((item, index) => (
            <div key={index} className="flex flex-col items-center flex-1 max-w-[60px]">
              <span className="text-xs text-gray-600 text-center">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center mt-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-600">Contracts</span>
          </div>
        </div>
      </div>
    </div>
  )
}