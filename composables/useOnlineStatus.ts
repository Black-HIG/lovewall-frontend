export const useOnlineStatus = () => {
  const isOnline = ref(false)
  const expiresAt = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const checkOnlineStatus = async () => {
    loading.value = true
    error.value = null
    
    try {
      const api = useApi()
      const response = await api.getOnlineStatus()
      isOnline.value = response.online
      expiresAt.value = response.expires_at || null
    } catch (err: any) {
      error.value = err.message || '检查在线状态失败'
      isOnline.value = false
      expiresAt.value = null
    } finally {
      loading.value = false
    }
  }

  // 计算到期时间的人性化显示
  const timeToExpiry = computed(() => {
    if (!expiresAt.value) return null
    
    const now = new Date()
    const expiry = new Date(expiresAt.value)
    const diff = expiry.getTime() - now.getTime()
    
    if (diff <= 0) return '已过期'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}小时${minutes}分钟后过期`
    } else if (minutes > 0) {
      return `${minutes}分钟后过期`
    } else {
      return '即将过期'
    }
  })

  // 自动检查在线状态（每5分钟）
  const startAutoCheck = () => {
    checkOnlineStatus() // 立即检查一次
    const interval = setInterval(checkOnlineStatus, 5 * 60 * 1000) // 5分钟
    
    // 清理定时器
    onUnmounted(() => {
      clearInterval(interval)
    })
    
    return interval
  }

  return {
    isOnline: readonly(isOnline),
    expiresAt: readonly(expiresAt),
    loading: readonly(loading),
    error: readonly(error),
    timeToExpiry,
    checkOnlineStatus,
    startAutoCheck
  }
}