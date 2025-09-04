<template>
  <teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[9000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click.self="handleClose"
    >
      <div 
        :class="[
          'bg-white/90 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl max-h-[95vh] overflow-y-auto w-full',
          maxWidth
        ]"
      >
        <!-- Header -->
        <div v-if="showHeader" class="flex items-center justify-between p-6 border-b border-white/20">
          <h2 class="text-xl font-bold text-gray-800">{{ title }}</h2>
          <button
            type="button"
            class="p-2 text-gray-600 hover:text-gray-800 transition-colors rounded-lg hover:bg-white/20"
            @click="handleClose"
          >
            <XIcon class="w-5 h-5" />
          </button>
        </div>

        <!-- Content -->
        <div class="p-6">
          <slot />
        </div>

        <!-- Footer -->
        <div v-if="$slots.footer" class="p-6 pt-0 border-t border-white/20">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { XIcon } from 'lucide-vue-next'

interface Props {
  isOpen: boolean
  title?: string
  maxWidth?: string
  showHeader?: boolean
  closeOnClickOutside?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  maxWidth: 'max-w-2xl',
  showHeader: true,
  closeOnClickOutside: true
})

const emit = defineEmits<{
  close: []
}>()

const handleClose = () => {
  if (props.closeOnClickOutside) {
    emit('close')
  }
}

// 阻止背景滚动
watch(() => props.isOpen, (isOpen) => {
  if (typeof window !== 'undefined') {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
})

// 清理
onUnmounted(() => {
  if (typeof window !== 'undefined') {
    document.body.style.overflow = ''
  }
})
</script>