"use client"
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import supabase from '@/utils/supabase'

type Role = 'procurement' | 'legal' | 'management' | 'owner' | null
type Profile = { 
  id: string; 
  email: string | null; 
  full_name: string | null; 
  role: Role | null;  // Allow NULL role for users without company
  created_at: string; 
  company_id: string | null 
}
type SessionLike = { user: { id: string; email: string | null } } | null

type AuthCtx = {
  session: SessionLike
  profile: Profile | null
  role: Role | null
  loading: boolean
  companyId: string | null
  signOut: () => Promise<void>
  isOwner: boolean
  refresh: () => Promise<void>
}

const defaultCtx: AuthCtx = {
  session: null,
  profile: null,
  role: null,
  companyId: null,
  loading: true,
  signOut: async () => {},
  isOwner: false,
  refresh: async () => {}
}

const Ctx = createContext<AuthCtx>(defaultCtx)

async function fetchProfile(userId: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) throw error
  return data as Profile | null
}

async function checkIfOwner(userId: string) {
  const { data, error } = await supabase.from('companies').select('owner_id').eq('owner_id', userId).maybeSingle();
  if (error) throw error;
  return data ? true : false;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionLike>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false);

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.auth.getSession()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentSession = (data?.session as any) ?? null
    setSession(currentSession)
    if (currentSession?.user?.id) {
      try {
        const fetched = await fetchProfile(currentSession.user.id)
        const fetchedIsOwner = await checkIfOwner(currentSession.user.id);
        
        // Jika belum ada profile, create dengan role null sebagai default
        if (!fetched) {
          const { data: newProfile } = await supabase
            .from('profiles')
            .insert({
              id: currentSession.user.id,
              email: currentSession.user.email,
              role: null
            })
            .select()
            .single();
          setProfile(newProfile);
        } else {
          setProfile(fetched);
        }
        
        setIsOwner(fetchedIsOwner);
        console.log("User ID:", currentSession.user.id);
        console.log("Is user owner?", fetchedIsOwner);
      } catch (err) {
        console.error('Failed loading profile', err)
        setProfile(null)
      }
    } else {
      setProfile(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      load()
    })
    return () => {
      listener.subscription.unsubscribe()
    }
  }, [load])

  const value = useMemo<AuthCtx>(() => ({
    session,
    profile,
    role: profile?.role ?? null,
    loading,
    companyId: profile?.company_id ?? null,
    signOut: async () => {
      await supabase.auth.signOut()
      await load()
    },
    isOwner,
    refresh: load
  }), [session, profile, loading, isOwner, load])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(Ctx)
