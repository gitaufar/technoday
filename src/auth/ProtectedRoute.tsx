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

  // Special case: /create-project is ONLY for users with null role
  // Even owner cannot access this route
  if (allow && allow.length === 1 && allow[0] === null) {
    if (role !== null) {
      // Redirect owner or role users to their appropriate dashboard
      const redirect = isOwner ? '/owner' : '/role'
      return <Navigate to={redirect} replace />
    }
  }

  // Special case: If there's an allow list and owner is not in it, block owner
  // This ensures owner can only access routes that explicitly include 'owner' in allow array
  // or routes without any allow restrictions
  if (allow && allow.length > 0 && isOwner) {
    const hasOwnerInAllow = allow.includes('owner' as Role)
    if (!hasOwnerInAllow) {
      return <Navigate to="/owner" replace />
    }
  }

  // If owner is accessing a route that explicitly allows owner (or no restrictions), allow it
  if (isOwner && (!allow || allow.includes('owner' as Role))) {
    return children
  }

  // Check if user is allowed to access this route based on their role
  if (allow && !allow.includes(role)) {
    // Redirect to appropriate dashboard based on role
    let redirect = '/create-project' // Default untuk role null
    
    if (isOwner) {
      redirect = '/owner'
    } else if (role === null) {
      redirect = '/create-project'
    } else {
      redirect = '/role'
    }
    
    return <Navigate to={redirect} replace />
  }

  return children
}