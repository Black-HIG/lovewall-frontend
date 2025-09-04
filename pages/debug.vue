<template>
  <div class="content-container py-8">
    <div class="max-w-2xl mx-auto space-y-8">
      <!-- Debug Info -->
      <div class="glass-card p-6">
        <h2 class="text-xl font-bold mb-4">调试信息</h2>
        
        <div class="space-y-3">
          <div class="flex justify-between">
            <span>认证状态:</span>
            <span :class="auth.isAuthenticated ? 'text-green-600' : 'text-red-600'">
              {{ auth.isAuthenticated ? '已登录' : '未登录' }}
            </span>
          </div>
          
          <div class="flex justify-between">
            <span>用户信息:</span>
            <span>{{ auth.currentUser ? auth.userDisplayName : '无' }}</span>
          </div>
          
          <div class="flex justify-between">
            <span>超级管理员:</span>
            <span :class="auth.isSuperadmin ? 'text-green-600' : 'text-gray-600'">
              {{ auth.isSuperadmin ? '是' : '否' }}
            </span>
          </div>
          
          <div class="flex justify-between">
            <span>权限数量:</span>
            <span>{{ auth.permissions.length }}</span>
          </div>
          
          <div class="flex justify-between">
            <span>Token:</span>
            <span class="text-xs">{{ auth.accessToken ? auth.accessToken.substring(0, 20) + '...' : '无' }}</span>
          </div>
        </div>
      </div>

      <!-- Toast Test -->
      <div class="glass-card p-6">
        <h2 class="text-xl font-bold mb-4">通知测试</h2>
        
        <div class="grid grid-cols-2 gap-4">
          <button @click="testSuccess" class="glass-button bg-green-50/20 border-green-200/50 text-green-800">
            成功通知
          </button>
          
          <button @click="testError" class="glass-button bg-red-50/20 border-red-200/50 text-red-800">
            错误通知
          </button>
          
          <button @click="testWarning" class="glass-button bg-amber-50/20 border-amber-200/50 text-amber-800">
            警告通知
          </button>
          
          <button @click="testInfo" class="glass-button bg-blue-50/20 border-blue-200/50 text-blue-800">
            信息通知
          </button>
          
          <button @click="testDirect" class="glass-button bg-purple-50/20 border-purple-200/50 text-purple-800 col-span-2">
            直接调用Store
          </button>
        </div>
        
        <!-- Toast Store Debug Info -->
        <div class="mt-4 p-4 bg-gray-50/50 rounded-lg">
          <h3 class="font-bold mb-2">Toast Store 状态:</h3>
          <div class="text-sm">
            <p>Toasts 数量: {{ toastStore.toasts.length }}</p>
            <p>Toasts 内容:</p>
            <pre class="mt-1 text-xs overflow-auto">{{ JSON.stringify(toastStore.toasts, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="glass-card p-6">
        <h2 class="text-xl font-bold mb-4">操作</h2>
        
        <div class="space-y-3">
          <button @click="refreshAuth" class="glass-button w-full">
            刷新认证状态
          </button>
          
          <button @click="goToMe" class="glass-button w-full">
            前往个人中心
          </button>
          
          <button @click="goToAdmin" class="glass-button w-full">
            前往管理后台
          </button>
          
          <button @click="testLogin" class="glass-button w-full">
            测试登录状态
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore()
const toast = useToast()
const toastStore = useToastStore()
const router = useRouter()

// Test toast notifications
const testSuccess = () => {
  console.log('Testing success toast...')
  console.log('Toast store before:', toastStore.toasts)
  const result = toast.success('这是一个成功通知！', '成功')
  console.log('Toast success result:', result)
  console.log('Toast store after:', toastStore.toasts)
}

const testError = () => {
  console.log('Testing error toast...')
  console.log('Toast store before:', toastStore.toasts)
  const result = toast.error('这是一个错误通知！', '错误')
  console.log('Toast error result:', result)
  console.log('Toast store after:', toastStore.toasts)
}

const testWarning = () => {
  console.log('Testing warning toast...')
  console.log('Toast store before:', toastStore.toasts)
  const result = toast.warning('这是一个警告通知！', '警告')
  console.log('Toast warning result:', result)
  console.log('Toast store after:', toastStore.toasts)
}

const testInfo = () => {
  console.log('Testing info toast...')
  console.log('Toast store before:', toastStore.toasts)
  const result = toast.info('这是一个信息通知！', '信息')
  console.log('Toast info result:', result)
  console.log('Toast store after:', toastStore.toasts)
}

const testDirect = () => {
  console.log('Testing direct store call...')
  console.log('Toast store before:', toastStore.toasts)
  const result = toastStore.success('直接调用store的成功通知！')
  console.log('Direct store result:', result)
  console.log('Toast store after:', toastStore.toasts)
}

// Actions
const refreshAuth = async () => {
  try {
    await auth.initAuth()
    toast.success('认证状态已刷新')
  } catch (error: any) {
    toast.error('刷新认证状态失败: ' + error.message)
  }
}

const goToMe = async () => {
  try {
    await router.push('/me')
  } catch (error: any) {
    toast.error('跳转失败: ' + error.message)
  }
}

const goToAdmin = async () => {
  try {
    await router.push('/admin')
  } catch (error: any) {
    toast.error('跳转失败: ' + error.message)
  }
}

const testLogin = () => {
  console.log('Auth state:', {
    isAuthenticated: auth.isAuthenticated,
    currentUser: auth.currentUser,
    isSuperadmin: auth.isSuperadmin,
    permissions: auth.permissions,
    accessToken: auth.accessToken
  })
  
  if (auth.isAuthenticated) {
    toast.success('您已登录')
  } else {
    toast.warning('您尚未登录')
  }
}

// Initialize
onMounted(() => {
  console.log('Debug page mounted, auth state:', auth.$state)
  console.log('Toast store on mount:', toastStore.$state)
})

// Page meta
definePageMeta({
  title: '调试页面 - Love Wall',
})
</script>