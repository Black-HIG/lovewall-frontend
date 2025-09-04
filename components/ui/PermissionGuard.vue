<template>
  <!-- 权限包装器组件：只在有权限时显示内容 -->
  <template v-if="hasAccess">
    <slot :permissions="userPermissions" :isSuperadmin="auth.isSuperadmin" />
  </template>
  
  <!-- 无权限时的占位内容 -->
  <template v-else-if="showFallback && $slots.fallback">
    <slot name="fallback" />
  </template>
</template>

<script setup lang="ts">
import type { PermissionType } from '~/types'

interface Props {
  // 必需的权限列表
  requiredPerms?: PermissionType[]
  // 需要满足的任一权限
  anyPerms?: PermissionType[] 
  // 需要满足的所有权限
  allPerms?: PermissionType[]
  // 是否需要超管权限
  requireSuperadmin?: boolean
  // 是否显示无权限时的占位内容
  showFallback?: boolean
  // 是否允许超管绕过权限检查
  superadminBypass?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  requiredPerms: () => [],
  anyPerms: () => [],
  allPerms: () => [],
  requireSuperadmin: false,
  showFallback: true,
  superadminBypass: true,
})

const auth = useAuthStore()
const permissions = usePermissions()

// 用户权限列表
const userPermissions = computed(() => auth.permissions)

// 权限检查逻辑
const hasAccess = computed(() => {
  // 超管绕过检查
  if (props.superadminBypass && auth.isSuperadmin) {
    return true
  }
  
  // 必需超管权限
  if (props.requireSuperadmin) {
    return auth.isSuperadmin
  }
  
  // 检查必需权限
  if (props.requiredPerms.length > 0) {
    const hasRequired = props.requiredPerms.every(perm => auth.hasPerm(perm))
    if (!hasRequired) return false
  }
  
  // 检查任一权限
  if (props.anyPerms.length > 0) {
    const hasAny = auth.hasAnyPerm(props.anyPerms)
    if (!hasAny) return false
  }
  
  // 检查所有权限
  if (props.allPerms.length > 0) {
    const hasAll = auth.hasAllPerms(props.allPerms)
    if (!hasAll) return false
  }
  
  return true
})
</script>