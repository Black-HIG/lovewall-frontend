<template>
  <div
    v-if="status !== null"
    class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors"
    :class="status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'"
    :title="statusText"
  >
    <span
      class="w-1.5 h-1.5 rounded-full"
      :class="status ? 'bg-green-500' : 'bg-gray-400'"
    ></span>
    <span>{{ status ? '在线' : '离线' }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps<{
  userId: string
}>()

const status = ref<boolean | null>(null)
const lastHeartbeat = ref<string | null>(null)
let pollingTimer: ReturnType<typeof setInterval> | null = null

const statusText = computed(() => {
  if (status.value === null) return '加载中...'
  if (status.value) return '用户在线'
  if (lastHeartbeat.value) {
    return `最后活跃: ${formatTime(lastHeartbeat.value)}`
  }
  return '用户离线'
})

const formatTime = (isoTime: string): string => {
  const date = new Date(isoTime)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()

  if (Number.isNaN(diffMs) || diffMs < 0) return '刚刚'

  const diffMinutes = Math.floor(diffMs / 60000)
  if (diffMinutes < 1) return '刚刚'
  if (diffMinutes < 60) return `${diffMinutes} 分钟前`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} 小时前`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} 天前`
}

const fetchOnlineStatus = async () => {
  if (!props.userId) {
    status.value = null
    lastHeartbeat.value = null
    return
  }

  try {
    const api = useApi()
    const data = await api.getUserOnlineStatus(props.userId)
    status.value = data.online ?? false
    lastHeartbeat.value = data.last_heartbeat ?? null
  } catch (error) {
    // 静默失败，保持徽章隐藏
    status.value = null
    lastHeartbeat.value = null
  }
}

const stopPolling = () => {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
  }
}

const startPolling = () => {
  stopPolling()
  fetchOnlineStatus()
  pollingTimer = setInterval(() => {
    fetchOnlineStatus()
  }, 60000)
}

onMounted(() => {
  if (props.userId) {
    startPolling()
  }
})

onUnmounted(() => {
  stopPolling()
})

watch(() => props.userId, (newUserId, oldUserId) => {
  if (newUserId === oldUserId) return
  status.value = null
  lastHeartbeat.value = null
  if (!newUserId) {
    stopPolling()
    return
  }
  startPolling()
})
</script>
