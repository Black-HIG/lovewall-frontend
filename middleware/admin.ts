import type { PermissionType } from '~/types'

export default defineNuxtRouteMiddleware(async (to) => {
  // Run only on client
  if (process.server) return

  const auth = useAuthStore()
  // Debug trace to help diagnose navigation issues
  console.debug('[admin:mw] entering', { path: to.fullPath, authed: auth.isAuthenticated })

  // Ensure auth state is initialized
  if (!auth.isAuthenticated) {3
    try {
      await auth.initAuth()
    } catch (e) {
      // ignore init errors; will redirect below
      console.warn('Admin middleware: initAuth failed', e)
      // Clear any invalid state
      auth.currentUser = null
      auth.accessToken = null
      auth.permissions = []
    }
  }

  // Require login
  if (!auth.isAuthenticated) {
    const redirect = to.fullPath !== '/' ? to.fullPath : undefined
    console.debug('[admin:mw] not authenticated, redirecting to login', { redirect })
    return navigateTo({ path: '/auth/login', query: redirect ? { redirect } : undefined })
  }

  // Require admin-level access
  const baseAdminPerms: PermissionType[] = [
    'MANAGE_USERS',
    'MANAGE_ANNOUNCEMENTS',
    'MANAGE_COMMENTS',
    'MANAGE_TAGS',
  ]
  const hasAdmin = auth.isSuperadmin || auth.hasAnyPerm(baseAdminPerms)
  if (!hasAdmin) {
    console.debug('[admin:mw] lacks admin privileges', { isSuperadmin: auth.isSuperadmin, perms: auth.permissions })
    
    // Use toast notification instead of throwing error
    const toast = useToast()
    toast.error('访问被拒绝：需要管理员权限', '权限不足')
    
    // Redirect to home instead of showing error page
    return navigateTo('/')
  }

  // Optional page-specific permissions via route meta
  const requiredPerms = (to.meta.requiredPerms as PermissionType[] | undefined) ?? []
  if (!auth.isSuperadmin && requiredPerms.length > 0) {
    const ok = requiredPerms.every((p) => auth.permissions.includes(p))
    if (!ok) {
      console.debug('[admin:mw] missing required perms', { requiredPerms, have: auth.permissions })
      
      const toast = useToast()
      toast.error('访问被拒绝：权限不足', '权限不足')
      
      return navigateTo('/admin')
    }
  }
  console.debug('[admin:mw] passed')
})
