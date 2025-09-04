<template>
  <div 
    :class="[
      'inline-flex items-center justify-center',
      {
        'w-4 h-4': size === 'sm',
        'w-6 h-6': size === 'md',
        'w-8 h-8': size === 'lg',
        'w-12 h-12': size === 'xl',
      }
    ]"
  >
    <div
      :class="[
        'animate-spin rounded-full border-2',
        {
          'w-4 h-4 border-gray-300 border-t-brand-500': size === 'sm',
          'w-6 h-6 border-gray-300 border-t-brand-500': size === 'md',
          'w-8 h-8 border-gray-300 border-t-brand-500': size === 'lg',
          'w-12 h-12 border-gray-300 border-t-brand-500': size === 'xl',
          'border-white/30 border-t-white': variant === 'white',
        }
      ]"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'white'
}

withDefaults(defineProps<Props>(), {
  size: 'md',
  variant: 'default',
})</script>