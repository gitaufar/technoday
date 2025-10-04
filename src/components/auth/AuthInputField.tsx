import type { InputHTMLAttributes, ReactNode } from 'react'

type Props = {
  label?: string
  icon?: ReactNode
  error?: string
} & InputHTMLAttributes<HTMLInputElement>

export default function AuthInputField({ label, icon, error, className, ...rest }: Props) {
  return (
    <label className={`block ${className ?? ''}`}>
      {label && <div className="mb-2 text-[13px] font-medium text-gray-800">{label}</div>}

      <div className="flex items-center gap-3 rounded-xl border border-gray-300 px-4 py-3 bg-white hover:border-gray-400 focus-within:border-[#357ABD] focus-within:ring-1 focus-within:ring-[#357ABD] transition-all">
        {icon && (
          <div className="text-gray-400 flex items-center justify-center flex-shrink-0">{icon}</div>
        )}

        <input
          className="flex-1 bg-transparent outline-none placeholder:text-gray-400 text-[14px] text-gray-800"
          {...rest}
        />
      </div>

      {error && <div className="mt-2 text-xs text-red-600">{error}</div>}
    </label>
  )
}
