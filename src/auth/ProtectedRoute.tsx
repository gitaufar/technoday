"use client"
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import type { ReactElement } from 'react'

type Role = 'procurement' | 'legal' | 'management' | 'owner' | null

type Props = {
  children: ReactElement
  allow?: Role[]
}

export default function ProtectedRoute({ children, allow }: Props) {
  const { loading, session, role, isOwner } = useAuth()

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-[#F5F7FA] text-sm text-slate-500">Loading…</div>
  }

  if (!session) {
    return <Navigate to="/auth/login" replace />
  }

  if (allow && !allow.includes(role)) {
    const redirect = role === 'legal' ? '/legal' 
                   : role === 'management' ? '/management' 
                   : role === 'procurement' ? '/procurement'
                   : role === 'owner' ? '/owner'
                   : '/create-project' // Default untuk role null
    return <Navigate to={redirect} replace />
  }

  // If no role and not owner, redirect to dashboard
  if (allow && !role) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}