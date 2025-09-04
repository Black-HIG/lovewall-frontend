<template>
  <div class="glass-card" v-bind="$attrs">
    <slot />
  </div>
  
</template>
<script setup lang="ts">
defineOptions({ inheritAttrs: true })
</script>
