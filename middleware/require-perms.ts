import type { PermissionType } from '~/types'

const ADMIN_BASE_PERMS: PermissionType[] = [
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
    console.debug('[require-perms]', {
      stage,
      route: routePath,
      userPerms: auth.permissions,
      isSuperadmin: auth.isSuperadmin,
      ...extra,
    })
  }

  const displayName = (perm: PermissionType): string => {
    const map: Record<string, string> = {
      MANAGE_USERS: '用户管理',
      MANAGE_POSTS: '帖子管理',
      MANAGE_FEATURED: '精华管理',
      MANAGE_ANNOUNCEMENTS: '公告管理',
      MANAGE_COMMENTS: '评论管理',
      MANAGE_TAGS: '标签管理',
    }
    return map[perm] || perm
  }

  const formatPerms = (perms: PermissionType[], joiner = '、'): string =>
    perms.map(p => displayName(p)).join(joiner)

  const goBack = (msg?: string) => {
    const toast = useToast()
    toast.error(msg || '无权限访问')
    if (process.client && window.history.length > 1) {
      log('deny: navigate back', { historyLength: window.history.length })
      return navigateTo(-1)
    }
    log('deny: fallback home')
    return navigateTo('/')
  }

  if (!auth.initialized) {
    try {
      await auth.initAuth()
      log('initAuth completed')
    } catch (error) {
      console.warn('[require-perms] initAuth failed', error)
      auth.currentUser = null
      auth.accessToken = null
      auth.permissions = []
    }
  }

  if (!auth.isAuthenticated) {
    log('redirect: login required')
    return navigateTo({ path: '/auth/login', query: { redirect: routePath } })
  }

  const metaPerms = to.meta.requiredPerms as PermissionType | PermissionType[] | undefined
  const requiredPerms: PermissionType[] = Array.isArray(metaPerms)
    ? metaPerms.filter((perm): perm is PermissionType => typeof perm === 'string' && perm.length > 0)
    : metaPerms
      ? [metaPerms]
      : []

  const metaAny = to.meta.anyPerms as PermissionType[] | undefined
  const anyPerms: PermissionType[] = Array.isArray(metaAny)
    ? metaAny.filter((perm): perm is PermissionType => typeof perm === 'string' && perm.length > 0)
    : []

  const metaAll = to.meta.allPerms as PermissionType[] | undefined
  const allPerms: PermissionType[] = Array.isArray(metaAll)
    ? metaAll.filter((perm): perm is PermissionType => typeof perm === 'string' && perm.length > 0)
    : []

  if (auth.isSuperadmin) {
    if (requiredPerms.length || to.meta.requiredPerms) {
      log('allow: superadmin bypass', { requiredPerms })
    } else {
      log('allow: superadmin baseline access')
    }
    return
  }

  if (!requiredPerms.length && !anyPerms.length && !allPerms.length) {
    const hasAdmin = auth.hasAnyPerm(ADMIN_BASE_PERMS)
    log('check: admin baseline', { hasAdmin })
    if (!hasAdmin) {
      return goBack('无权限访问: 需要管理员权限')
    }
    return
  }

  // Check required (all-of)
  if (requiredPerms.length) {
    const hasRequired = auth.hasAllPerms(requiredPerms)
    log('check: required perms', { requiredPerms, hasRequired })
    if (!hasRequired) {
      const missing = requiredPerms.filter(perm => !auth.hasPerm(perm))
      log('deny: missing required perms', { requiredPerms, missing })
      return goBack(`无权限访问: 需要${formatPerms(requiredPerms)}权限`)
    }
  }

  // Check any-of
  if (anyPerms.length) {
    const hasAny = auth.hasAnyPerm(anyPerms)
    log('check: any perms', { anyPerms, hasAny })
    if (!hasAny) {
      log('deny: missing any perms', { anyPerms })
      return goBack(`无权限访问: 需要${formatPerms(anyPerms, '或')}权限`)
    }
  }

  // Check all-of (explicit)
  if (allPerms.length) {
    const hasAll = auth.hasAllPerms(allPerms)
    log('check: all perms', { allPerms, hasAll })
    if (!hasAll) {
      const missing = allPerms.filter(perm => !auth.hasPerm(perm))
      log('deny: missing all perms', { allPerms, missing })
      return goBack(`无权限访问: 需要同时具备${formatPerms(allPerms)}权限`)
    }
  }

  log('allow: perms granted', { requiredPerms, anyPerms, allPerms })
})
