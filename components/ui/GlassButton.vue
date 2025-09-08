<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading ? 'true' : 'false'"
    v-bind="$attrs"
    class="glass-button"
    :class="[
      {
        'glass-button-secondary': variant === 'secondary',
        'glass-button-outline': variant === 'outline',
        'opacity-50 cursor-not-allowed': disabled,
        'w-full': fullWidth
      },
      // merge incoming class names explicitly
      $attrs.class
    ]"
    @click="$emit('click', $event)"
  >
    <div class="flex items-center justify-center gap-2">
      <div
        v-if="loading"
        class="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
      />
      <slot />
    </div>
  </button>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

interface Props {
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'outline'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
}

defineProps<Props>()

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>
