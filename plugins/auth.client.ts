export default defineNuxtPlugin(async () => {
  // 初始化认证状态
  const auth = useAuthStore()
  
  try {
    // 在客户端初始化时恢复用户认证状态
    await auth.initAuth()
  } catch (error) {
    console.warn('Auth initialization failed:', error)
  }
})