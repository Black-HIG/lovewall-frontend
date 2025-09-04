<template>
  <div class="space-y-4">
    <!-- 权限等级徽章 -->
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2">
        <div 
          class="w-3 h-3 rounded-full" 
          :class="levelIndicatorClass"
        ></div>
        <span class="font-medium text-gray-800">{{ levelDisplayName }}</span>
      </div>
      
      <span v-if="auth.isSuperadmin" class="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full font-medium">
        超级管理员
      </span>
    </div>

    <!-- 权限列表 -->
    <div v-if="!auth.isSuperadmin && auth.permissions.length > 0" class="space-y-3">
      <h4 class="text-sm font-medium text-gray-700">拥有权限：</h4>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div 
          v-for="group in permissionGroups"
          :key="group.name"
          class="space-y-2"
        >
          <div class="text-xs font-medium text-gray-600 uppercase tracking-wide">
            {{ group.name }}
          </div>
          
          <div class="space-y-1">
            <div 
              v-for="perm in group.permissions"
              :key="perm"
              :class="userPermissions.includes(perm) ? 'text-green-600' : 'text-gray-400'"
              class="flex items-center gap-2 text-sm"
            >
              <CheckCircleIcon 
                v-if="userPermissions.includes(perm)"
                class="w-4 h-4 text-green-500" 
              />
              <XCircleIcon 
                v-else
                class="w-4 h-4 text-gray-300" 
              />
              <span>{{ getPermissionDisplayName(perm) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 无权限提示 -->
    <div v-else-if="!auth.isSuperadmin && auth.permissions.length === 0" 
         class="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div class="flex items-center gap-2 text-gray-600">
        <InfoIcon class="w-4 h-4" />
        <span class="text-sm">当前账户暂无特殊权限</span>
      </div>
    </div>

    <!-- 超管说明 -->
    <div v-if="auth.isSuperadmin" 
         class="p-4 bg-red-50 rounded-lg border border-red-200">
      <div class="flex items-center gap-2 text-red-600">
        <ShieldCheckIcon class="w-4 h-4" />
        <span class="text-sm font-medium">超级管理员拥有所有系统权限</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  CheckCircleIcon,
  XCircleIcon,
  InfoIcon,
  ShieldCheckIcon
} from 'lucide-vue-next'

const auth = useAuthStore()
const permissions = usePermissions()

// 用户权限列表
const userPermissions = computed(() => auth.permissions)

// 权限等级
const userLevel = computed(() => {
  if (auth.isSuperadmin) return 'superadmin'
  if (permissions.isAdmin.value) return 'admin'
  if (permissions.isContentManager.value) return 'content_manager'
  return 'user'
})

// 等级显示名称
const levelDisplayName = computed(() => {
  const names = {
    superadmin: '超级管理员',
    admin: '管理员',
    content_manager: '内容管理员', 
    user: '普通用户'
  }
  return names[userLevel.value]
})

// 等级指示器样式
const levelIndicatorClass = computed(() => {
  const classes = {
    superadmin: 'bg-red-500',
    admin: 'bg-blue-500',
    content_manager: 'bg-green-500',
    user: 'bg-gray-400'
  }
  return classes[userLevel.value]
})

// 权限分组
const permissionGroups = computed(() => getPermissionGroups())
</script>