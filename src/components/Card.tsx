import type { ReactNode } from 'react'

export default function Card({
    title, 
    paragraph,
    children, 
    right, 
    className 
  }: { title?: string; paragraph?: string; children: ReactNode; right?: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white shadow-sm ${className ?? ''}`}>
      {(title || right) && (
        <div className="flex flex-col justify-between border-b border-gray-200 px-5 py-3">
          <div className="font-semibold">{title}</div>
          <div className="font-light">{paragraph}</div>
          {right}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}
