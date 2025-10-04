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
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <h2 class="text-lg font-semibold text-gray-800">系统日志</h2>
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

      <!-- Log Filters -->
      <div class="glass-bar p-4 mb-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
          <GlassInput v-model="logFilters.q" placeholder="关键字（操作/对象/ID/元数据）" class="text-sm lg:col-span-4" />
          <GlassInput v-model="logFilters.action" placeholder="操作类型" class="text-sm lg:col-span-2" />
          <GlassInput v-model="logFilters.object_type" placeholder="对象类型" class="text-sm lg:col-span-2" />
          <GlassInput v-model="logFilters.object_id" placeholder="对象ID" class="text-sm lg:col-span-2" />
          <GlassInput v-if="activeLogType === 'submissions'" v-model="logFilters.user_id" placeholder="用户ID" class="text-sm lg:col-span-2" />
          <GlassInput v-if="activeLogType === 'operations'" v-model="logFilters.admin_id" placeholder="管理员ID" class="text-sm lg:col-span-2" />
          <div class="grid grid-cols-2 gap-3 lg:col-span-4">
            <input v-model="logFilters.from" type="datetime-local" class="glass-input w-full text-sm" />
            <input v-model="logFilters.to" type="datetime-local" class="glass-input w-full text-sm" />
          </div>
          <div class="flex flex-wrap gap-2 justify-end lg:col-span-4">
            <div class="flex items-center gap-2 text-sm text-gray-700 mr-auto lg:mr-0">
              <span>每页</span>
              <select v-model.number="logsPageSize" @change="changeLogsPageSize" class="glass-input px-2 py-1 text-sm">
                <option :value="20">20</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
                <option :value="500">500</option>
              </select>
            </div>
            <GlassButton @click="clearLogFilters" variant="secondary" class="toolbar-button">清空</GlassButton>
            <GlassButton @click="loadLogs(1)" :loading="loadingLogs" class="toolbar-button">查询</GlassButton>
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

      <!-- Logs Timeline List -->
      <div v-else class="space-y-3">
        <div v-for="log in logs" :key="log.id" class="relative pl-6 cursor-pointer" @click="openLogDetails(log)">
          <div class="absolute left-0 top-5 w-3 h-3 rounded-full bg-brand-500 ring-4 ring-white/60" />
          <div class="p-4 bg-white/60 rounded-xl border border-white/40 hover:shadow-glow-sm transition-all">
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-2 mb-1 text-sm">
                  <span class="px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">{{ formatLogAction(log.action) }}</span>
                  <span class="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{{ log.object_type }}</span>
                  <code v-if="log.object_id" class="px-2 py-0.5 rounded bg-gray-50 border text-xs">{{ log.object_id }}</code>
                </div>
                <div class="text-xs text-gray-500 mb-2">{{ formatDate(log.created_at) }}</div>
                <div class="text-sm text-gray-700 mb-2 flex flex-wrap gap-4">
                  <span v-if="log.user_id">
                    用户:
                    <span
                      v-if="userMap[log.user_id] === null"
                      class="text-gray-500"
                    >
                      {{ userLabel(log.user_id) }}
                    </span>
                    <NuxtLink
                      v-else
                      :to="`/users/id/${log.user_id}`"
                      class="text-brand-600 hover:text-brand-700 hover:underline"
                    >
                      {{ userLabel(log.user_id) }}
                    </NuxtLink>
                  </span>
                  <span v-if="log.admin_id">
                    管理员:
                    <a
                      v-if="log.admin_id === '00000000-0000-0000-0000-000000000001'"
                      href="https://openai.com/"
                      target="_blank"
                      rel="noopener"
                      class="text-brand-600 hover:text-brand-700 hover:underline"
                    >
                      {{ userLabel(log.admin_id) }}
                    </a>
                    <NuxtLink
                      v-else
                      :to="`/users/id/${log.admin_id}`"
                      class="text-brand-600 hover:text-brand-700 hover:underline"
                    >
                      {{ userLabel(log.admin_id) }}
                    </NuxtLink>
                  </span>
                </div>
                <div v-if="log.parsedMetadata && Object.keys(log.parsedMetadata).length" class="text-xs text-gray-600">
                  <span class="font-medium">附加信息:</span>
                  <span class="ml-1">{{ metadataPreview(log.parsedMetadata) }}</span>
                </div>
              </div>
              <GlassButton @click.stop="openLogDetails(log)" variant="secondary" class="!p-2" title="查看详情">
                <ChevronDownIcon class="w-4 h-4" />
              </GlassButton>
            </div>
            <!-- 详情改为 Modal 展示 -->
          </div>
        </div>
      </div>

      <!-- Log Details Modal -->
      <GlassModal :is-open="logDetails.show" title="日志详情" max-width="max-w-3xl" @close="closeLogDetails">
        <div v-if="logDetails.log" class="space-y-4">
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">{{ formatLogAction(logDetails.log.action) }}</span>
            <span class="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{{ logDetails.log.object_type }}</span>
            <code v-if="logDetails.log.object_id" class="px-2 py-0.5 rounded bg-gray-50 border text-xs">{{ logDetails.log.object_id }}</code>
            <span class="text-xs text-gray-500 ml-auto">{{ formatDate(logDetails.log.created_at) }}</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-2">基本信息</h4>
              <div class="space-y-1 text-sm">
                <div class="flex justify-between"><span class="text-gray-600">日志ID:</span><code class="text-xs bg-white px-2 py-0.5 rounded border">{{ logDetails.log.id }}</code></div>
                <div class="flex justify-between"><span class="text-gray-600">对象:</span><span>{{ logDetails.log.object_type }}</span></div>
                <div v-if="logDetails.log.user_id" class="flex justify-between">
                  <span class="text-gray-600">用户:</span>
                  <span
                    v-if="userMap[logDetails.log.user_id] === null"
                    class="text-gray-500"
                  >
                    {{ userLabel(logDetails.log.user_id) }}
                  </span>
                  <NuxtLink
                    v-else
                    :to="`/users/id/${logDetails.log.user_id}`"
                    class="text-brand-600 hover:text-brand-700 hover:underline"
                  >
                    {{ userLabel(logDetails.log.user_id) }}
                  </NuxtLink>
                </div>
                <div v-if="logDetails.log.admin_id" class="flex justify-between">
                  <span class="text-gray-600">管理员:</span>
                  <a
                    v-if="logDetails.log.admin_id === '00000000-0000-0000-0000-000000000001'"
                    href="https://openai.com/"
                    target="_blank"
                    rel="noopener"
                    class="text-brand-600 hover:text-brand-700 hover:underline"
                  >
                    {{ userLabel(logDetails.log.admin_id) }}
                  </a>
                  <NuxtLink
                    v-else
                    :to="`/users/id/${logDetails.log.admin_id}`"
                    class="text-brand-600 hover:text-brand-700 hover:underline"
                  >
                    {{ userLabel(logDetails.log.admin_id) }}
                  </NuxtLink>
                </div>
                <div v-if="logDetails.log.ip" class="flex justify-between"><span class="text-gray-600">IP:</span><span class="font-mono text-xs">{{ logDetails.log.ip }}</span></div>
                <div v-if="logDetails.log.parsedMetadata?.ai_decision">
                  <div class="border-t border-gray-200 my-2"></div>
                  <div class="text-xs font-medium text-gray-700 mb-1">AI 审核信息</div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">AI决策:</span>
                    <span>{{ logDetails.log.parsedMetadata.ai_decision === 'auto_deleted' ? '自动删除' : logDetails.log.parsedMetadata.ai_decision }}</span>
                  </div>
                  <div v-if="logDetails.log.parsedMetadata.ai_reason" class="flex justify-between">
                    <span class="text-gray-600">原因:</span>
                    <span>{{ logDetails.log.parsedMetadata.ai_reason }}</span>
                  </div>
                  <div v-if="logDetails.log.parsedMetadata.ai_score !== undefined && logDetails.log.parsedMetadata.ai_score !== null" class="flex justify-between">
                    <span class="text-gray-600">评分:</span>
                    <span>{{ logDetails.log.parsedMetadata.ai_score }}</span>
                  </div>
                  <div v-if="logDetails.log.parsedMetadata.author_name" class="flex justify-between">
                    <span class="text-gray-600">作者:</span>
                    <span>{{ logDetails.log.parsedMetadata.author_name }}</span>
                  </div>
                  <div v-if="logDetails.log.parsedMetadata.content_preview" class="flex justify-between">
                    <span class="text-gray-600">内容预览:</span>
                    <span>{{ logDetails.log.parsedMetadata.content_preview }}</span>
                  </div>
                  <div v-if="logDetails.log.parsedMetadata.target_name" class="flex justify-between">
                    <span class="text-gray-600">目标:</span>
                    <span>{{ logDetails.log.parsedMetadata.target_name }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-2">元数据</h4>
              <pre class="text-xs bg-white/70 rounded-lg p-3 border overflow-auto max-h-64">{{ (logDetails.log.metadata || '{}') }}</pre>
            </div>
            <div v-if="logDetails.log.user_agent" class="md:col-span-2">
              <h4 class="text-sm font-medium text-gray-700 mb-2">User-Agent</h4>
              <div class="bg-white/70 p-3 rounded text-xs break-all border">{{ logDetails.log.user_agent }}</div>
            </div>
          </div>
        </div>
        <template #footer>
          <div class="flex justify-end">
            <GlassButton variant="secondary" class="toolbar-button" @click="closeLogDetails">关闭</GlassButton>
          </div>
        </template>
      </GlassModal>

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
import GlassModal from '~/components/ui/GlassModal.vue'
import { PERMISSIONS } from '~/types'
import type { LogEntry, LogFilters, Pagination, User } from '~/types'

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
const logsPageSize = ref<number>(20)
const logDetails = reactive<{ show: boolean; log: LogEntry | null }>({ show: false, log: null })
// cache user info to render names and links
const userMap = ref<Record<string, User | null>>({})

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
    [PERMISSIONS.MANAGE_POSTS]: '帖子管理',
    [PERMISSIONS.MANAGE_FEATURED]: '精华管理',
    [PERMISSIONS.MANAGE_ANNOUNCEMENTS]: '公告管理',
    [PERMISSIONS.MANAGE_COMMENTS]: '评论管理',
    [PERMISSIONS.MANAGE_TAGS]: '标签管理',
  }
  return permissionNames[permission] || permission
}

// Logs related methods
const formatLogAction = (action: string): string => {
  const actionNames: Record<string, string> = {
    // 提交类
    'create_post': '创建帖子',
    'create_comment': '创建评论',
    'redeem_tag': '兑换标签',
    'activate_tag': '激活标签',
    'deactivate_tag': '停用标签',
    // 用户管理（管理员）
    'set_user_permissions': '设置用户权限',
    'update_user_password': '重置用户密码',
    'update_user': '更新用户信息',
    'ban_user': '封禁用户',
    'unban_user': '解除封禁',
    // 帖子管理
    'pin_post': '置顶帖子',
    'unpin_post': '取消置顶',
    'feature_post': '精选帖子',
    'unfeature_post': '取消精选',
    'hide_post': '隐藏帖子',
    'unhide_post': '取消隐藏帖子',
    'delete_post': '删除帖子',
    'auto_delete': 'AI 自动审核',
    // 评论管理
    'edit_comment': '编辑评论',
    'hide_comment': '隐藏评论',
    'unhide_comment': '取消隐藏评论',
    // 标签与兑换码
    'create_tag': '创建标签',
    'update_tag': '更新标签',
    'delete_tag': '删除标签',
    'generate_redemption_codes': '生成兑换码',
    'delete_redemption_codes': '批量删除兑换码',
    'assign_user_tag': '分配用户标签',
    'remove_user_tag': '移除用户标签',
    // 公告
    'create_announcement': '创建公告',
    'update_announcement': '更新公告',
    'delete_announcement': '删除公告',
  }
  return actionNames[action] || action
}

const convertToRFC3339 = (dateTimeLocal: string): string => {
  if (!dateTimeLocal) return ''
  // datetime-local format: YYYY-MM-DDTHH:MM
  // Convert to RFC3339: YYYY-MM-DDTHH:MM:SSZ
  return new Date(dateTimeLocal).toISOString()
}

const toDatetimeLocal = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0')
  const y = date.getFullYear()
  const m = pad(date.getMonth() + 1)
  const d = pad(date.getDate())
  const hh = pad(date.getHours())
  const mm = pad(date.getMinutes())
  return `${y}-${m}-${d}T${hh}:${mm}`
}

const loadLogs = async (page = 1) => {
  loadingLogs.value = true
  
  try {
    const api = useApi()
    
    // Prepare filters
    const filters: LogFilters = {
      page,
      page_size: logsPageSize.value
    }
    
    // Add non-empty filters
    if (logFilters.q) (filters as any).q = logFilters.q
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
    const processedLogs = data.items.map((log: LogEntry) => ({
      ...log,
      parsedMetadata: log.metadata ? JSON.parse(log.metadata) : null
    }))
    
    logs.value = processedLogs
    logsData.value = data
    await preloadUserNames(processedLogs)
    
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

const clearLogFilters = () => {
  logFilters.action = ''
  logFilters.object_type = ''
  logFilters.object_id = ''
  logFilters.user_id = ''
  logFilters.admin_id = ''
  logFilters.from = ''
  logFilters.to = ''
  logFilters.q = ''
}

const formatAIMetadata = (metadata: Record<string, any>): string => {
  const parts: string[] = []
  if (Object.prototype.hasOwnProperty.call(metadata, 'ai_decision')) {
    const decision = metadata.ai_decision === 'auto_deleted' ? '自动删除' : String(metadata.ai_decision)
    parts.push(`AI决策: ${decision}`)
  }
  if (Object.prototype.hasOwnProperty.call(metadata, 'ai_reason')) {
    const value = metadata.ai_reason
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      parts.push(`原因: ${String(value)}`)
    }
  }
  if (Object.prototype.hasOwnProperty.call(metadata, 'ai_score')) {
    const value = metadata.ai_score
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      parts.push(`评分: ${String(value)}`)
    }
  }
  if (Object.prototype.hasOwnProperty.call(metadata, 'author_name')) {
    const value = metadata.author_name
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      parts.push(`作者: ${String(value)}`)
    }
  }
  if (Object.prototype.hasOwnProperty.call(metadata, 'content_preview')) {
    const value = metadata.content_preview
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      parts.push(`内容预览: ${String(value)}`)
    }
  }
  if (Object.prototype.hasOwnProperty.call(metadata, 'target_name')) {
    const value = metadata.target_name
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      parts.push(`目标: ${String(value)}`)
    }
  }
  return parts.join(' | ')
}

const metadataPreview = (obj: Record<string, any>) => {
  if (Object.prototype.hasOwnProperty.call(obj, 'ai_decision')) {
    return formatAIMetadata(obj)
  }
  const keys = Object.keys(obj)
  if (!keys.length) return ''
  const parts = keys.slice(0, 3).map(k => `${k}: ${String(obj[k])}`)
  return parts.join(', ') + (keys.length > 3 ? ' ...' : '')
}

const changeLogsPageSize = () => {
  loadLogs(1)
}

const openLogDetails = (log: LogEntry) => {
  logDetails.log = log
  logDetails.show = true
}

const closeLogDetails = () => {
  logDetails.show = false
  logDetails.log = null
}

// preload user/admin names for logs
const preloadUserNames = async (items: LogEntry[]) => {
  const ids = new Set<string>()
  items.forEach(l => {
    if (l.user_id) ids.add(l.user_id)
    if (l.admin_id) ids.add(l.admin_id)
  })
  const missing = Array.from(ids).filter(id =>
    id !== '00000000-0000-0000-0000-000000000001' && !(id in userMap.value)
  )
  if (!missing.length) return
  const api = useApi()
  await Promise.all(missing.map(async (id) => {
    try {
      const u = await api.getUser(id)
      userMap.value[id] = u
    } catch (error: any) {
      if (error?.response?.status === 404) {
        userMap.value[id] = null
        return
      }
      userMap.value[id] = null
    }
  }))
}

const userLabel = (id?: string) => {
  if (id === '00000000-0000-0000-0000-000000000001') return 'OpenAI'
  if (!id) return '-'
  const u = userMap.value[id]
  if (u === undefined) return '加载中...'
  if (!u) return id
  return u.display_name || u.username || id
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
  // 默认时间范围：站点建立时间（以当前管理员注册时间）到现在
  try {
    if (!logFilters.from && auth.currentUser?.created_at) {
      const created = new Date(auth.currentUser.created_at)
      logFilters.from = toDatetimeLocal(created)
    }
  } catch {}
  if (!logFilters.to) {
    logFilters.to = toDatetimeLocal(new Date())
  }
  // Load initial logs with default range
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

