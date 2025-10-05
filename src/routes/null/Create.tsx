"use client"

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Settings, Plus } from 'lucide-react'

export default function CreateNewCompany() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    companyName: '',
    legalEntityName: '',
    industry: '',
    companyEmail: '',
    companyPhone: '',
    address: '',
    defaultPlan: 'starter',
    contractVisibility: 'organization-wide',
    enableAIRisk: false
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleCreateCompany = () => {
    console.log('Creating company with data:', formData)
    // Logic untuk create company
  }

  const handleCancel = () => {
    navigate('/create-project')
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Create New Company</h1>
        <p className="text-sm text-slate-500">Add a new company to your organization with customized settings and configurations.</p>
      </header>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="p-6 space-y-8">
          
          {/* Company Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#357ABD]" />
              <h2 className="text-lg font-semibold text-slate-900">Company Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="companyName" className="text-sm font-medium text-slate-700">
                  Company Name *
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Enter company name"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-[#357ABD] focus:outline-none focus:ring-1 focus:ring-[#357ABD]"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="legalEntityName" className="text-sm font-medium text-slate-700">
                  Legal Entity Name *
                </label>
                <input
                  type="text"
                  id="legalEntityName"
                  name="legalEntityName"
                  value={formData.legalEntityName}
                  onChange={handleInputChange}
                  placeholder="Enter legal entity name"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-[#357ABD] focus:outline-none focus:ring-1 focus:ring-[#357ABD]"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="industry" className="text-sm font-medium text-slate-700">
                  Industry *
                </label>
                <select
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#357ABD] focus:outline-none focus:ring-1 focus:ring-[#357ABD]"
                >
                  <option value="">Select Industry</option>
                  <option value="technology">Technology</option>
                  <option value="finance">Finance</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="retail">Retail</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="companyEmail" className="text-sm font-medium text-slate-700">
                  Company Email *
                </label>
                <input
                  type="email"
                  id="companyEmail"
                  name="companyEmail"
                  value={formData.companyEmail}
                  onChange={handleInputChange}
                  placeholder="company@example.com"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-[#357ABD] focus:outline-none focus:ring-1 focus:ring-[#357ABD]"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="companyPhone" className="text-sm font-medium text-slate-700">
                  Company Phone
                </label>
                <input
                  type="tel"
                  id="companyPhone"
                  name="companyPhone"
                  value={formData.companyPhone}
                  onChange={handleInputChange}
                  placeholder="+62 xxx-xxxx-xxxx"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-[#357ABD] focus:outline-none focus:ring-1 focus:ring-[#357ABD]"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="address" className="text-sm font-medium text-slate-700">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter company address"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-[#357ABD] focus:outline-none focus:ring-1 focus:ring-[#357ABD]"
                />
              </div>
            </div>
          </div>

          {/* Configuration Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-[#357ABD]" />
              <h2 className="text-lg font-semibold text-slate-900">Configuration</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="defaultPlan" className="text-sm font-medium text-slate-700">
                  Default Plan
                </label>
                <select
                  id="defaultPlan"
                  name="defaultPlan"
                  value={formData.defaultPlan}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#357ABD] focus:outline-none focus:ring-1 focus:ring-[#357ABD]"
                >
                  <option value="starter">Starter</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="contractVisibility" className="text-sm font-medium text-slate-700">
                  Default Contract Visibility
                </label>
                <select
                  id="contractVisibility"
                  name="contractVisibility"
                  value={formData.contractVisibility}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#357ABD] focus:outline-none focus:ring-1 focus:ring-[#357ABD]"
                >
                  <option value="organization-wide">Organization-wide</option>
                  <option value="team-only">Team Only</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-8 border-t border-slate-200 pt-6">
            <button
              type="button"
              onClick={handleCreateCompany}
              className="flex-1 flex-row flex justify-center items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-[#357ABD] rounded-lg hover:bg-[#2e6dad] focus:outline-none focus:ring-2 focus:ring-[#357ABD] focus:ring-offset-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Company
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-6 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#357ABD] focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
            
          </div>
        </div>
      </div>
    </div>
  )
}