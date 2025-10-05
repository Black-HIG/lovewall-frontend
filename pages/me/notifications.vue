<template>
  <div class="w-full space-y-6">
    <div class="page-header">
      <h1 class="page-title">我的通知</h1>
      <p class="text-gray-600 mt-2">系统发送给我的所有通知</p>
    </div>

    <NotificationsList />
  </div>
</template>

<script setup lang="ts">
import NotificationsList from '~/pages/notifications.vue'
definePageMeta({ middleware: ['auth'] })
useHead({ title: '我的通知 - 郑州四中表白墙' })
</script>

