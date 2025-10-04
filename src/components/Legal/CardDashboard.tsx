import type { ReactNode } from 'react'

export default function Card({
  title,
  info,
  right,
  value,
  className,
}: {
  info?: string
  title?: string
  right?: ReactNode
  className?: string
  value?: number | string | null
}) {
  return (
    // Container utama kartu, padding diubah menjadi p-5
    <div className={`rounded-2xl bg-white p-5 shadow-sm ${className ?? ''}`}>
      {/* Pembungkus utama dengan flex-row untuk membuat 2 kolom */}
      <div className="flex flex-row items-center justify-between">
        
        {/* KOLOM KIRI: untuk teks yang ditumpuk vertikal */}
        <div className="flex flex-col">
          {title && (
            <p className="text-sm font-medium text-gray-500">{title}</p>
          )}
          {value !== null && value !== undefined && (
            <p className="my-1 text-3xl font-bold text-gray-800">{value}</p>
          )}
          {info && (
            <p className="text-sm font-medium text-green-600">{info}</p>
          )}
        </div>

        {/* KOLOM KANAN: untuk ikon atau elemen lainnya */}
        <div>{right}</div>
      </div>
    </div>
  )
}