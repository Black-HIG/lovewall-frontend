<template>
  <aside class="fixed left-0 top-16 bottom-0 w-64 glass-card z-40 transform transition-transform duration-300 ease-in-out" 
         :class="{ '-translate-x-full': !isOpen, 'translate-x-0': isOpen }">
    
    <!-- Mobile overlay -->
    <div 
      v-if="isOpen" 
      class="fixed inset-0 bg-black/50 lg:hidden z-30"
      @click="$emit('close')"
    ></div>
    
    <nav class="h-full overflow-y-auto p-4">
      <!-- Header -->
      <div class="mb-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-2">管理后台</h2>
        <div class="text-sm text-gray-600">
          {{ auth.userDisplayName }}
          <span v-if="auth.isSuperadmin" class="text-red-600 font-medium">（超管）</span>
        </div>
      </div>

      <!-- Navigation Menu -->
      <div class="space-y-2">
        <!-- 概览 - 所有管理员都可访问 -->
        <AdminSidebarItem 
          to="/admin"
          icon="LayoutDashboard"
          title="概览"
          description="系统概况"
        />

        <!-- 表白管理 - 所有管理员都可访问 -->  
        <AdminSidebarItem 
          to="/admin/posts"
          icon="FileText"
          title="表白管理"
          description="审核和管理表白"
        />

        <!-- 用户管理 - 需要权限 -->
        <AdminSidebarItem 
          v-if="canManageUsers"
          to="/admin/users"
          icon="Users"
          title="用户管理"
          description="管理用户账户"
        />

        <!-- 评论管理 - 需要权限 -->
        <AdminSidebarItem 
          v-if="canManageComments"
          to="/admin/comments"
          icon="MessageSquare"
          title="评论管理"
          description="审核用户评论"
        />

        <!-- 公告管理 - 需要权限 -->
        <AdminSidebarItem 
          v-if="canManageAnnouncements"
          to="/admin/announcements"
          icon="Megaphone"
          title="公告管理"
          description="发布系统公告"
        />

        <!-- 标签管理 - 需要权限 -->
        <AdminSidebarItem 
          v-if="canManageTags"
          to="/admin/tags"
          icon="Tag"
          title="标签管理"
          description="管理标签和兑换码"
        />

        <!-- 系统设置 - 超管专用 -->
        <AdminSidebarItem 
          v-if="auth.isSuperadmin"
          to="/admin/system"
          icon="Settings"
          title="系统设置"
          description="系统配置"
        />
      </div>

      <!-- 权限说明 -->
      <div class="mt-8 p-3 bg-blue-50/50 rounded-lg border border-blue-200/30">
        <h4 class="text-sm font-medium text-blue-800 mb-2">当前权限</h4>
        <div class="text-xs text-blue-600 space-y-1">
          <div v-if="auth.isSuperadmin" class="font-medium text-red-600">
            超级管理员 - 拥有所有权限
          </div>
          <template v-else>
            <div v-if="auth.permissions.length === 0" class="text-gray-500">
              暂无特殊权限
            </div>
            <div v-for="perm in auth.permissions" :key="perm" class="flex items-center gap-1">
              <div class="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              {{ getPermissionName(perm) }}
            </div>
          </template>
        </div>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import type { PermissionType } from '~/types'

interface Props {
  isOpen: boolean
}

defineProps<Props>()
defineEmits<{
  close: []
}>()

const auth = useAuthStore()

// 权限检查 computed
const canManageUsers = computed(() => 
  auth.isSuperadmin || auth.hasPerm('MANAGE_USERS')
)

const canManageComments = computed(() => 
  auth.isSuperadmin || auth.hasPerm('MANAGE_COMMENTS')
)

const canManageAnnouncements = computed(() => 
  auth.isSuperadmin || auth.hasPerm('MANAGE_ANNOUNCEMENTS')
)

const canManageTags = computed(() => 
  auth.isSuperadmin || auth.hasPerm('MANAGE_TAGS')
)

// 权限名称映射
const getPermissionName = (perm: string): string => {
  const names: Record<string, string> = {
    'MANAGE_USERS': '用户管理',
    'MANAGE_POSTS': '帖子管理',
    'MANAGE_FEATURED': '精华管理',
    'MANAGE_ANNOUNCEMENTS': '公告管理',
    'MANAGE_COMMENTS': '评论管理',
    'MANAGE_TAGS': '标签管理',
  }
  return names[perm] || perm
}
</script>
