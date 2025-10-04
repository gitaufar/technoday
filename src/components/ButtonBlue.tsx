import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Props = {
  text: string
  to?: string
  iconRight?: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>

export default function ButtonBlue({ text, className, to, iconRight, ...rest }: Props) {
  const buttonContent = (
    <button
      className={`bg-[#357ABD] text-white rounded-[8px] px-4 py-2 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer ${className ?? ''}`}
      {...rest}
    >
      {text}
      {iconRight && <span>{iconRight}</span>}
    </button>
  )

  if (to) {
    return <Link to={to}>{buttonContent}</Link>
  }

  return buttonContent
}
