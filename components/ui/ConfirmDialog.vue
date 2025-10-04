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
      <p class="text-gray-700 leading-relaxed whitespace-pre-line">{{ message }}</p>
    </div>

    <template #footer>
      <div class="flex gap-3 justify-end">
        <GlassButton variant="outline" @click="handleCancel">
          {{ cancelText }}
        </GlassButton>
        <GlassButton @click="handleConfirm">
          {{ confirmText }}
        </GlassButton>
      </div>
    </template>
  </GlassModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const { state, respond } = useConfirm()

const isOpen = computed(() => state.value.isOpen)
const title = computed(() => state.value.title)
const message = computed(() => state.value.message)
const confirmText = computed(() => state.value.confirmText)
const cancelText = computed(() => state.value.cancelText)

const handleConfirm = () => {
  respond(true)
}

const handleCancel = () => {
  respond(false)
}
</script>
