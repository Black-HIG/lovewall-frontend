<template>
  <div class="w-full space-y-6">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">系统信息</h1>
      <p class="text-gray-600 mt-2">查看系统运行状态和基本信息</p>
    </div>

    <!-- System Info -->
    <GlassCard class="p-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">系统信息</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-gray-600">系统版本</span>
            <span class="font-medium">Love Wall v1.0</span>
          </div>
          
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-gray-600">当前时间</span>
            <span class="font-medium">{{ currentTime }}</span>
          </div>
          
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-gray-600">前端框架</span>
            <span class="font-medium">Nuxt 3 + Vue 3</span>
          </div>
        </div>
        
        <div class="space-y-4">
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-gray-600">界面状态</span>
            <span class="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
              <div class="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              正常运行
            </span>
          </div>
          
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-gray-600">用户类型</span>
            <span class="font-medium">
              {{ auth.isSuperadmin ? '超级管理员' : '管理员' }}
            </span>
          </div>
          
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-gray-600">权限数量</span>
            <span class="font-medium">{{ auth.permissions.length }} 项</span>
          </div>
        </div>
      </div>
    </GlassCard>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <GlassCard class="p-4 text-center">
        <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <UsersIcon class="w-6 h-6 text-white" />
        </div>
        <div class="text-2xl font-bold text-blue-600 mb-1">{{ stats.users }}</div>
        <div class="text-sm text-gray-600">注册用户</div>
      </GlassCard>
      
      <GlassCard class="p-4 text-center">
        <div class="w-12 h-12 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <FileTextIcon class="w-6 h-6 text-white" />
        </div>
        <div class="text-2xl font-bold text-brand-600 mb-1">{{ stats.posts }}</div>
        <div class="text-sm text-gray-600">表白总数</div>
      </GlassCard>
      
      <GlassCard class="p-4 text-center">
        <div class="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <MessageSquareIcon class="w-6 h-6 text-white" />
        </div>
        <div class="text-2xl font-bold text-green-600 mb-1">{{ stats.comments }}</div>
        <div class="text-sm text-gray-600">评论总数</div>
      </GlassCard>
      
      <GlassCard class="p-4 text-center">
        <div class="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <TagIcon class="w-6 h-6 text-white" />
        </div>
        <div class="text-2xl font-bold text-purple-600 mb-1">{{ stats.tags }}</div>
        <div class="text-sm text-gray-600">标签总数</div>
      </GlassCard>
    </div>

    <!-- User Info -->
    <GlassCard class="p-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">当前用户信息</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-gray-600">用户名</span>
            <span class="font-medium">{{ auth.currentUser?.username }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">显示名称</span>
            <span class="font-medium">{{ auth.currentUser?.display_name || '未设置' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">用户状态</span>
            <span class="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
              {{ auth.currentUser?.status === 0 ? '正常' : '异常' }}
            </span>
          </div>
        </div>
        
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-gray-600">注册时间</span>
            <span class="font-medium">{{ formatDate(auth.currentUser?.created_at || '') }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">最后登录</span>
            <span class="font-medium">{{ auth.currentUser?.last_login_at ? formatDate(auth.currentUser.last_login_at) : '未知' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">管理权限</span>
            <span class="font-medium">{{ auth.isSuperadmin ? '全部权限' : `${auth.permissions.length} 项权限` }}</span>
          </div>
        </div>
      </div>

      <!-- Permissions List -->
      <div v-if="!auth.isSuperadmin && auth.permissions.length" class="mt-6 pt-4 border-t border-gray-200">
        <h3 class="text-sm font-medium text-gray-700 mb-3">具体权限</h3>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="permission in auth.permissions"
            :key="permission"
            class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
          >
            {{ getPermissionName(permission) }}
          </span>
        </div>
      </div>
    </GlassCard>

    <!-- Quick Actions -->
    <GlassCard class="p-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">快速操作</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NuxtLink
          to="/admin"
          class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
        >
          <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <HomeIcon class="w-4 h-4 text-blue-600" />
          </div>
          <div class="font-medium text-gray-800 mb-1">管理首页</div>
          <div class="text-sm text-gray-600">返回管理控制台</div>
        </NuxtLink>

        <NuxtLink
          to="/admin/users"
          class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
        >
          <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <UsersIcon class="w-4 h-4 text-green-600" />
          </div>
          <div class="font-medium text-gray-800 mb-1">用户管理</div>
          <div class="text-sm text-gray-600">管理用户和权限</div>
        </NuxtLink>

        <NuxtLink
          to="/admin/posts"
          class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
        >
          <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <FileTextIcon class="w-4 h-4 text-purple-600" />
          </div>
          <div class="font-medium text-gray-800 mb-1">内容管理</div>
          <div class="text-sm text-gray-600">管理表白和评论</div>
        </NuxtLink>
      </div>
    </GlassCard>

    <!-- System Logs (Only for Superadmin) -->
    <GlassCard class="p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-semibold text-gray-800">系统日志</h2>
        <div class="flex gap-3">
          <GlassButton
            @click="activeLogType = 'submissions'"
            :variant="activeLogType === 'submissions' ? 'primary' : 'secondary'"
            class="text-sm"
          >
            <ScrollTextIcon class="w-4 h-4 mr-2" />
            提交日志
          </GlassButton>
          <GlassButton
            @click="activeLogType = 'operations'"
            :variant="activeLogType === 'operations' ? 'primary' : 'secondary'"
            class="text-sm"
          >
            <DatabaseIcon class="w-4 h-4 mr-2" />
            操作日志
          </GlassButton>
        </div>
      </div>

      <!-- Log Filters -->
      <div class="mb-6 p-4 bg-gray-50 rounded-lg">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <GlassInput
            v-model="logFilters.action"
            placeholder="操作类型..."
            class="text-sm"
          />
          <GlassInput
            v-model="logFilters.object_type"
            placeholder="对象类型..."
            class="text-sm"
          />
          <GlassInput
            v-model="logFilters.object_id"
            placeholder="对象ID..."
            class="text-sm"
          />
          <GlassInput
            v-if="activeLogType === 'submissions'"
            v-model="logFilters.user_id"
            placeholder="用户ID..."
            class="text-sm"
          />
          <GlassInput
            v-if="activeLogType === 'operations'"
            v-model="logFilters.admin_id"
            placeholder="管理员ID..."
            class="text-sm"
          />
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label class="block text-xs text-gray-600 mb-1">开始时间</label>
            <input
              v-model="logFilters.from"
              type="datetime-local"
              class="glass-input w-full text-sm"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">结束时间</label>
            <input
              v-model="logFilters.to"
              type="datetime-local"
              class="glass-input w-full text-sm"
            />
          </div>
          <div class="flex items-end">
            <GlassButton
              @click="loadLogs(1)"
              :loading="loadingLogs"
              class="w-full"
            >
              查询日志
            </GlassButton>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loadingLogs" class="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>

      <!-- Empty State -->
      <div v-else-if="!logs.length && !loadingLogs" class="text-center py-12">
        <div class="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ScrollTextIcon class="w-8 h-8 text-white" />
        </div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">暂无日志记录</h3>
        <p class="text-gray-600">当前筛选条件下没有找到日志记录</p>
      </div>

      <!-- Logs List -->
      <div v-else class="space-y-3">
        <div
          v-for="log in logs"
          :key="log.id"
          class="p-4 bg-white/50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <!-- Main log info -->
              <div class="flex items-center gap-3 mb-2">
                <div class="flex items-center text-sm text-gray-600">
                  <span class="font-medium">{{ formatLogAction(log.action) }}</span>
                  <span class="mx-2">•</span>
                  <span>{{ log.object_type }}</span>
                  <span v-if="log.object_id" class="mx-2">•</span>
                  <span v-if="log.object_id" class="font-mono text-xs">{{ log.object_id.slice(0, 8) }}...</span>
                </div>
                <div class="text-xs text-gray-500">
                  {{ formatDate(log.created_at) }}
                </div>
              </div>

              <!-- User info -->
              <div class="text-sm text-gray-700 mb-2">
                <span v-if="activeLogType === 'submissions' && log.user_id" class="font-medium">
                  用户: {{ log.user_id.slice(0, 8) }}...
                </span>
                <span v-if="activeLogType === 'operations' && log.admin_id" class="font-medium">
                  管理员: {{ log.admin_id.slice(0, 8) }}...
                </span>
              </div>

              <!-- Metadata preview -->
              <div v-if="log.parsedMetadata && Object.keys(log.parsedMetadata).length" class="text-xs text-gray-500">
                <span class="font-medium">附加信息:</span>
                <span class="ml-2">
                  {{ Object.keys(log.parsedMetadata).slice(0, 3).map(key => `${key}: ${log.parsedMetadata![key]}`).join(', ') }}
                  <span v-if="Object.keys(log.parsedMetadata).length > 3">...</span>
                </span>
              </div>
            </div>

            <!-- Expand button -->
            <GlassButton
              @click="toggleLogDetails(log)"
              variant="secondary"
              class="!p-2"
              :title="expandedLogId === log.id ? '收起详情' : '展开详情'"
            >
              <component
                :is="expandedLogId === log.id ? 'ChevronUpIcon' : 'ChevronDownIcon'"
                class="w-4 h-4"
              />
            </GlassButton>
          </div>

          <!-- Expanded details -->
          <div v-if="expandedLogId === log.id" class="mt-4 pt-4 border-t border-gray-200">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 class="text-sm font-medium text-gray-700 mb-2">基本信息</h4>
                <div class="space-y-1 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">日志ID:</span>
                    <code class="text-xs bg-gray-100 px-1 rounded">{{ log.id }}</code>
                  </div>
                  <div v-if="log.user_id" class="flex justify-between">
                    <span class="text-gray-600">用户ID:</span>
                    <code class="text-xs bg-gray-100 px-1 rounded">{{ log.user_id }}</code>
                  </div>
                  <div v-if="log.admin_id" class="flex justify-between">
                    <span class="text-gray-600">管理员ID:</span>
                    <code class="text-xs bg-gray-100 px-1 rounded">{{ log.admin_id }}</code>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">操作类型:</span>
                    <span>{{ formatLogAction(log.action) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">对象类型:</span>
                    <span>{{ log.object_type }}</span>
                  </div>
                  <div v-if="log.object_id" class="flex justify-between">
                    <span class="text-gray-600">对象ID:</span>
                    <code class="text-xs bg-gray-100 px-1 rounded">{{ log.object_id }}</code>
                  </div>
                  <div v-if="log.ip" class="flex justify-between">
                    <span class="text-gray-600">IP地址:</span>
                    <span class="font-mono text-xs">{{ log.ip }}</span>
                  </div>
                </div>
              </div>

              <div v-if="log.parsedMetadata && Object.keys(log.parsedMetadata).length">
                <h4 class="text-sm font-medium text-gray-700 mb-2">附加信息</h4>
                <div class="bg-gray-50 p-3 rounded text-xs font-mono max-h-40 overflow-y-auto">
                  <pre>{{ JSON.stringify(log.parsedMetadata, null, 2) }}</pre>
                </div>
              </div>

              <div v-if="log.user_agent" class="md:col-span-2">
                <h4 class="text-sm font-medium text-gray-700 mb-2">用户代理</h4>
                <div class="bg-gray-50 p-3 rounded text-xs break-all">
                  {{ log.user_agent }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div
        v-if="logsData && logsData.total > logsData.page_size"
        class="flex justify-center pt-6 mt-6 border-t border-gray-200"
      >
        <div class="flex gap-2 items-center">
          <GlassButton
            @click="prevLogsPage"
            :disabled="logsData.page <= 1"
            variant="secondary"
            class="px-4 py-2 text-sm"
          >
            上一页
          </GlassButton>
          
          <div class="flex items-center px-4 py-2 text-sm text-gray-600">
            第 {{ logsData.page }} 页，共 {{ Math.ceil(logsData.total / logsData.page_size) }} 页 ({{ logsData.total }} 条记录)
          </div>
          
          <GlassButton
            @click="nextLogsPage"
            :disabled="logsData.page * logsData.page_size >= logsData.total"
            variant="secondary"
            class="px-4 py-2 text-sm"
          >
            下一页
          </GlassButton>
        </div>
      </div>
    </GlassCard>
  </div>
</template>

<script setup lang="ts">
import {
  UsersIcon,
  FileTextIcon,
  MessageSquareIcon,
  TagIcon,
  HomeIcon,
  ScrollTextIcon,
  DatabaseIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from 'lucide-vue-next'
import { PERMISSIONS } from '~/types'
import type { LogEntry, LogFilters, Pagination } from '~/types'

definePageMeta({
  middleware: ['admin', 'require-superadmin']
})

// Stores
const auth = useAuthStore()
const toast = useToast()

// State
const stats = reactive({
  users: 0,
  posts: 0,
  comments: 0,
  tags: 0
})

// Logs related state
const activeLogType = ref<'submissions' | 'operations'>('submissions')
const logs = ref<LogEntry[]>([])
const logsData = ref<Pagination<LogEntry> | null>(null)
const loadingLogs = ref(false)
const expandedLogId = ref<string>('')

const logFilters = reactive<LogFilters>({
  action: '',
  object_type: '',
  object_id: '',
  user_id: '',
  admin_id: '',
  from: '',
  to: '',
  page: 1,
  page_size: 20
})

// Computed
const currentTime = computed(() => {
  return new Date().toLocaleString('zh-CN')
})

// Methods
const formatDate = (dateString: string) => {
  if (!dateString) return '未知'
  return new Date(dateString).toLocaleString('zh-CN')
}

const getPermissionName = (permission: string) => {
  const permissionNames: Record<string, string> = {
    [PERMISSIONS.MANAGE_USERS]: '用户管理',
    [PERMISSIONS.EDIT_POST]: '编辑帖子',
    [PERMISSIONS.DELETE_POST]: '删除帖子',
    [PERMISSIONS.HIDE_POST]: '隐藏帖子',
    [PERMISSIONS.PIN_POST]: '置顶帖子',
    [PERMISSIONS.FEATURE_POST]: '精华帖子',
    [PERMISSIONS.MANAGE_ANNOUNCEMENTS]: '公告管理',
    [PERMISSIONS.MANAGE_COMMENTS]: '评论管理',
    [PERMISSIONS.MANAGE_TAGS]: '标签管理',
  }
  return permissionNames[permission] || permission
}

// Logs related methods
const formatLogAction = (action: string): string => {
  const actionNames: Record<string, string> = {
    // Submissions
    'create_post': '创建帖子',
    'create_comment': '创建评论',
    'redeem_tag': '兑换标签',
    'activate_tag': '激活标签',
    'deactivate_tag': '停用标签',
    // Operations
    'pin_post': '置顶帖子',
    'unpin_post': '取消置顶',
    'feature_post': '精选帖子',
    'unfeature_post': '取消精选',
    'hide_post': '隐藏帖子',
    'restore_post': '恢复帖子',
    'delete_post': '删除帖子',
    'hide_comment': '隐藏评论',
    'restore_comment': '恢复评论',
    'delete_comment': '删除评论',
    'create_tag': '创建标签',
    'update_tag': '更新标签',
    'delete_tag': '删除标签',
    'generate_codes': '生成兑换码',
    'assign_user_tag': '分配用户标签',
    'remove_user_tag': '删除用户标签',
    'create_announcement': '创建公告',
    'update_announcement': '更新公告',
    'delete_announcement': '删除公告',
    'set_user_permissions': '设置用户权限',
    'change_user_password': '修改用户密码'
  }
  return actionNames[action] || action
}

const convertToRFC3339 = (dateTimeLocal: string): string => {
  if (!dateTimeLocal) return ''
  // datetime-local format: YYYY-MM-DDTHH:MM
  // Convert to RFC3339: YYYY-MM-DDTHH:MM:SSZ
  return new Date(dateTimeLocal).toISOString()
}

const loadLogs = async (page = 1) => {
  loadingLogs.value = true
  
  try {
    const api = useApi()
    
    // Prepare filters
    const filters: LogFilters = {
      page,
      page_size: 20
    }
    
    // Add non-empty filters
    if (logFilters.action) filters.action = logFilters.action
    if (logFilters.object_type) filters.object_type = logFilters.object_type
    if (logFilters.object_id) filters.object_id = logFilters.object_id
    if (logFilters.from) filters.from = convertToRFC3339(logFilters.from)
    if (logFilters.to) filters.to = convertToRFC3339(logFilters.to)
    
    // Add log type specific filters
    if (activeLogType.value === 'submissions') {
      if (logFilters.user_id) filters.user_id = logFilters.user_id
    } else {
      if (logFilters.admin_id) filters.admin_id = logFilters.admin_id
    }
    
    // Call appropriate API
    const data = activeLogType.value === 'submissions' 
      ? await api.getSubmissionLogs(filters)
      : await api.getOperationLogs(filters)
    
    // Process metadata for each log entry
    const processedLogs = data.items.map(log => ({
      ...log,
      parsedMetadata: log.metadata ? JSON.parse(log.metadata) : null
    }))
    
    logs.value = processedLogs
    logsData.value = data
    
  } catch (error: any) {
    toast.error('加载日志失败')
    console.error('Failed to load logs:', error)
  } finally {
    loadingLogs.value = false
  }
}

const toggleLogDetails = (log: LogEntry) => {
  if (expandedLogId.value === log.id) {
    expandedLogId.value = ''
  } else {
    expandedLogId.value = log.id
  }
}

const prevLogsPage = () => {
  if (logsData.value && logsData.value.page > 1) {
    loadLogs(logsData.value.page - 1)
  }
}

const nextLogsPage = () => {
  if (logsData.value && logsData.value.page * logsData.value.page_size < logsData.value.total) {
    loadLogs(logsData.value.page + 1)
  }
}

// Watch for log type changes to reload data
watch(activeLogType, () => {
  // Clear current logs and reload
  logs.value = []
  logsData.value = null
  expandedLogId.value = ''
  loadLogs(1)
})

// Load basic stats (if APIs are available)
const loadStats = async () => {
  try {
    const api = useApi()
    
    // Load posts count
    try {
      const postsData = await api.listPosts({ page: 1, page_size: 1 })
      stats.posts = postsData.total
    } catch (error) {
      console.warn('Failed to load posts count:', error)
    }

    // Load users count (if has permission)
    if (auth.hasPerm('MANAGE_USERS') || auth.isSuperadmin) {
      try {
        const usersData = await api.listUsers({ page: 1, page_size: 1 })
        stats.users = usersData.total
      } catch (error) {
        console.warn('Failed to load users count:', error)
      }
    }

    // Load tags count (if has permission)
    if (auth.hasPerm('MANAGE_TAGS')) {
      try {
        const tagsData = await api.listTags({ page: 1, page_size: 1 })
        stats.tags = tagsData.total
      } catch (error) {
        console.warn('Failed to load tags count:', error)
      }
    }
  } catch (error) {
    console.warn('Failed to load system stats:', error)
  }
}

// Initialize
onMounted(() => {
  loadStats()
  // Load initial logs
  loadLogs(1)
})

// SEO
useHead({
  title: '系统信息 - Love Wall',
  meta: [
    { name: 'description', content: '查看系统运行状态和基本信息' }
  ]
})
</script>
