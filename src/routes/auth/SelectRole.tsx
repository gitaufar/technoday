"use client"
import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'

const ROLES: Array<{ id: 'procurement' | 'legal' | 'management'; title: string; desc: string; badge: string }> = [
  {
    id: 'procurement',
    title: 'Procurement',
    desc: 'Buat draft kontrak, upload dokumen, dan kirim ke legal.',
    badge: 'PR',
  },
  {
    id: 'legal',
    title: 'Legal',
    desc: 'Review dokumen, catat temuan risiko, dan berikan rekomendasi.',
    badge: 'LG',
  },
  {
    id: 'management',
    title: 'Management',
    desc: 'Pantau KPI, setujui kontrak, dan monitor vendor.',
    badge: 'MG',
  },
]

export default function SelectRole() {
  const navigate = useNavigate()
  const { session, role } = useAuth()

  useEffect(() => {
    if (session && role) {
      const to = role === 'legal' ? '/legal' : role === 'management' ? '/management' : '/procurement'
      navigate(to, { replace: true })
    }
  }, [session, role, navigate])

  const cards = useMemo(() => ROLES, [])

  function handleSelect(selected: 'procurement' | 'legal' | 'management') {
    navigate(`/auth/signup?role=${selected}`)
  }

  return (
    <main className="min-h-screen bg-[#F5F7FA]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-14 md:flex-row md:items-center md:justify-between">
        <section className="max-w-xl space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#357ABD]/10 px-4 py-1 text-[#357ABD] text-sm font-semibold">Langkah 1 dari 2</span>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold text-slate-900">Pilih peran kamu terlebih dahulu</h1>
            <p className="text-sm text-slate-600">OptiMind menyesuaikan pengalaman sesuai peran. Kamu masih bisa mengubahnya nanti melalui admin.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/auth/login')}
            className="text-sm text-[#357ABD] underline"
          >
            Sudah punya akun? Login
          </button>
        </section>

        <section className="grid w-full max-w-xl gap-4">
          {cards.map((roleCard) => (
            <button
              key={roleCard.id}
              type="button"
              onClick={() => handleSelect(roleCard.id)}
              className="group flex items-center gap-4 rounded-2xl bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="grid h-12 w-12 place-items-center rounded-full bg-[#357ABD]/10 text-sm font-semibold text-[#357ABD]">
                {roleCard.badge}
              </div>
              <div className="flex-1">
                <div className="text-base font-semibold text-slate-900 group-hover:text-[#357ABD]">
                  {roleCard.title}
                </div>
                <p className="text-sm text-slate-500">{roleCard.desc}</p>
              </div>
              <span className="text-lg text-slate-400 transition group-hover:text-[#357ABD]">&gt;</span>
            </button>
          ))}
        </section>
      </div>
    </main>
  )
}
