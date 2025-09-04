<template>
  <Transition
    enter-active-class="transition-all duration-500 ease-out"
    enter-from-class="opacity-0 translate-x-full scale-95"
    enter-to-class="opacity-100 translate-x-0 scale-100"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="opacity-100 translate-x-0 scale-100"
    leave-to-class="opacity-0 translate-x-full scale-95"
  >
    <div
      v-if="visible"
      class="toast-item"
      :class="[
        'flex items-center gap-3 px-6 py-3 rounded-2xl backdrop-blur-md shadow-xl border min-w-80 transform transition-all',
        toastStyles[type]
      ]"
    >
      <!-- Icon -->
      <div class="flex-shrink-0">
        <CheckCircleIcon v-if="type === 'success'" class="w-5 h-5" />
        <XCircleIcon v-else-if="type === 'error'" class="w-5 h-5" />
        <AlertCircleIcon v-else-if="type === 'warning'" class="w-5 h-5" />
        <InfoIcon v-else class="w-5 h-5" />
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <p v-if="title" class="font-medium text-base leading-tight mb-1">{{ title }}</p>
        <p class="text-base leading-tight opacity-90">{{ message }}</p>
      </div>

      <!-- Close button -->
      <button
        @click="$emit('close')"
        class="flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors"
      >
        <XIcon class="w-4 h-4 opacity-70" />
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { CheckCircleIcon, XCircleIcon, AlertCircleIcon, InfoIcon, XIcon } from 'lucide-vue-next'

export interface ToastProps {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  visible?: boolean
}

defineProps<ToastProps>()
defineEmits<{
  close: []
}>()

const toastStyles = {
  success: 'bg-green-50/95 border-green-200/50 text-green-800',
  error: 'bg-red-50/95 border-red-200/50 text-red-800',
  warning: 'bg-amber-50/95 border-amber-200/50 text-amber-800',
  info: 'bg-blue-50/95 border-blue-200/50 text-blue-800',
}
</script>

<style scoped>
.toast-item {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
</style>