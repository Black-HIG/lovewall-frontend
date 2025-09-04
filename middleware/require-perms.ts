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
      console.warn('Require-perms middleware: initAuth failed', e)
      // Clear any invalid state
      auth.currentUser = null
      auth.accessToken = null
      auth.permissions = []
    }
  }
  
  if (!auth.isAuthenticated) {
    return navigateTo('/auth/login')
  }
  
  // Check if route requires specific permissions
  const requiredPerms = to.meta.requiredPerms as PermissionType[] | undefined
  
  if (!requiredPerms || requiredPerms.length === 0) {
    // If no specific permissions are required, just check for any admin permission
    const hasAnyAdminPerm = auth.isSuperadmin || auth.hasAnyPerm([
      'MANAGE_USERS',
      'EDIT_POST', 
      'DELETE_POST',
      'HIDE_POST',
      'PIN_POST',
      'FEATURE_POST',
      'MANAGE_ANNOUNCEMENTS',
      'MANAGE_COMMENTS',
      'MANAGE_TAGS'
    ])
    
    if (!hasAnyAdminPerm) {
      const toast = useToast()
      toast.error('访问被拒绝：需要管理员权限', '权限不足')
      return navigateTo('/')
    }
    return
  }
  
  // Superadmin has all permissions
  if (auth.isSuperadmin) {
    return
  }
  
  // Check if user has all required permissions
  const hasAllPerms = requiredPerms.every(perm => auth.permissions.includes(perm))
  
  if (!hasAllPerms) {
    const missingPerms = requiredPerms.filter(perm => !auth.permissions.includes(perm))
    const toast = useToast()
    toast.error(`访问被拒绝：缺少权限 ${missingPerms.join(', ')}`, '权限不足')
    
    // Redirect to appropriate fallback
    if (to.path.startsWith('/admin')) {
      return navigateTo('/admin')
    } else {
      return navigateTo('/')
    }
  }
})