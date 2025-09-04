<template>
  <div class="content-container py-8">
    <div class="max-w-2xl mx-auto space-y-8">
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">通知测试</h1>
        <p class="text-gray-600 mt-2">测试不同类型的通知效果</p>
      </div>

      <!-- Test Buttons -->
      <GlassCard class="p-8">
        <div class="grid grid-cols-2 gap-4">
          <button
            @click="showSuccess"
            class="glass-button bg-green-50/20 border-green-200/50 text-green-800"
          >
            成功通知
          </button>
          
          <button
            @click="showError"
            class="glass-button bg-red-50/20 border-red-200/50 text-red-800"
          >
            错误通知
          </button>
          
          <button
            @click="showWarning"
            class="glass-button bg-amber-50/20 border-amber-200/50 text-amber-800"
          >
            警告通知
          </button>
          
          <button
            @click="showInfo"
            class="glass-button bg-blue-50/20 border-blue-200/50 text-blue-800"
          >
            信息通知
          </button>
          
          <button
            @click="showMultiple"
            class="glass-button col-span-2"
          >
            显示多个通知（测试堆叠效果）
          </button>
        </div>
      </GlassCard>
    </div>
  </div>
</template>

<script setup lang="ts">
const toast = useToast()

const showSuccess = () => {
  toast.success('操作成功完成！', '成功')
}

const showError = () => {
  toast.error('操作失败，请稍后重试', '错误')
}

const showWarning = () => {
  toast.warning('请注意，这可能影响您的数据', '警告')
}

const showInfo = () => {
  toast.info('这是一条信息提示', '提示')
}

const showMultiple = () => {
  toast.success('第一个通知')
  setTimeout(() => toast.warning('第二个通知'), 200)
  setTimeout(() => toast.info('第三个通知'), 400)
  setTimeout(() => toast.error('第四个通知（会替换第一个）'), 600)
}

// Page meta
definePageMeta({
  title: '通知测试 - Love Wall',
  middleware: 'auth',
})</script>