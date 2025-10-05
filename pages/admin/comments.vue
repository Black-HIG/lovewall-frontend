<template>
  <div class="w-full space-y-6">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">评论管理</h1>
      <p class="text-gray-600 mt-2">审核和管理用户评论</p>
    </div>

    <!-- Controls -->
    <GlassCard class="p-4">
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <!-- Filters -->
        <div class="flex flex-col sm:flex-row gap-3 flex-1">
          <select
            v-model="filters.status"
            @change="applyFilters"
            class="glass-input px-3 py-2"
          >
            <option value="">全部状态</option>
            <option value="0">正常</option>
            <option value="1">已隐藏</option>
          </select>
          
          <GlassInput
            v-model="filters.post_id"
            placeholder="帖子ID..."
            class="flex-1 min-w-0"
            @keyup="applyFilters"
          />
          
          <GlassInput
            v-model="filters.user_id"
            placeholder="用户ID..."
            class="flex-1 min-w-0"
            @keyup="applyFilters"
          />
        </div>

        <!-- Actions -->
        <div class="flex gap-3">
          <GlassButton
            @click="refresh"
            :loading="loading"
            variant="secondary"
          >
            <RefreshCwIcon class="w-4 h-4 mr-2" />
            刷新
          </GlassButton>
        </div>
      </div>
    </GlassCard>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <GlassCard class="p-4 text-center">
        <div class="text-2xl font-bold text-green-600 mb-1">{{ commentsData?.total || 0 }}</div>
        <div class="text-sm text-gray-600">总评论数</div>
      </GlassCard>
      
      <GlassCard class="p-4 text-center">
        <div class="text-2xl font-bold text-blue-600 mb-1">{{ normalCount }}</div>
        <div class="text-sm text-gray-600">正常评论</div>
      </GlassCard>
      
      <GlassCard class="p-4 text-center">
        <div class="text-2xl font-bold text-yellow-600 mb-1">{{ hiddenCount }}</div>
        <div class="text-sm text-gray-600">已隐藏</div>
      </GlassCard>
    </div>

    <!-- Comments List -->
    <GlassCard class="overflow-hidden">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>

      <!-- Empty State -->
      <div v-else-if="!comments.length" class="text-center py-12">
        <div class="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquareIcon class="w-8 h-8 text-white" />
        </div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">未找到评论</h3>
        <p class="text-gray-600">尝试调整筛选条件</p>
      </div>

      <!-- Comments Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-white/10 border-b border-white/20">
            <tr>
              <th class="px-6 py-4 text-left text-sm font-semibold text-gray-800">评论内容</th>
              <th class="px-6 py-4 text-left text-sm font-semibold text-gray-800">用户</th>
              <th class="px-6 py-4 text-left text-sm font-semibold text-gray-800">帖子</th>
              <th class="px-6 py-4 text-left text-sm font-semibold text-gray-800">状态</th>
              <th class="px-6 py-4 text-left text-sm font-semibold text-gray-800">时间</th>
              <th class="px-6 py-4 text-left text-sm font-semibold text-gray-800">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/10">
            <tr
              v-for="comment in comments"
              :key="comment.id"
              class="hover:bg-white/5"
            >
              <!-- Content -->
              <td class="px-6 py-4 max-w-xs">
                <p class="text-sm text-gray-700 line-clamp-3">{{ comment.content }}</p>
              </td>

              <!-- User -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      v-if="comment.user_avatar_url"
                      :src="assetUrl(comment.user_avatar_url)"
                      :alt="commentDisplayName(comment)"
                      class="w-8 h-8 object-cover"
                      @error="() => { comment.user_avatar_url = null }"
                    >
                    <div
                      v-else
                      class="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-medium"
                    >
                      {{ commentDisplayName(comment).slice(0, 2) }}
                    </div>
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-800">{{ commentDisplayName(comment) }}</div>
                    <TagBadge
                      v-if="comment.user_tag"
                      :title="comment.user_tag.title"
                      :background="comment.user_tag.background_color"
                      :text="comment.user_tag.text_color"
                      class="mt-1"
                    />
                  </div>
                </div>
              </td>

              <!-- Post -->
              <td class="px-6 py-4">
                <div class="text-sm text-gray-600">
                  <code class="text-xs bg-gray-100 px-1 rounded">{{ comment.post_id }}</code>
                </div>
              </td>

              <!-- Status -->
              <td class="px-6 py-4">
                <span
                  :class="{
                    'bg-green-100 text-green-800': comment.status === 0,
                    'bg-yellow-100 text-yellow-800': comment.status === 1
                  }"
                  class="px-2 py-1 text-xs rounded-full"
                >
                  {{ comment.status === 0 ? '正常' : '已隐藏' }}
                </span>
              </td>

              <!-- Time -->
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ formatDate(comment.created_at) }}
              </td>

              <!-- Actions -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <GlassButton
                    v-if="comment.status === 0"
                    @click="hideComment(comment)"
                    variant="secondary"
                    class="!p-2 !text-yellow-600 hover:!bg-yellow-50"
                    title="隐藏评论"
                  >
                    <EyeOffIcon class="w-4 h-4" />
                  </GlassButton>
                  
                  <GlassButton
                    v-else
                    @click="showComment(comment)"
                    variant="secondary"
                    class="!p-2 !text-green-600 hover:!bg-green-50"
                    title="恢复评论"
                  >
                    <EyeIcon class="w-4 h-4" />
                  </GlassButton>
                  
                  <GlassButton
                    @click="confirmDelete(comment)"
                    variant="secondary"
                    class="!p-2 !text-red-600 hover:!bg-red-50"
                    title="删除评论"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </GlassButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        v-if="commentsData && commentsData.total > commentsData.page_size"
        class="px-6 py-4 border-t border-white/20 flex justify-between items-center"
      >
        <div class="text-sm text-gray-600">
          显示 {{ (commentsData.page - 1) * commentsData.page_size + 1 }} - 
          {{ Math.min(commentsData.page * commentsData.page_size, commentsData.total) }} 
          共 {{ commentsData.total }} 条
        </div>
        
        <div class="flex gap-2">
          <GlassButton
            @click="prevPage"
            :disabled="commentsData.page <= 1"
            variant="secondary"
            class="px-3 py-1 text-sm"
          >
            上一页
          </GlassButton>
          <GlassButton
            @click="nextPage"
            :disabled="commentsData.page * commentsData.page_size >= commentsData.total"
            variant="secondary"
            class="px-3 py-1 text-sm"
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
  RefreshCwIcon,
  MessageSquareIcon,
  EyeIcon,
  EyeOffIcon,
  TrashIcon
} from 'lucide-vue-next'
import type { CommentDto, Pagination } from '~/types'
const assetUrl = useAssetUrl()

definePageMeta({
  middleware: ['admin', 'require-perms'],
  requiredPerms: ['MANAGE_COMMENTS']
})

// Stores
const auth = useAuthStore()
const toast = useToast()

// State
const comments = ref<CommentDto[]>([])
const commentsData = ref<Pagination<CommentDto> | null>(null)
const loading = ref(true)
const actionLoading = ref<string | null>(null)
const userAvatarCache = ref<Map<string, string | null>>(new Map())

const filters = reactive({
  status: '',
  post_id: '',
  user_id: ''
})

// Computed
const normalCount = computed(() => {
  return comments.value.filter(comment => comment.status === 0).length
})

const hiddenCount = computed(() => {
  return comments.value.filter(comment => comment.status === 1).length
})

// Methods
const loadComments = async (page = 1) => {
  loading.value = true
  try {
    const api = useApi()
    const params: any = {
      page,
      page_size: 20
    }

    if (filters.status) params.status = parseInt(filters.status)
    if (filters.post_id) params.post_id = filters.post_id
    if (filters.user_id) params.user_id = filters.user_id

    const data = await api.getAdminComments(params)

    // Batch fetch user avatars
    const userIds = [...new Set(data.items.map(comment => comment.user_id))] as string[]
    const uncachedIds = userIds.filter(id => !userAvatarCache.value.has(id))

    if (uncachedIds.length > 0) {
      await Promise.all(uncachedIds.map(async (userId) => {
        try {
          const user = await api.getUser(userId)
          userAvatarCache.value.set(userId, user.avatar_url || null)
        } catch {
          userAvatarCache.value.set(userId, null)
        }
      }))
    }

    // Enrich comments with avatar URLs
    const enrichedComments = data.items.map(comment => ({
      ...comment,
      user_avatar_url: userAvatarCache.value.get(comment.user_id) ?? null
    })) as CommentDto[]

    comments.value = enrichedComments
    commentsData.value = data
  } catch (error: any) {
    toast.error('加载评论列表失败')
  } finally {
    loading.value = false
  }
}

const refresh = () => {
  loadComments(1)
}

const applyFilters = () => {
  loadComments(1)
}

const prevPage = () => {
  if (commentsData.value && commentsData.value.page > 1) {
    loadComments(commentsData.value.page - 1)
  }
}

const nextPage = () => {
  if (commentsData.value && commentsData.value.page * commentsData.value.page_size < commentsData.value.total) {
    loadComments(commentsData.value.page + 1)
  }
}

const hideComment = async (comment: CommentDto) => {
  const { confirm } = useAdminDialog()
  const confirmed = await confirm({
    title: '确认隐藏',
    message: '确定要隐藏这条评论吗？',
    confirmText: '确认隐藏',
    cancelText: '取消'
  })

  if (!confirmed) return

  actionLoading.value = comment.id
  try {
    const api = useApi()
    await api.hideComment(comment.id, true)
    comment.status = 1
    toast.success('评论已隐藏')
  } catch (error) {
    toast.error('操作失败')
  } finally {
    actionLoading.value = null
  }
}

const showComment = async (comment: CommentDto) => {
  const { confirm } = useAdminDialog()
  const confirmed = await confirm({
    title: '确认恢复',
    message: '确定要恢复这条评论吗？',
    confirmText: '确认恢复',
    cancelText: '取消'
  })

  if (!confirmed) return

  actionLoading.value = comment.id
  try {
    const api = useApi()
    await api.hideComment(comment.id, false)
    comment.status = 0
    toast.success('评论已恢复')
  } catch (error) {
    toast.error('操作失败')
  } finally {
    actionLoading.value = null
  }
}

const confirmDelete = async (comment: CommentDto) => {
  const { confirm } = useAdminDialog()
  const confirmed = await confirm({
    title: '确认删除',
    message: '确定要删除这条评论吗？删除后无法恢复。',
    confirmText: '确认删除',
    cancelText: '取消'
  })

  if (!confirmed) return

  actionLoading.value = comment.id
  try {
    const api = useApi()
    await api.deleteComment(comment.id)

    // Remove from local list
    comments.value = comments.value.filter(c => c.id !== comment.id)
    if (commentsData.value) {
      commentsData.value.total -= 1
    }

    toast.success('评论已删除')
  } catch (error) {
    toast.error('删除失败')
  } finally {
    actionLoading.value = null
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const commentDisplayName = (c: CommentDto): string => {
  const anyC: any = c as any
  return (
    anyC.user_display_name || anyC.user?.display_name || anyC.user_name || `用户${c.user_id?.slice(0, 6)}`
  )
}

// Initialize
onMounted(() => {
  loadComments()
})

// SEO
useHead({
  title: '评论管理 - Love Wall',
  meta: [
    { name: 'description', content: '审核和管理用户评论' }
  ]
})
</script>
