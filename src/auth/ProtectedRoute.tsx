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
  const { loading, session, role, isOwner } = useAuth()

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-[#F5F7FA] text-sm text-slate-500">Loading…</div>
  }

  if (!session) {
    return <Navigate to="/auth/login" replace />
  }

  // Owner can access all routes
  if (isOwner) {
    return children
  }

  // Check if user has required role
  if (allow && role && !allow.includes(role)) {
    // Redirect to user's designated role route or dashboard
    const redirect = role === 'legal' ? '/legal' : role === 'management' ? '/management' : role === 'procurement' ? '/procurement' : '/dashboard'
    return <Navigate to={redirect} replace />
  }

  // If no role and not owner, redirect to dashboard
  if (allow && !role) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
