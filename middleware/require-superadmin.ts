import type { PermissionType } from '~/types'

export default defineNuxtRouteMiddleware(async (to) => {
  // Run only on client
  if (process.server) return

  const auth = useAuthStore()
  
  // Ensure auth state is initialized
  if (!auth.isAuthenticated) {
    try {
      await auth.initAuth()
    } catch (e) {
      console.warn('Require-superadmin middleware: initAuth failed', e)
      // Clear any invalid state
      auth.currentUser = null
      auth.accessToken = null
      auth.permissions = []
    }
  }
  
  if (!auth.isAuthenticated) {
    const redirect = to.fullPath !== '/' ? to.fullPath : undefined
    return navigateTo({ path: '/auth/login', query: redirect ? { redirect } : undefined })
  }
  
  // Only superadmin can access
  if (!auth.isSuperadmin) {
    const toast = useToast()
    toast.error('无权限访问：需要超级管理员权限')
    if (process.client && window.history.length > 1) {
      return navigateTo(-1)
    }
    return navigateTo('/')
  }
})
