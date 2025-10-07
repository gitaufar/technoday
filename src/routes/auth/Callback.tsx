"use client"
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'

export default function OAuthCallback() {
  const { role, isOwner } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    let destination = '/create-project' // Default untuk role null
    
    if (isOwner) {
      destination = '/owner'
    } else if (role === null) {
      destination = '/create-project'
    } else {
      destination = '/role'
    }

    const timer = setTimeout(() => navigate(destination, { replace: true }), 400)
    return () => clearTimeout(timer)
  }, [role, isOwner, navigate])

  return <div className="grid min-h-screen place-items-center bg-[#F5F7FA] text-sm text-slate-500">Signing you in…</div>
}