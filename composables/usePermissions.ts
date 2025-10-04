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
    canManagePosts: computed(() => auth.isSuperadmin || auth.hasPerm('MANAGE_POSTS')),
    canManageFeatured: computed(() => auth.isSuperadmin || auth.hasPerm('MANAGE_FEATURED')),

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
        'MANAGE_POSTS',
        'MANAGE_FEATURED',
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
    'MANAGE_POSTS': '帖子管理',
    'MANAGE_FEATURED': '精华管理',
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
      permissions: ['MANAGE_POSTS', 'MANAGE_FEATURED']
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
 * 注意：后端已废弃编辑功能，此函数仅保留用于历史兼容
 */
export const canEditContent = (
  createdAt: string,
  creatorId: string,
  currentUserId?: string,
  editTimeLimit = 15 // 15分钟
): boolean => {
  // 编辑功能已废弃，始终返回 false
  return false
}

/**
 * 获取用户权限等级
 */
export const getUserPermissionLevel = (user: any): 'superadmin' | 'admin' | 'content_manager' | 'user' => {
  if (user?.is_superadmin) return 'superadmin'
  
  const permissions = user?.permissions || []
  const adminPerms = ['MANAGE_USERS', 'MANAGE_ANNOUNCEMENTS', 'MANAGE_COMMENTS', 'MANAGE_TAGS']
  const contentPerms = ['MANAGE_POSTS', 'MANAGE_FEATURED']
  
  if (permissions.some((p: string) => adminPerms.includes(p))) {
    return 'admin'
  }
  
  if (permissions.some((p: string) => contentPerms.includes(p))) {
    return 'content_manager'
  }
  
  return 'user'
}
