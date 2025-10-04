<template>
  <!-- 遮罩层 -->
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        @click.self="handleCancel"
      >
        <!-- 背景遮罩 -->
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" />

        <!-- 对话框内容 -->
        <div
          class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-dialog-in"
          @click.stop
        >
          <!-- 头部 -->
          <div class="flex items-center justify-between p-6 pb-4">
            <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
            <button
              type="button"
              class="text-gray-400 hover:text-gray-600 transition-colors"
              @click="handleCancel"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- 内容区 -->
          <div class="px-6 pb-4">
            <!-- 消息文本 -->
            <p v-if="message" class="text-gray-700 mb-4 whitespace-pre-line">{{ message }}</p>

            <!-- 输入框(带标签) -->
            <div v-if="showInput">
              <label v-if="inputLabel" class="block text-sm text-gray-600 mb-2">
                {{ inputLabel }}
              </label>
              <input
                ref="inputRef"
                v-model="inputValue"
                type="text"
                :placeholder="placeholder"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                @keyup.enter="handleConfirm"
              >
            </div>
          </div>

          <!-- 底部按钮 -->
          <div class="flex gap-3 justify-end px-6 pb-6">
            <button
              type="button"
              class="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              @click="handleCancel"
            >
              {{ cancelText }}
            </button>
            <button
              type="button"
              class="px-5 py-2.5 text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 rounded-lg transition-colors shadow-sm"
              @click="handleConfirm"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const { state, respond } = useAdminDialog()

const inputRef = ref<HTMLInputElement>()

const isOpen = computed(() => state.value.isOpen)
const title = computed(() => state.value.title)
const message = computed(() => state.value.message)
const showInput = computed(() => state.value.showInput)
const inputLabel = computed(() => state.value.inputLabel)
const placeholder = computed(() => state.value.placeholder)
const confirmText = computed(() => state.value.confirmText)
const cancelText = computed(() => state.value.cancelText)

const inputValue = computed({
  get: () => state.value.inputValue,
  set: (val: string) => {
    state.value.inputValue = val
  }
})

const handleConfirm = () => {
  if (showInput.value) {
    respond({ confirmed: true, inputValue: inputValue.value.trim() })
  } else {
    respond({ confirmed: true, inputValue: '' })
  }
}

const handleCancel = () => {
  respond({ confirmed: false, inputValue: '' })
}

// 自动聚焦输入框
watch(isOpen, (open) => {
  if (open && showInput.value) {
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
})

// 阻止背景滚动
watch(isOpen, (open) => {
  if (typeof window !== 'undefined') {
    document.body.style.overflow = open ? 'hidden' : ''
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

@keyframes dialog-in {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-dialog-in {
  animation: dialog-in 0.2s ease-out;
}
</style>
