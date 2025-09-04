<template>
  <div class="min-h-screen p-8">
    <div class="max-w-md mx-auto space-y-4">
      <h1 class="text-2xl font-bold mb-8">Toast 测试页面</h1>
      
      <!-- Simple buttons -->
      <button @click="testSuccess" class="w-full p-3 bg-green-500 text-white rounded">
        测试成功通知
      </button>
      
      <button @click="testError" class="w-full p-3 bg-red-500 text-white rounded">
        测试错误通知
      </button>
      
      <button @click="testWarning" class="w-full p-3 bg-yellow-500 text-white rounded">
        测试警告通知
      </button>
      
      <button @click="testInfo" class="w-full p-3 bg-blue-500 text-white rounded">
        测试信息通知
      </button>
      
      <button @click="testDirect" class="w-full p-3 bg-purple-500 text-white rounded">
        直接调用 Store
      </button>
      
      <!-- Debug info -->
      <div class="mt-8 p-4 bg-gray-100 rounded">
        <h3 class="font-bold">Store 状态:</h3>
        <p>Toast 数量: {{ toastStore.toasts.length }}</p>
        <pre class="text-xs mt-2">{{ JSON.stringify(toastStore.toasts, null, 2) }}</pre>
      </div>
      
      <!-- Manual toast creation -->
      <div class="mt-8 p-4 bg-blue-100 rounded">
        <h3 class="font-bold mb-2">手动创建 Toast:</h3>
        <button @click="createManualToast" class="p-2 bg-gray-800 text-white rounded">
          手动创建
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToastStore } from '~/stores/toast'

const toast = useToast()
const toastStore = useToastStore()

const testSuccess = () => {
  console.log('=== 测试成功通知 ===')
  console.log('Toast store before:', toastStore.toasts)
  const result = toast.success('这是成功通知！')
  console.log('Result:', result)
  console.log('Toast store after:', toastStore.toasts)
}

const testError = () => {
  console.log('=== 测试错误通知 ===')
  console.log('Toast store before:', toastStore.toasts)
  const result = toast.error('这是错误通知！')
  console.log('Result:', result)
  console.log('Toast store after:', toastStore.toasts)
}

const testWarning = () => {
  console.log('=== 测试警告通知 ===')
  console.log('Toast store before:', toastStore.toasts)
  const result = toast.warning('这是警告通知！')
  console.log('Result:', result)
  console.log('Toast store after:', toastStore.toasts)
}

const testInfo = () => {
  console.log('=== 测试信息通知 ===')
  console.log('Toast store before:', toastStore.toasts)
  const result = toast.info('这是信息通知！')
  console.log('Result:', result)
  console.log('Toast store after:', toastStore.toasts)
}

const testDirect = () => {
  console.log('=== 直接调用 Store ===')
  console.log('Toast store before:', toastStore.toasts)
  const result = toastStore.success('直接调用成功！')
  console.log('Result:', result)
  console.log('Toast store after:', toastStore.toasts)
}

const createManualToast = () => {
  console.log('=== 手动创建 Toast ===')
  console.log('Toast store before:', toastStore.toasts)
  const result = toastStore.addToast({
    type: 'success',
    message: '手动创建的Toast',
    title: '手动',
    duration: 5000
  })
  console.log('Result:', result)
  console.log('Toast store after:', toastStore.toasts)
}

onMounted(() => {
  console.log('Simple test page mounted')
  console.log('Toast store:', toastStore)
  console.log('Toast composable:', toast)
})
</script>