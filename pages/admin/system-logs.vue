<template>
  <div class="w-full space-y-6">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">系统日志</h1>
      <p class="text-gray-600 mt-2">查看系统提交和操作日志</p>
    </div>

    <!-- System Logs -->
    <GlassCard class="p-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <h2 class="text-lg font-semibold text-gray-800">日志记录</h2>
          <span v-if="logsData" class="px-2 py-0.5 text-xs rounded-full bg-white/50 text-gray-700 border border-white/40">
            共 {{ logsData.total }} 条
          </span>
        </div>
        <div class="flex gap-2">
          <GlassButton @click="activeLogType = 'submissions'" :variant="activeLogType === 'submissions' ? 'primary' : 'secondary'" class="toolbar-button">
            <ScrollTextIcon class="w-4 h-4 mr-2" /> 提交日志
          </GlassButton>
          <GlassButton @click="activeLogType = 'operations'" :variant="activeLogType === 'operations' ? 'primary' : 'secondary'" class="toolbar-button">
            <DatabaseIcon class="w-4 h-4 mr-2" /> 操作日志
          </GlassButton>
        </div>
      </div>

      <!-- Rest of logs UI continues... -->
    </GlassCard>
  </div>
</template>
