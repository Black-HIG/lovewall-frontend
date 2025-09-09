<template>
  <Teleport to="body">
    <div class="fixed top-6 right-6 z-[999999] space-y-3 pointer-events-none">
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
  </Teleport>
</template>

<script setup lang="ts">
import { useToastStore } from '~/stores/toast'
import Toast from './Toast.vue'

const toastStore = useToastStore()
const visibleToasts = computed(() => toastStore.toasts)

const removeToast = (id: string) => {
  console.log('ToastContainer removeToast called:', id)
  toastStore.removeToast(id)
}

// no-op
</script>
