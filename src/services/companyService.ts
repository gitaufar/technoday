import supabase from '@/utils/supabase'
import { withAuthCheck } from '@/utils/authHelper'

// Types for Company
export interface Company {
  id: string
  name: string
  code: string
  description?: string
  industry?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  logo_url?: string
  subscription_plan: 'basic' | 'premium' | 'enterprise'
  subscription_status: 'active' | 'suspended' | 'trial'
  subscription_expires_at?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CompanyUser {
  id: number
  company_id: string
  user_id: string
  role: 'procurement' | 'legal' | 'manager'
  is_admin: boolean
  is_primary: boolean
  joined_at: string
  status: 'active' | 'inactive' | 'pending'
  // Joined data
  company?: Company
  user?: {
    id: string
    email: string
    full_name: string
  }
}

export interface CreateCompanyRequest {
  name: string
  code: string
  description?: string
  industry?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  subscription_plan?: 'basic' | 'premium' | 'enterprise'
}

export interface InviteUserRequest {
  email: string
  role: 'procurement' | 'legal' | 'manager'
  is_admin?: boolean
}

/**
 * Get current user's companies
 */
export const getUserCompanies = async (): Promise<CompanyUser[]> => {
  const result = await withAuthCheck(async () => {
    const { data, error } = await supabase
      .from('company_users')
      .select(`
        *,
        company:companies(*),
        user:profiles(id, email, full_name)
      `)
      .eq('status', 'active')
      .order('is_primary', { ascending: false })
      .order('joined_at', { ascending: true })

    if (error) {
      console.error('Error fetching user companies:', error)
      throw error
    }

    return (data || []) as CompanyUser[]
  })
  
  return result || []
}

/**
 * Get current user's primary company
 */
export const getUserPrimaryCompany = async (): Promise<Company | null> => {
  const result = await withAuthCheck(async () => {
    const { data, error } = await supabase
      .from('company_users')
      .select(`
        company:companies(*)
      `)
      .eq('status', 'active')
      .eq('is_primary', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No primary company found
        return null
      }
      console.error('Error fetching primary company:', error)
      throw error
    }

    return (data?.company as unknown as Company) || null
  })
  
  return result || null
}

/**
 * Switch user's primary company
 */
export const switchPrimaryCompany = async (companyId: string): Promise<void> => {
  const result = await withAuthCheck(async () => {
    const { error } = await supabase.rpc('switch_primary_company', {
      new_company_id: companyId
    })

    if (error) {
      console.error('Error switching primary company:', error)
      throw error
    }
    
    return true // Return something to indicate success
  })
  
  if (!result) {
    throw new Error('Authentication failed')
  }
}

/**
 * Get company details by ID
 */
export const getCompanyById = async (companyId: string): Promise<Company> => {
  return withAuthCheck(async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching company:', error)
      throw error
    }

    return data
  })
}

/**
 * Create new company
 */
export const createCompany = async (companyData: CreateCompanyRequest): Promise<Company> => {
  return withAuthCheck(async () => {
    const { data, error } = await supabase
      .from('companies')
      .insert([{
        ...companyData,
        subscription_plan: companyData.subscription_plan || 'basic',
        subscription_status: 'trial',
        is_active: true
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating company:', error)
      throw error
    }

    // Add current user as admin of the new company
    const { error: userError } = await supabase
      .from('company_users')
      .insert([{
        company_id: data.id,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        role: 'manager',
        is_admin: true,
        is_primary: true,
        status: 'active'
      }])

    if (userError) {
      console.error('Error adding user to company:', userError)
      // Don't throw here as company is already created
    }

    return data
  })
}

/**
 * Update company information
 */
export const updateCompany = async (companyId: string, updates: Partial<CreateCompanyRequest>): Promise<Company> => {
  return withAuthCheck(async () => {
    const { data, error } = await supabase
      .from('companies')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', companyId)
      .select()
      .single()

    if (error) {
      console.error('Error updating company:', error)
      throw error
    }

    return data
  })
}

/**
 * Get company users/members
 */
export const getCompanyUsers = async (companyId: string): Promise<CompanyUser[]> => {
  const result = await withAuthCheck(async () => {
    const { data, error } = await supabase
      .from('company_users')
      .select(`
        *,
        user:profiles(id, email, full_name, role)
      `)
      .eq('company_id', companyId)
      .eq('status', 'active')
      .order('is_admin', { ascending: false })
      .order('joined_at', { ascending: true })

    if (error) {
      console.error('Error fetching company users:', error)
      throw error
    }

    return (data || []) as CompanyUser[]
  })
  
  return result || []
}

/**
 * Invite user to company
 */
export const inviteUserToCompany = async (
  companyId: string, 
  inviteData: InviteUserRequest
): Promise<void> => {
  const result = await withAuthCheck(async () => {
    const { error } = await supabase.rpc('invite_user_to_company', {
      user_email: inviteData.email,
      company_uuid: companyId,
      user_role: inviteData.role,
      is_admin_user: inviteData.is_admin || false
    })

    if (error) {
      console.error('Error inviting user to company:', error)
      throw error
    }
    
    return true
  })
  
  if (!result) {
    throw new Error('Authentication failed')
  }
}

/**
 * Remove user from company
 */
export const removeUserFromCompany = async (companyId: string, userId: string): Promise<void> => {
  const result = await withAuthCheck(async () => {
    const { error } = await supabase.rpc('remove_user_from_company', {
      user_uuid: userId,
      company_uuid: companyId
    })

    if (error) {
      console.error('Error removing user from company:', error)
      throw error
    }
    
    return true
  })
  
  if (!result) {
    throw new Error('Authentication failed')
  }
}

/**
 * Update user role in company
 */
export const updateUserRole = async (
  companyId: string, 
  userId: string, 
  role: 'procurement' | 'legal' | 'manager',
  isAdmin: boolean = false
): Promise<void> => {
  const result = await withAuthCheck(async () => {
    const { error } = await supabase
      .from('company_users')
      .update({
        role,
        is_admin: isAdmin
      })
      .eq('company_id', companyId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error updating user role:', error)
      throw error
    }
    
    return true
  })
  
  if (!result) {
    throw new Error('Authentication failed')
  }
}

/**
 * Get company dashboard stats
 */
export const getCompanyDashboard = async (companyId: string) => {
  return withAuthCheck(async () => {
    const { data, error } = await supabase
      .from('company_kpi_summary')
      .select('*')
      .eq('company_id', companyId)
      .single()

    if (error) {
      console.error('Error fetching company dashboard:', error)
      throw error
    }

    return data
  })
}

/**
 * Get company contracts view
 */
export const getCompanyContracts = async (companyId: string) => {
  return withAuthCheck(async () => {
    const { data, error } = await supabase
      .from('company_contracts_view')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching company contracts:', error)
      throw error
    }

    return data || []
  })
}

/**
 * Check if user has access to company
 */
export const checkUserCompanyAccess = async (companyId: string): Promise<boolean> => {
  return withAuthCheck(async () => {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user?.id) return false

    const { data, error } = await supabase.rpc('user_has_company_access', {
      user_uuid: user.user.id,
      company_uuid: companyId
    })

    if (error) {
      console.error('Error checking company access:', error)
      return false
    }

    return data || false
  })
}

/**
 * Get current user's company context (for API calls)
 */
export const getCurrentUserCompanyId = async (): Promise<string | null> => {
  return withAuthCheck(async () => {
    const { data, error } = await supabase.rpc('get_current_user_company')

    if (error) {
      console.error('Error getting current user company:', error)
      return null
    }

    return data || null
  })
}

/**
 * Leave company (for non-admin users)
 */
export const leaveCompany = async (companyId: string): Promise<void> => {
  const result = await withAuthCheck(async () => {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user?.id) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('company_users')
      .delete()
      .eq('company_id', companyId)
      .eq('user_id', user.user.id)

    if (error) {
      console.error('Error leaving company:', error)
      throw error
    }
    
    return true
  })
  
  if (!result) {
    throw new Error('Authentication failed')
  }
}

/**
 * Deactivate company (for admin users)
 */
export const deactivateCompany = async (companyId: string): Promise<void> => {
  const result = await withAuthCheck(async () => {
    const { error } = await supabase
      .from('companies')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', companyId)

    if (error) {
      console.error('Error deactivating company:', error)
      throw error
    }
    
    return true
  })
  
  if (!result) {
    throw new Error('Authentication failed')
  }
}