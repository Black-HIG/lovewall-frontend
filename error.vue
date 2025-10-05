<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="text-center max-w-md mx-auto">
      <GlassCard class="p-8">
        <div class="mb-6">
          <div class="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangleIcon class="w-10 h-10 text-white" />
          </div>
          <h1 class="text-6xl font-bold text-gray-800 mb-2">{{ error.statusCode }}</h1>
          <h2 class="text-xl font-semibold text-gray-700 mb-3">{{ getErrorTitle(error.statusCode) }}</h2>
          <p class="text-gray-600 leading-relaxed">{{ getErrorMessage(error.statusCode) }}</p>
        </div>

        <div class="flex flex-col sm:flex-row gap-3">
          <GlassButton @click="handleError" class="flex-1">
            {{ error.statusCode === 404 ? '返回首页' : '重试' }}
          </GlassButton>
          <GlassButton 
            v-if="error.statusCode !== 404"
            @click="goHome" 
            variant="secondary" 
            class="flex-1"
          >
            返回首页
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangleIcon } from 'lucide-vue-next'

const props = defineProps<{
  error: {
    statusCode: number
    statusMessage?: string
    message?: string
  }
}>()

const getErrorTitle = (statusCode: number) => {
  switch (statusCode) {
    case 404: return '页面未找到'
    case 403: return '访问被拒绝'
    case 401: return '需要登录'
    case 500: return '服务器错误'
    default: return '出错了'
  }
}

const getErrorMessage = (statusCode: number) => {
  switch (statusCode) {
    case 404: return '抱歉，您访问的页面不存在或已被删除。'
    case 403: return '您没有权限访问此页面，请联系管理员。'
    case 401: return '请先登录后再访问此页面。'
    case 500: return '服务器出现了一些问题，请稍后重试。'
    default: return '出现了意外的错误，请稍后重试。'
  }
}

const handleError = () => {
  if (props.error.statusCode === 404) {
    goHome()
  } else {
    // Try to reload the page
    window.location.reload()
  }
}

const goHome = () => {
  navigateTo('/')
}

// Set page title
useHead({
  title: `${props.error.statusCode} - ${getErrorTitle(props.error.statusCode)} - 郑州四中表白墙`
})
</script>