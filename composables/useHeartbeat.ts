// Heartbeat service composable keeps the user session marked as online.
let heartbeatTimer: ReturnType<typeof setInterval> | null = null
let isRunning = false

export function useHeartbeat() {
  const api = useApi()
  const auth = useAuthStore()

  const stopHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
    isRunning = false
  }

  const sendHeartbeat = async () => {
    if (!auth.isAuthenticated) {
      stopHeartbeat()
      return
    }

    try {
      await api.heartbeat()
    } catch (error) {
      // Silence production errors, only log in dev for debugging.
      if (import.meta.dev) {
        console.warn('[Heartbeat] Failed to send heartbeat:', error)
      }
    }
  }

  const startHeartbeat = () => {
    if (isRunning || heartbeatTimer) {
      return
    }

    void sendHeartbeat()
    heartbeatTimer = setInterval(() => {
      void sendHeartbeat()
    }, 30000)

    isRunning = true
  }

  return {
    startHeartbeat,
    stopHeartbeat,
    isRunning: () => isRunning,
  }
}
