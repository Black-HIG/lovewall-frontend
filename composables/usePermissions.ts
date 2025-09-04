/**
 * 权限管理工具类
 * 提供统一的权限检查和管理功能
 */

import type { PermissionType } from '~/types'

/**
 * 权限检查组合式函数
 */
export const usePermissions = () => {
  const auth = useAuthStore()

  return {
    // 基础权限检查
    hasPerm: (perm: PermissionType): boolean => auth.hasPerm(perm),
    hasAnyPerm: (perms: PermissionType[]): boolean => auth.hasAnyPerm(perms),
    hasAllPerms: (perms: PermissionType[]): boolean => auth.hasAllPerms(perms),
    isSuperadmin: computed(() => auth.isSuperadmin),

    // 具体功能权限检查
    canManageUsers: computed(() => auth.isSuperadmin || auth.hasPerm('MANAGE_USERS')),
    canManageComments: computed(() => auth.isSuperadmin || auth.hasPerm('MANAGE_COMMENTS')),
    canManageAnnouncements: computed(() => auth.isSuperadmin || auth.hasPerm('MANAGE_ANNOUNCEMENTS')),
    canManageTags: computed(() => auth.isSuperadmin || auth.hasPerm('MANAGE_TAGS')),
    canEditPost: computed(() => auth.isSuperadmin || auth.hasPerm('EDIT_POST')),
    canDeletePost: computed(() => auth.isSuperadmin || auth.hasPerm('DELETE_POST')),
    canHidePost: computed(() => auth.isSuperadmin || auth.hasPerm('HIDE_POST')),
    canPinPost: computed(() => auth.isSuperadmin || auth.hasPerm('PIN_POST')),
    canFeaturePost: computed(() => auth.isSuperadmin || auth.hasPerm('FEATURE_POST')),

    // 管理员权限检查 (拥有任一管理权限)
    isAdmin: computed(() => {
      const adminPerms: PermissionType[] = [
        'MANAGE_USERS',
        'MANAGE_ANNOUNCEMENTS', 
        'MANAGE_COMMENTS',
        'MANAGE_TAGS'
      ]
      return auth.isSuperadmin || auth.hasAnyPerm(adminPerms)
    }),

    // 内容管理权限检查
    isContentManager: computed(() => {
      const contentPerms: PermissionType[] = [
        'EDIT_POST',
        'DELETE_POST',
        'HIDE_POST', 
        'PIN_POST',
        'FEATURE_POST',
        'MANAGE_COMMENTS'
      ]
      return auth.isSuperadmin || auth.hasAnyPerm(contentPerms)
    })
  }
}

/**
 * 权限名称映射
 */
export const getPermissionDisplayName = (perm: string): string => {
  const permissionNames: Record<string, string> = {
    'MANAGE_USERS': '用户管理',
    'EDIT_POST': '编辑表白',
    'DELETE_POST': '删除表白', 
    'HIDE_POST': '隐藏表白',
    'PIN_POST': '置顶表白',
    'FEATURE_POST': '精选表白',
    'MANAGE_ANNOUNCEMENTS': '公告管理',
    'MANAGE_COMMENTS': '评论管理',
    'MANAGE_TAGS': '标签管理',
  }
  return permissionNames[perm] || perm
}

/**
 * 权限分组
 */
export const getPermissionGroups = () => {
  return [
    {
      name: '用户管理',
      permissions: ['MANAGE_USERS']
    },
    {
      name: '内容管理',
      permissions: ['EDIT_POST', 'DELETE_POST', 'HIDE_POST', 'PIN_POST', 'FEATURE_POST']
    },
    {
      name: '社区管理', 
      permissions: ['MANAGE_COMMENTS', 'MANAGE_ANNOUNCEMENTS']
    },
    {
      name: '系统管理',
      permissions: ['MANAGE_TAGS']
    }
  ]
}

/**
 * 检查用户是否为内容创建者（可以编辑自己的内容）
 */
export const isContentCreator = (creatorId: string, userId?: string): boolean => {
  if (!userId) return false
  return creatorId === userId
}

/**
 * 检查是否可以编辑内容（限时编辑或有权限）
 */
export const canEditContent = (
  createdAt: string, 
  creatorId: string, 
  currentUserId?: string,
  editTimeLimit = 15 // 15分钟
): boolean => {
  const permissions = usePermissions()
  
  // 有编辑权限直接返回 true
  if (permissions.canEditPost.value) {
    return true
  }
  
  // 检查是否是创建者
  if (!isContentCreator(creatorId, currentUserId)) {
    return false
  }
  
  // 检查时间限制
  const createdTime = new Date(createdAt).getTime()
  const now = Date.now()
  const timeLimit = editTimeLimit * 60 * 1000 // 转换为毫秒
  
  return (now - createdTime) <= timeLimit
}

/**
 * 获取用户权限等级
 */
export const getUserPermissionLevel = (user: any): 'superadmin' | 'admin' | 'content_manager' | 'user' => {
  if (user?.is_superadmin) return 'superadmin'
  
  const permissions = user?.permissions || []
  const adminPerms = ['MANAGE_USERS', 'MANAGE_ANNOUNCEMENTS', 'MANAGE_COMMENTS', 'MANAGE_TAGS']
  const contentPerms = ['EDIT_POST', 'DELETE_POST', 'HIDE_POST', 'PIN_POST', 'FEATURE_POST']
  
  if (permissions.some((p: string) => adminPerms.includes(p))) {
    return 'admin'
  }
  
  if (permissions.some((p: string) => contentPerms.includes(p))) {
    return 'content_manager'
  }
  
  return 'user'
}