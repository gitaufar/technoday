interface LifecycleKPICardProps {
  title: string
  value: string | number
  variant: 'active' | 'expiring-30' | 'expiring-60' | 'expired'
}

export default function LifecycleKPICard({ title, value, variant }: LifecycleKPICardProps) {
  const getCardStyles = () => {
    switch (variant) {
      case 'active':
        return {
          bgColor: 'bg-white',
          borderColor: 'border-gray-200',
          valueColor: 'text-gray-900',
          titleColor: 'text-gray-600',
          iconBg: 'bg-blue-50',
          iconColor: 'text-blue-600',
          icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
          )
        }
      case 'expiring-30':
        return {
          bgColor: 'bg-white',
          borderColor: 'border-gray-200',
          valueColor: 'text-red-600',
          titleColor: 'text-gray-600',
          iconBg: 'bg-red-50',
          iconColor: 'text-red-600',
          icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
          )
        }
      case 'expiring-60':
        return {
          bgColor: 'bg-white',
          borderColor: 'border-gray-200',
          valueColor: 'text-orange-600',
          titleColor: 'text-gray-600',
          iconBg: 'bg-orange-50',
          iconColor: 'text-orange-600',
          icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
            </svg>
          )
        }
      case 'expired':
        return {
          bgColor: 'bg-white',
          borderColor: 'border-gray-200',
          valueColor: 'text-gray-600',
          titleColor: 'text-gray-600',
          iconBg: 'bg-gray-50',
          iconColor: 'text-gray-500',
          icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          )
        }
      default:
        return {
          bgColor: 'bg-white',
          borderColor: 'border-gray-200',
          valueColor: 'text-gray-900',
          titleColor: 'text-gray-600',
          iconBg: 'bg-gray-50',
          iconColor: 'text-gray-500',
          icon: null
        }
    }
  }

  const styles = getCardStyles()

  return (
    <div className={`${styles.bgColor} rounded-lg border ${styles.borderColor} px-4 py-5`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`${styles.iconBg} rounded-md p-2`}>
            <div className={styles.iconColor}>
              {styles.icon}
            </div>
          </div>
        </div>
        <div className="ml-4 w-0 flex-1">
          <dl>
            <dt className={`text-sm font-medium ${styles.titleColor} truncate`}>
              {title}
            </dt>
            <dd className={`text-2xl font-semibold ${styles.valueColor}`}>
              {value}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  )
}