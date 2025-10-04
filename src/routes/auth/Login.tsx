"use client"
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '@/utils/supabase'
import { useAuth } from '@/auth/AuthProvider'

type Role = 'procurement' | 'legal' | 'management'

const ROLE_ROUTE: Record<Role, string> = {
  procurement: '/procurement',
  legal: '/legal',
  management: '/management',
}

function resolveRoute(role: Role | null | undefined) {
  if (!role) return '/procurement'
  return ROLE_ROUTE[role]
}

export default function Login() {
  const { session, role, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && session && role) {
      navigate(resolveRoute(role), { replace: true })
    }
  }, [session, role, authLoading, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        return
      }

      const userId = data?.user?.id
      if (userId) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .maybeSingle()

        if (!profileError) {
          const dbRole = profile?.role
          const nextRole: Role | null =
            dbRole === 'legal' || dbRole === 'management' || dbRole === 'procurement'
              ? dbRole
              : role ?? null
          navigate(resolveRoute(nextRole), { replace: true })
          return
        }
      }

      navigate(resolveRoute(role), { replace: true })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <main className="min-h-screen bg-[#F5F7FA]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-12 px-6 py-16 lg:flex-row lg:items-center lg:justify-between">
        <section className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#357ABD]/10 px-4 py-1 text-[#357ABD] text-sm font-semibold">OptiMind Contract Suite</span>
          <div className="space-y-3 max-w-xl">
            <h1 className="text-4xl font-semibold text-slate-900">Satu workspace untuk Procurement, Legal, dan Management</h1>
            <p className="text-sm leading-relaxed text-slate-600">Kelola draft, review risiko, dan approvals dalam satu dashboard realtime yang terhubung Supabase.</p>
          </div>
          <dl className="grid gap-3 text-sm text-slate-600 md:grid-cols-2">
            <Feature title="Realtime updates" desc="Status kontrak otomatis tersinkron ke semua role." />
            <Feature title="Role-based access" desc="RLS Supabase memastikan tiap role hanya melihat aksinya." />
            <Feature title="Storage terintegrasi" desc="Upload dokumen langsung masuk ke bucket Supabase." />
            <Feature title="KPI monitoring" desc="Dashboard legal dan management menarik data langsung dari views." />
          </dl>
        </section>

        <section className="w-full max-w-md">
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <header className="mb-6 space-y-1">
              <h2 className="text-2xl font-semibold text-slate-900">Masuk ke OptiMind</h2>
              <p className="text-sm text-slate-500">Gunakan akun email perusahaan atau login dengan Google.</p>
            </header>

            <form className="grid gap-4" onSubmit={handleSubmit}>
              <label className="text-sm text-slate-600">
                Email
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
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
              {error && <div className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</div>}
              <button
                type="submit"
                className="rounded-xl bg-[#357ABD] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2C6AA2] disabled:opacity-60"
                disabled={submitting}
              >
                {submitting ? 'Memproses...' : 'Login'}
              </button>
            </form>

            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              <span>atau</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <span className="text-base font-semibold text-[#357ABD]">G</span>
              Login dengan Google
            </button>

            <p className="mt-6 text-sm text-slate-600">
              Belum punya akun?{' '}
              <button
                type="button"
                onClick={() => navigate('/auth/select-role')}
                className="font-semibold text-[#357ABD] hover:underline"
              >
                Buat akun baru
              </button>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

type FeatureProps = { title: string; desc: string }
function Feature({ title, desc }: FeatureProps) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="font-semibold text-slate-800">{title}</div>
      <p className="mt-1 text-xs text-slate-500">{desc}</p>
    </div>
  )
}
