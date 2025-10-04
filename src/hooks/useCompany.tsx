import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { type Company, type CompanyUser, getUserCompanies, getUserPrimaryCompany, switchPrimaryCompany, getCurrentUserCompanyId } from '@/services/companyService'
import { useAuth } from '@/auth/AuthProvider'

interface CompanyContextType {
  // Current state
  currentCompany: Company | null
  userCompanies: CompanyUser[]
  currentCompanyId: string | null
  
  // Loading states
  isLoading: boolean
  isCompaniesLoading: boolean
  
  // Actions
  switchCompany: (companyId: string) => Promise<void>
  refreshCompanies: () => Promise<void>
  refreshCurrentCompany: () => Promise<void>
  
  // Utilities
  hasMultipleCompanies: boolean
  isCompanyAdmin: (companyId?: string) => boolean
  getUserCompanyRole: (companyId?: string) => string | null
}

const CompanyContext = createContext<CompanyContextType | null>(null)

interface CompanyProviderProps {
  children: ReactNode
}

export const CompanyProvider = ({ children }: CompanyProviderProps) => {
  const { session, loading: authLoading } = useAuth()
  const user = session?.user || null
  
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null)
  const [userCompanies, setUserCompanies] = useState<CompanyUser[]>([])
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCompaniesLoading, setIsCompaniesLoading] = useState(true)

  // Load user companies
  const loadUserCompanies = async () => {
    if (!user) return
    
    try {
      setIsCompaniesLoading(true)
      const companies = await getUserCompanies()
      setUserCompanies(companies)
    } catch (error) {
      console.error('Error loading user companies:', error)
      setUserCompanies([])
    } finally {
      setIsCompaniesLoading(false)
    }
  }

  // Load current company
  const loadCurrentCompany = async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      
      // Get primary company
      const primaryCompany = await getUserPrimaryCompany()
      setCurrentCompany(primaryCompany)
      
      // Get current company ID for API context
      const companyId = await getCurrentUserCompanyId()
      setCurrentCompanyId(companyId)
      
    } catch (error) {
      console.error('Error loading current company:', error)
      setCurrentCompany(null)
      setCurrentCompanyId(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Switch company
  const handleSwitchCompany = async (companyId: string) => {
    try {
      setIsLoading(true)
      await switchPrimaryCompany(companyId)
      await loadCurrentCompany()
      await loadUserCompanies()
    } catch (error) {
      console.error('Error switching company:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh functions
  const refreshCompanies = async () => {
    await loadUserCompanies()
  }

  const refreshCurrentCompany = async () => {
    await loadCurrentCompany()
  }

  // Utility functions
  const hasMultipleCompanies = userCompanies.length > 1

  const isCompanyAdmin = (companyId?: string): boolean => {
    const targetCompanyId = companyId || currentCompanyId
    if (!targetCompanyId) return false
    
    const companyUser = userCompanies.find(cu => cu.company_id === targetCompanyId)
    return companyUser?.is_admin || false
  }

  const getUserCompanyRole = (companyId?: string): string | null => {
    const targetCompanyId = companyId || currentCompanyId
    if (!targetCompanyId) return null
    
    const companyUser = userCompanies.find(cu => cu.company_id === targetCompanyId)
    return companyUser?.role || null
  }

  // Load data when user changes
  useEffect(() => {
    if (user && !authLoading) {
      loadCurrentCompany()
      loadUserCompanies()
    } else if (!user) {
      setCurrentCompany(null)
      setUserCompanies([])
      setCurrentCompanyId(null)
      setIsLoading(false)
      setIsCompaniesLoading(false)
    }
  }, [user, authLoading])

  const value: CompanyContextType = {
    currentCompany,
    userCompanies,
    currentCompanyId,
    isLoading,
    isCompaniesLoading,
    switchCompany: handleSwitchCompany,
    refreshCompanies,
    refreshCurrentCompany,
    hasMultipleCompanies,
    isCompanyAdmin,
    getUserCompanyRole
  }

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  )
}

// Custom hook to use company context
export const useCompany = (): CompanyContextType => {
  const context = useContext(CompanyContext)
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider')
  }
  return context
}

// Hook for company-specific data fetching
export const useCompanyData = () => {
  const { currentCompanyId, currentCompany, isLoading } = useCompany()
  
  return {
    companyId: currentCompanyId,
    company: currentCompany,
    isLoading,
    hasCompany: !!currentCompanyId,
    // Helper function to add company_id to API calls
    withCompanyId: <T extends Record<string, any>>(data: T) => ({
      ...data,
      company_id: currentCompanyId
    })
  }
}