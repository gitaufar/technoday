"use client"

export default function App() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="rounded-xl border bg-white px-6 py-5 shadow-sm space-y-2 text-center">
        <p className="font-medium">App ini sekarang dikendalikan lewat router di <code>src/main.tsx</code>.</p>
        <p className="text-sm text-gray-600">Jalankan <strong>npm run dev</strong> lalu buka halaman utama untuk memilih peran (Procurement / Legal / Manajemen).</p>
      </div>
    </div>
  )
}
