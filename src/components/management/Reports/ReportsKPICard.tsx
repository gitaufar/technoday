interface ReportsKPICardProps {
  title: string
  value: string | number
  subtitle: string
  variant: 'active' | 'pending' | 'expired' | 'value' | 'distribution'
  trend?: 'up' | 'down' | 'neutral'
}

export default function ReportsKPICard({ 
  title, 
  value, 
  subtitle, 
  variant, 
  trend = 'neutral' 
}: ReportsKPICardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'active':
        return {
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          valueColor: 'text-gray-900',
          subtitleColor: 'text-green-600',
          icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          )
        }
      case 'pending':
        return {
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          valueColor: 'text-gray-900',
          subtitleColor: 'text-yellow-600',
          icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
            </svg>
          )
        }
      case 'expired':
        return {
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          valueColor: 'text-gray-900',
          subtitleColor: 'text-red-600',
          icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
          )
        }
      case 'value':
        return {
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          valueColor: 'text-gray-900',
          subtitleColor: 'text-green-600',
          icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V19C3 20.1 3.9 21 5 21H11V19H5V3H13V9H21Z"/>
            </svg>
          )
        }
      case 'distribution':
        return {
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-600',
          valueColor: 'text-gray-900',
          subtitleColor: 'text-gray-600',
          icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11 2v20c-5.07-.5-9-4.79-9-10s3.93-9.5 9-10zm2.03 0v8.99H22c-.47-4.74-4.24-8.52-8.97-8.99zm0 11.01V22c4.74-.47 8.5-4.25 8.97-8.99h-8.97z"/>
            </svg>
          )
        }
      default:
        return {
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600',
          valueColor: 'text-gray-900',
          subtitleColor: 'text-gray-600',
          icon: null
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className={`text-3xl font-bold ${styles.valueColor} mb-1`}>
            {value}
          </p>
          <p className={`text-sm ${styles.subtitleColor} flex items-center gap-1`}>
            {trend === 'up' && (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L10 4.414 4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
              </svg>
            )}
            {trend === 'down' && (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L10 15.586l5.293-5.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            )}
            {subtitle}
          </p>
        </div>
        
        <div className={`w-12 h-12 ${styles.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <div className={styles.iconColor}>
            {styles.icon}
          </div>
        </div>
      </div>
    </div>
  )
}