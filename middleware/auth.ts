export default defineNuxtRouteMiddleware(async (to) => {
  // Ensure we're on client side for SPA mode
  if (process.server) return
  
  const auth = useAuthStore()
  
  // Wait for auth initialization if it hasn't happened yet
  if (!auth.isAuthenticated) {
    try {
      await auth.initAuth()
    } catch (error) {
      console.warn('Auth initialization failed in auth middleware:', error)
      // Clear any invalid state
      auth.currentUser = null
      auth.accessToken = null
      auth.permissions = []
    }
  }
  
  if (!auth.isAuthenticated) {
    // Store the intended destination
    const redirect = to.fullPath !== '/' ? to.fullPath : undefined
    
    return navigateTo({
      path: '/auth/login',
      query: redirect ? { redirect } : undefined
    })
  }
})