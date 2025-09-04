<template>
  <span
      class="inline-block align-middle whitespace-nowrap
           px-1.5 py-0.5 rounded-md
           text-xs font-medium leading-none
           border border-white/30"
      :style="{
      backgroundColor: background,
      color: text,
      textShadow: '0 1px 1px rgba(0,0,0,0.25)'
    }"
  >
    {{ title }}
  </span>
</template>

<script setup lang="ts">
interface Props {
  title: string
  background: string
  text: string
}
defineProps<Props>()
</script>
