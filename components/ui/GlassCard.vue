<template>
  <div 
    :class="[
      'glass-card relative overflow-hidden',
      variant,
      {
        'hover:shadow-glow-lg hover:scale-[1.01] transition-all duration-300': interactive,
        'border-glass': !noBorder,
        'backdrop-blur-xl': blur === 'xl',
        'backdrop-blur-2xl': blur === '2xl',
        'backdrop-blur-3xl': blur === '3xl',
      }
    ]"
    v-bind="$attrs"
  >
    <!-- 内发光效果 -->
    <div 
      v-if="innerGlow"
      class="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none"
    />
    
    <!-- 边框高光 -->
    <div 
      v-if="borderGlow"
      class="absolute inset-0 rounded-[inherit] border border-white/30 pointer-events-none"
    />
    
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'default' | 'elevated' | 'subtle' | 'frosted'
  interactive?: boolean
  innerGlow?: boolean
  borderGlow?: boolean
  noBorder?: boolean
  blur?: 'md' | 'lg' | 'xl' | '2xl' | '3xl'
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  interactive: false,
  innerGlow: false,
  borderGlow: false,
  noBorder: false,
  blur: 'lg'
})

defineOptions({ inheritAttrs: false })
</script>

<style scoped>
.glass-card {
  @apply bg-white/25 backdrop-blur-lg border border-white/20 shadow-glass rounded-2xl;
}

.glass-card.elevated {
  @apply bg-white/30 shadow-glass-lg;
}

.glass-card.subtle {
  @apply bg-white/15 border-white/10;
}

.glass-card.frosted {
  @apply bg-white/35 backdrop-blur-2xl shadow-glass-xl;
}

.border-glass {
  @apply border-white/20;
}

/* 深色模式优化 */
@media (prefers-color-scheme: dark) {
  .glass-card {
    @apply bg-white/15 border-white/10;
  }
  
  .glass-card.elevated {
    @apply bg-white/20;
  }
  
  .glass-card.frosted {
    @apply bg-white/25;
  }
}
</style>
