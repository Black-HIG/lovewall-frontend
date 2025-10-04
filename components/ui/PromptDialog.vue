<template>
  <GlassModal
    :is-open="isOpen"
    :title="title"
    :show-header="!!title"
    :close-on-click-outside="false"
    max-width="max-w-md"
    @close="handleCancel"
  >
    <div class="space-y-4">
      <p v-if="message" class="text-gray-700 leading-relaxed whitespace-pre-line">{{ message }}</p>
      <GlassInput
        v-model="inputValue"
        :placeholder="placeholder"
        input-class="border-2 border-gray-300/60 bg-white/85 focus:border-brand-400/70 focus:ring-brand-300/40"
        @keyup.enter="handleConfirm"
      />
    </div>

    <template #footer>
      <div class="flex gap-3 justify-end">
        <GlassButton variant="outline" @click="handleCancel">{{ cancelText }}</GlassButton>
        <GlassButton @click="handleConfirm">{{ confirmText }}</GlassButton>
      </div>
    </template>
  </GlassModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const { state, respond } = usePrompt()

const isOpen = computed(() => state.value.isOpen)
const title = computed(() => state.value.title)
const message = computed(() => state.value.message)
const confirmText = computed(() => state.value.confirmText)
const cancelText = computed(() => state.value.cancelText)
const placeholder = computed(() => state.value.placeholder)

const inputValue = computed({
  get: () => state.value.inputValue,
  set: (val: string) => {
    state.value.inputValue = val
  }
})

const handleConfirm = () => {
  respond(state.value.inputValue.trim())
}

const handleCancel = () => {
  respond(null)
}
</script>
