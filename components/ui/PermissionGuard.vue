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
import { computed, watch } from 'vue'
import type { PermissionType } from '~/types'

defineOptions({
  name: 'PermissionGuard'
})

interface Props {
  requiredPerms?: PermissionType[]
  anyPerms?: PermissionType[]
  allPerms?: PermissionType[]
  requireSuperadmin?: boolean
  showFallback?: boolean
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
const route = useRoute()

const normalizePerms = (list: readonly PermissionType[]) =>
  list.filter((perm): perm is PermissionType => typeof perm === 'string' && perm.length > 0)

const requiredPerms = computed(() => normalizePerms(props.requiredPerms))
const anyPerms = computed(() => normalizePerms(props.anyPerms))
const allPerms = computed(() => normalizePerms(props.allPerms))

const userPermissions = computed(() => auth.permissions.slice())

const debugGuard = (result: 'allow' | 'deny', reason: string, extra: Record<string, unknown> = {}) => {
  if (!process.dev) return
  console.debug('[PermissionGuard]', {
    route: route.fullPath,
    result,
    reason,
    requireSuperadmin: props.requireSuperadmin,
    superadminBypass: props.superadminBypass,
    required: requiredPerms.value,
    any: anyPerms.value,
    all: allPerms.value,
    userPerms: userPermissions.value,
    isSuperadmin: auth.isSuperadmin,
    ...extra,
  })
}

const hasAccess = computed(() => {
  if (props.superadminBypass && auth.isSuperadmin) {
    debugGuard('allow', 'superadmin bypass')
    return true
  }

  if (props.requireSuperadmin) {
    if (auth.isSuperadmin) {
      debugGuard('allow', 'require superadmin satisfied')
      return true
    }
    debugGuard('deny', 'require superadmin not met')
    return false
  }

  if (requiredPerms.value.length > 0) {
    const missing = requiredPerms.value.filter(perm => !permissions.hasPerm(perm))
    if (missing.length > 0) {
      debugGuard('deny', 'missing required perms', { missing })
      return false
    }
  }

  if (anyPerms.value.length > 0 && !permissions.hasAnyPerm(anyPerms.value)) {
    debugGuard('deny', 'missing any perms')
    return false
  }

  if (allPerms.value.length > 0) {
    const missing = allPerms.value.filter(perm => !permissions.hasPerm(perm))
    if (missing.length > 0) {
      debugGuard('deny', 'missing all perms', { missing })
      return false
    }
  }

  debugGuard('allow', 'passed all checks')
  return true
})

if (process.dev && process.client) {
  watch(hasAccess, (value) => {
    debugGuard(value ? 'allow' : 'deny', 'reactive update')
  })
}
</script>
