"use client"

import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'

export default function OrganizationDashboard() {
  const navigate = useNavigate()

  const handleCreateCompany = () => {
    // Logic untuk create company - bisa redirect ke form atau modal
    navigate('/create-project/create')
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Organization Dashboard</h1>
        <p className="text-sm text-slate-500">Manage your organization, teams, and billing settings.</p>
      </header>     
      
      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm h-full">

        <div className="flex flex-col gap-3 px-6 pt-8 pb-1 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Company Management</h2>    
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-[8px] bg-[#357ABD] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2e6dad] hover:cursor-pointer"
              onClick={handleCreateCompany}
            >
              <Plus className="h-4 w-4" />
              Create New Company    
            </button>
          </div>
        </div>

        <div className="bg-[#F5F7FA] m-8 rounded-lg py-6 text-center text-white">
            <div className="flex flex-col items-center justify-center py-20">
                <div className="mb-6 grid h-16 w-16 place-items-center rounded-full border-2 border-slate-900">
                    <Plus className="h-8 w-8 text-slate-900" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Set Up Your Company</h3>
                <p className="text-sm text-slate-500 mb-6 text-center max-w-md">
                    Get started by creating your company profile. This will help you manage contracts, teams, and billing settings.
                </p>
            </div>
        </div>

    </section>
  </div>
  )
}