import type { PermissionType } from '~/types'

const BASE_ADMIN_PERMS: PermissionType[] = [
  'MANAGE_USERS',
  'MANAGE_POSTS',
  'MANAGE_FEATURED',
  'MANAGE_ANNOUNCEMENTS',
  'MANAGE_COMMENTS',
  'MANAGE_TAGS',
]

export default defineNuxtRouteMiddleware(async (to) => {
  if (process.server) return

  const auth = useAuthStore()
  const routePath = to.fullPath

  const log = (stage: string, extra: Record<string, unknown> = {}) => {
    if (!process.dev) return
    console.debug('[admin:mw]', {
      stage,
      route: routePath,
      authed: auth.isAuthenticated,
      isSuperadmin: auth.isSuperadmin,
      perms: auth.permissions,
      ...extra,
    })
  }

  const goBack = (reason: string) => {
    const toast = useToast()
    toast.error('无权限访问')
    if (process.client && window.history.length > 1) {
      log(reason, { action: 'navigate back', historyLength: window.history.length })
      return navigateTo(-1)
    }
    log(reason, { action: 'fallback home' })
    return navigateTo('/')
  }

  if (!auth.initialized) {
    try {
      await auth.initAuth()
      log('initAuth completed')
    } catch (error) {
      console.warn('[admin:mw] initAuth failed', error)
      auth.currentUser = null
      auth.accessToken = null
      auth.permissions = []
    }
  }

  if (!auth.isAuthenticated) {
    const redirect = to.fullPath !== '/' ? to.fullPath : undefined
    log('redirect: login required', { redirect })
    return navigateTo({ path: '/auth/login', query: redirect ? { redirect } : undefined })
  }

  if (auth.isSuperadmin) {
    log('allow: superadmin baseline')
  } else {
    const hasAdmin = auth.hasAnyPerm(BASE_ADMIN_PERMS)
    log('check: admin baseline', { hasAdmin })
    if (!hasAdmin) {
      return goBack('deny: lacks admin baseline')
    }
  }

  const metaPerms = to.meta.requiredPerms as PermissionType | PermissionType[] | undefined
  const requiredPerms: PermissionType[] = Array.isArray(metaPerms)
    ? metaPerms.filter((perm): perm is PermissionType => typeof perm === 'string' && perm.length > 0)
    : metaPerms
      ? [metaPerms]
      : []

  if (requiredPerms.length === 0) {
    log('allow: no additional perms required')
    return
  }

  if (auth.isSuperadmin) {
    log('allow: superadmin bypass for additional perms', { requiredPerms })
    return
  }

  const hasRoutePerms = auth.hasAllPerms(requiredPerms)
  log('check: route perms', { requiredPerms, hasRoutePerms })

  if (!hasRoutePerms) {
    const missing = requiredPerms.filter(perm => !auth.hasPerm(perm))
    log('deny: missing route perms', { requiredPerms, missing })
    return goBack('deny: missing route perms')
  }

  log('allow: route perms granted', { requiredPerms })
})
