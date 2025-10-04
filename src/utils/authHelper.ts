import supabase from '@/utils/supabase'

/**
 * Check if current session is valid and handle auth errors
 */
export async function checkAuthSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Auth session error:', error)
      // Force logout and redirect to login if token is invalid
      if (error.message.includes('Invalid Refresh Token') || error.message.includes('Refresh Token Not Found')) {
        await supabase.auth.signOut()
        window.location.href = '/auth/login'
        return null
      }
      throw error
    }
    
    return session
  } catch (error) {
    console.error('Error checking auth session:', error)
    return null
  }
}

/**
 * Wrapper untuk operasi database dengan auth check
 */
export async function withAuthCheck<T>(operation: () => Promise<T>): Promise<T | null> {
  const session = await checkAuthSession()
  
  if (!session) {
    console.warn('No valid session, operation skipped')
    return null
  }
  
  try {
    return await operation()
  } catch (error) {
    // Check if it's an auth-related error
    if (error && typeof error === 'object' && 'message' in error) {
      const message = (error as any).message
      if (message.includes('JWT') || message.includes('token') || message.includes('unauthorized')) {
        console.error('Auth error during operation:', error)
        await supabase.auth.signOut()
        window.location.href = '/auth/login'
        return null
      }
    }
    throw error
  }
}