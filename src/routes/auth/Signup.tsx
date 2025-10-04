"use client"
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import supabase from '@/utils/supabase'
import { useAuth } from '@/auth/AuthProvider'

const ROLE_COPY: Record<'procurement' | 'legal' | 'management', { label: string; desc: string }> = {
  procurement: {
    label: 'Procurement',
    desc: 'Menyusun draft, upload kontrak, dan koordinasi dengan Legal.',
  },
  legal: {
    label: 'Legal',
    desc: 'Review klausul, pantau temuan risiko, dan kirim rekomendasi.',
  },
  management: {
    label: 'Management',
    desc: 'Terima notifikasi persetujuan dan pantau KPI kontrak.',
  },
}

type Role = keyof typeof ROLE_COPY

export default function Signup() {
  const { session, role: activeRole } = useAuth()
  const [search] = useSearchParams()
  const navigate = useNavigate()
  const rawRole = search.get('role')
  const selectedRole = useMemo<Role | null>(() => {
    if (rawRole === 'procurement' || rawRole === 'legal' || rawRole === 'management') {
      return rawRole
    }
    return null
  }, [rawRole])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!selectedRole) {
      navigate('/auth/select-role', { replace: true })
    }
  }, [selectedRole, navigate])

  useEffect(() => {
    if (session && activeRole) {
      const destination = activeRole === 'legal' ? '/legal' : activeRole === 'management' ? '/management' : '/procurement'
      navigate(destination, { replace: true })
    }
  }, [session, activeRole, navigate])

  useEffect(() => {
    return () => {
      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current)
      }
    }
  }, [])

  if (!selectedRole) return null

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role: selectedRole },
        },
      })

      if (error) {
        setError(error.message)
        return
      }

      setMessage('Akun berhasil dibuat. Kamu akan diarahkan ke login...')
      redirectTimer.current = setTimeout(() => navigate('/auth/login', { replace: true }), 2000)
    } finally {
      setLoading(false)
    }
  }

  async function signUpGoogle() {
    if (!selectedRole) return
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  const roleCopy = ROLE_COPY[selectedRole]

  return (
    <main className="min-h-screen bg-[#F5F7FA]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-12 px-6 py-16 lg:grid lg:grid-cols-[1fr_420px] lg:items-center">
        <section className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#357ABD]/10 px-4 py-1 text-[#357ABD] text-sm font-semibold">Langkah 2 dari 2</span>
          <div className="space-y-3 max-w-xl">
            <h1 className="text-4xl font-semibold text-slate-900">Isi detail akun {roleCopy.label.toLowerCase()}</h1>
            <p className="text-sm leading-relaxed text-slate-600">{roleCopy.desc}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/auth/select-role')}
            className="w-fit rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 hover:border-[#357ABD] hover:text-[#357ABD]"
          >
            <span className="mr-1">&lt;</span> Ganti role
          </button>
        </section>

        <section className="w-full max-w-md">
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <header className="mb-6 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#357ABD]">{roleCopy.label}</p>
              <h2 className="text-2xl font-semibold text-slate-900">Buat akun</h2>
              <p className="text-sm text-slate-500">Masukkan data dasar, kamu bisa melengkapinya nanti di pengaturan profil.</p>
            </header>

            <form className="grid gap-4" onSubmit={submit}>
              <label className="text-sm text-slate-600">
                Nama lengkap
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#357ABD] focus:outline-none"
                  placeholder="Nama Lengkap"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </label>
              <label className="text-sm text-slate-600">
                Email kerja
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#357ABD] focus:outline-none"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              <label className="text-sm text-slate-600">
                Password
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#357ABD] focus:outline-none"
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
              {error && <div className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</div>}
              {message && <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-600">{message}</div>}
              <button
                type="submit"
                className="rounded-xl bg-[#357ABD] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2C6AA2] disabled:opacity-60"
                disabled={loading}
              >
                {loading ? 'Memproses...' : 'Daftar'}
              </button>
            </form>

            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              <span>atau</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <button
              type="button"
              onClick={signUpGoogle}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <span className="text-base font-semibold text-[#357ABD]">G</span>
              Sign up dengan Google
            </button>

            <p className="mt-6 text-sm text-slate-600">
              Sudah punya akun?{' '}
              <Link to="/auth/login" className="font-semibold text-[#357ABD] hover:underline">
                Login
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
