import React from 'react'

interface KPICardProps {
  title: string
  value: string | number
  subtitle: string
  iconSrc: string
  iconBgColor: string
  trend?: 'up' | 'down' | 'stable'
  trendValue?: string
  badge?: {
    label: string
    color: string
    bgColor: string
  }
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  iconSrc,
  iconBgColor,
  trend,
  trendValue,
  badge
}) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      case 'stable': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow relative">
      {/* Badge in top right corner */}
      {badge && (
        <div className="absolute top-4 right-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color} ${badge.bgColor}`}>
            {badge.label}
          </span>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${iconBgColor} flex items-center justify-center`}>
          <img src={iconSrc} alt={title} className="w-6 h-6" />
        </div>
      </div>
      
      <div className="space-y-1">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">{subtitle}</p>
          {trend && trendValue && (
            <div className={`flex items-center gap-1 text-xs font-medium ${getTrendColor()}`}>
              <span>{trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default KPICard