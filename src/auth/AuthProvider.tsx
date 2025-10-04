"use client"
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import supabase from '@/utils/supabase'

type Role = 'procurement' | 'legal' | 'management'
type Profile = { id: string; email: string | null; full_name: string | null; role: Role }
type SessionLike = { user: { id: string; email: string | null } } | null

type AuthCtx = {
  session: SessionLike
  profile: Profile | null
  role: Role | null
  loading: boolean
  signOut: () => Promise<void>
}

const defaultCtx: AuthCtx = {
  session: null,
  profile: null,
  role: null,
  loading: true,
  signOut: async () => {},
}

const Ctx = createContext<AuthCtx>(defaultCtx)

async function fetchProfile(userId: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) throw error
  return data as Profile | null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionLike>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.auth.getSession()
    const currentSession = (data?.session as any) ?? null
    setSession(currentSession)
    if (currentSession?.user?.id) {
      try {
        const fetched = await fetchProfile(currentSession.user.id)
        setProfile(fetched)
      } catch (err) {
        console.error('Failed loading profile', err)
        setProfile(null)
      }
    } else {
      setProfile(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      load()
    })
    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthCtx>(() => ({
    session,
    profile,
    role: profile?.role ?? null,
    loading,
    signOut: async () => {
      await supabase.auth.signOut()
      await load()
    },
  }), [session, profile, loading])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
