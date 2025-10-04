"use client"
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import type { ReactElement } from 'react'

type Role = 'procurement' | 'legal' | 'management'

type Props = {
  children: ReactElement
  allow?: Role[]
}

export default function ProtectedRoute({ children, allow }: Props) {
  const { loading, session, role } = useAuth()

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-[#F5F7FA] text-sm text-slate-500">Loading…</div>
  }

  if (!session) {
    return <Navigate to="/auth/login" replace />
  }

  if (allow && role && !allow.includes(role)) {
    const redirect = role === 'legal' ? '/legal' : role === 'management' ? '/management' : '/procurement'
    return <Navigate to={redirect} replace />
  }

  return children
}
