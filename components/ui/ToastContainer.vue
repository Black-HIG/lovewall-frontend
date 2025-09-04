<template>
  <div class="fixed top-20 right-4 z-[999999] space-y-3 pointer-events-none">
    <div
      v-for="(toast, index) in visibleToasts"
      :key="toast.id"
      :style="{ 
        transform: `translateY(${index * 4}px) scale(${1 - index * 0.02})`,
        zIndex: 999999 - index
      }"
      class="pointer-events-auto"
    >
      <Toast
        v-bind="toast"
        @close="removeToast(toast.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToastStore } from '~/stores/toast'
import Toast from './Toast.vue'

const toastStore = useToastStore()
const visibleToasts = computed(() => {
  console.log('ToastContainer computed - store toasts:', toastStore.toasts)
  return toastStore.toasts
})

const removeToast = (id: string) => {
  console.log('ToastContainer removeToast called:', id)
  toastStore.removeToast(id)
}

// Watch for changes
watch(() => toastStore.toasts, (newToasts) => {
  console.log('ToastContainer watch - toasts changed:', newToasts)
}, { deep: true })

onMounted(() => {
  console.log('ToastContainer mounted')
})
</script>