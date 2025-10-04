"use client"
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'

export default function OAuthCallback() {
  const { role } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const destination = role === 'legal' ? '/legal' : role === 'management' ? '/management' : '/procurement'
    const timer = setTimeout(() => navigate(destination, { replace: true }), 400)
    return () => clearTimeout(timer)
  }, [role, navigate])

  return <div className="grid min-h-screen place-items-center bg-[#F5F7FA] text-sm text-slate-500">Signing you in…</div>
}
