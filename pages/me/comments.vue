<template>
  <div class="w-full space-y-6">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">我的评论</h1>
      <p class="text-gray-600 mt-2">管理你发表的所有评论</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <GlassCard class="p-6 text-center">
        <div class="text-2xl font-bold text-green-600 mb-1">{{ commentsData?.total || 0 }}</div>
        <div class="text-sm text-gray-600">总评论数</div>
      </GlassCard>
      
      <GlassCard class="p-6 text-center">
        <div class="text-2xl font-bold text-blue-600 mb-1">{{ visibleCount }}</div>
        <div class="text-sm text-gray-600">正常显示</div>
      </GlassCard>
      
      <GlassCard class="p-6 text-center">
        <div class="text-2xl font-bold text-gray-600 mb-1">{{ hiddenCount }}</div>
        <div class="text-sm text-gray-600">已隐藏</div>
      </GlassCard>
    </div>

    <!-- Controls -->
    <GlassCard class="p-4">
      <div class="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4">
        <!-- Filters -->
        <div class="flex gap-2">
          <select
            v-model="filters.status"
            @change="applyFilters"
            class="glass-input px-3 py-2 text-sm"
          >
            <option value="">全部状态</option>
            <option value="0">正常显示</option>
            <option value="1">已隐藏</option>
          </select>
        </div>
      </div>
    </GlassCard>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <LoadingSpinner size="lg" />
    </div>

    <!-- Empty State -->
    <div v-else-if="!comments.length" class="text-center py-12">
      <GlassCard class="p-12">
        <div class="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquareIcon class="w-8 h-8 text-white" />
        </div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">还没有发表评论</h3>
        <p class="text-gray-600 mb-6">去看看别人的表白，发表你的看法吧！</p>
        <div class="flex justify-center">
          <NuxtLink to="/" class="flex items-center gap-2 px-4 py-2 text-brand-600 hover:text-brand-700 hover:underline font-medium transition-colors">
            浏览表白 →
          </NuxtLink>
        </div>
      </GlassCard>
    </div>

    <!-- Comments List -->
    <div v-else class="space-y-4">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="group"
      >
        <GlassCard class="p-6 hover:shadow-glow-lg transition-all">
          <div class="space-y-4">
            <!-- Comment Header -->
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="relative">
                  <!-- 管理员光圈效果 -->
                  <div
                    v-if="auth.currentUser?.isadmin"
                    class="absolute -inset-0.5 rounded-full bg-blue-500/30 blur-[6px]"
                  ></div>

                  <!-- 头像容器 -->
                  <div class="relative w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    <img
                      v-if="auth.currentUser?.avatar_url"
                      :src="assetUrl(auth.currentUser.avatar_url)"
                      :alt="auth.userDisplayName"
                      class="w-8 h-8 rounded-full object-cover border border-white/20"
                    >
                    <span v-else>
                      {{ auth.userDisplayName.slice(0, 2) }}
                    </span>
                  </div>
                </div>
                
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-medium text-gray-800">
                      {{ auth.userDisplayName }}
                    </span>
                    <span
                      v-if="comment.status === 1"
                      class="px-2 py-0.5 text-xs bg-gray-100 text-gray-800 rounded-full"
                    >
                      已隐藏
                    </span>
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ formatDate(comment.created_at) }}
                    <span v-if="comment.updated_at && comment.updated_at !== comment.created_at">
                      · 已编辑
                    </span>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <NuxtLink
                  :to="`/posts/${comment.post_id}`"
                  class="glass-button-secondary !p-2"
                  title="查看原帖"
                >
                  <ExternalLinkIcon class="w-4 h-4" />
                </NuxtLink>
                
                <GlassButton
                  v-if="canEdit(comment)"
                  @click="startEdit(comment)"
                  variant="secondary"
                  class="!p-2"
                  title="编辑评论"
                >
                  <EditIcon class="w-4 h-4" />
                </GlassButton>
                
                <GlassButton
                  @click="confirmDelete(comment)"
                  variant="secondary"
                  class="!p-2 !text-red-600 hover:!bg-red-50"
                  title="删除评论"
                >
                  <Trash2Icon class="w-4 h-4" />
                </GlassButton>
              </div>
            </div>

            <!-- Comment Content -->
            <div v-if="editingComment?.id === comment.id" class="space-y-3">
              <GlassTextarea
                v-model="editForm.content"
                :error="editErrors.content"
                rows="3"
                class="w-full"
                placeholder="编辑你的评论..."
              />
              <div class="flex gap-2 justify-end">
                <GlassButton
                  @click="cancelEdit"
                  variant="secondary"
                  class="text-sm px-3 py-1"
                >
                  取消
                </GlassButton>
                <GlassButton
                  @click="saveEdit"
                  :loading="editing"
                  class="text-sm px-3 py-1"
                >
                  保存
                </GlassButton>
              </div>
            </div>
            
            <div v-else class="prose max-w-none">
              <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">{{ comment.content }}</p>
            </div>

            <!-- Referenced Post Info -->
            <div class="bg-white/10 rounded-lg p-3 border border-white/10">
              <div class="text-sm text-gray-600 mb-1">评论的表白：</div>
              <div class="text-sm font-medium text-gray-800">
                来自帖子 ID: {{ comment.post_id }}
              </div>
              <NuxtLink
                :to="`/posts/${comment.post_id}`"
                class="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 hover:underline font-medium transition-colors mt-2"
              >
                查看完整表白 →
              </NuxtLink>
            </div>
          </div>
        </GlassCard>
      </div>

      <!-- Load More -->
      <div
        v-if="commentsData && commentsData.page * commentsData.page_size < commentsData.total"
        class="text-center pt-6"
      >
        <GlassButton
          @click="loadMore"
          :loading="loadingMore"
          variant="secondary"
        >
          加载更多
        </GlassButton>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="deleteModal.show"
      class="fixed inset-0 z-[9000] flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <GlassCard class="p-6 max-w-md mx-4">
        <h3 class="text-lg font-semibold mb-4">确认删除</h3>
        <p class="text-gray-600 mb-6">
          确定要删除这条评论吗？删除后无法恢复。
        </p>
        <div class="flex gap-3 justify-end">
          <GlassButton
            @click="deleteModal.show = false"
            variant="secondary"
          >
            取消
          </GlassButton>
          <GlassButton
            @click="deleteComment"
            :loading="deleting"
            class="!bg-red-600 hover:!bg-red-700"
          >
            确认删除
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  MessageSquareIcon,
  ExternalLinkIcon,
  EditIcon,
  Trash2Icon
} from 'lucide-vue-next'
import type { CommentDto, Pagination, CommentForm } from '~/types'

definePageMeta({
  middleware: 'auth'
})

// Stores
const auth = useAuthStore()
const toast = useToast()
const assetUrl = useAssetUrl()

// State
const comments = ref<CommentDto[]>([])
const commentsData = ref<Pagination<CommentDto> | null>(null)
const loading = ref(true)
const loadingMore = ref(false)
const editing = ref(false)
const deleting = ref(false)

const filters = reactive({
  status: ''
})

const editingComment = ref<CommentDto | null>(null)
const editForm = reactive<CommentForm>({
  content: ''
})
const editErrors = ref<Partial<CommentForm>>({})

const deleteModal = reactive({
  show: false,
  comment: null as CommentDto | null
})

// Computed
const visibleCount = computed(() => {
  return comments.value.filter(comment => comment.status === 0).length
})

const hiddenCount = computed(() => {
  return comments.value.filter(comment => comment.status === 1).length
})

// Methods
const loadComments = async (page = 1, reset = false) => {
  if (page === 1) {
    loading.value = true
  } else {
    loadingMore.value = true
  }

  try {
    const api = useApi()
    const params: any = {
      page,
      page_size: 20
    }
    
    if (filters.status) {
      params.status = parseInt(filters.status)
    }

    const data = await api.getMyComments(params)
    
    if (reset || page === 1) {
      comments.value = data.items
    } else {
      comments.value.push(...data.items)
    }
    
    commentsData.value = data
  } catch (error: any) {
    toast.error('加载评论列表失败')
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const loadMore = () => {
  if (commentsData.value) {
    loadComments(commentsData.value.page + 1)
  }
}

const applyFilters = () => {
  loadComments(1, true)
}

const refresh = () => {
  loadComments(1, true)
}

const canEdit = (comment: CommentDto) => {
  if (!comment.created_at) return false
  const createdAt = new Date(comment.created_at)
  const now = new Date()
  const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60)
  return diffMinutes <= 15 || auth.hasPerm('MANAGE_COMMENTS')
}

const startEdit = (comment: CommentDto) => {
  editingComment.value = comment
  editForm.content = comment.content
  editErrors.value = {}
}

const cancelEdit = () => {
  editingComment.value = null
  editForm.content = ''
  editErrors.value = {}
}

const saveEdit = async () => {
  if (!editingComment.value) return
  
  editErrors.value = {}
  // 长度限制：500 个字符
  if (editForm.content && editForm.content.length > 500) {
    editErrors.value.content = '评论内容不能超过 500 个字符'
    toast.error('评论内容不能超过 500 个字符')
    return
  }
  
  if (!editForm.content.trim()) {
    editErrors.value.content = '评论内容不能为空'
    return
  }
  
  editing.value = true
  try {
    const api = useApi()
    const updatedComment = await api.updateComment(editingComment.value.id, editForm)
    
    // Update local comment
    const index = comments.value.findIndex(c => c.id === editingComment.value!.id)
    if (index >= 0) {
      comments.value[index] = { ...comments.value[index], ...updatedComment }
    }
    
    toast.success('评论已更新')
    cancelEdit()
  } catch (error: any) {
    toast.error('更新评论失败')
  } finally {
    editing.value = false
  }
}

const confirmDelete = (comment: CommentDto) => {
  deleteModal.comment = comment
  deleteModal.show = true
}

const deleteComment = async () => {
  if (!deleteModal.comment) return
  
  deleting.value = true
  try {
    const api = useApi()
    await api.deleteComment(deleteModal.comment.id)
    
    // Remove from local list or mark as hidden
    const index = comments.value.findIndex(c => c.id === deleteModal.comment!.id)
    if (index >= 0) {
      comments.value[index].status = 1 // Mark as hidden
    }
    
    if (commentsData.value) {
      commentsData.value.total -= 1
    }
    
    toast.success('评论已删除')
    deleteModal.show = false
    deleteModal.comment = null
  } catch (error) {
    toast.error('删除失败')
  } finally {
    deleting.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// Initialize
onMounted(() => {
  loadComments()
})

// SEO
useHead({
  title: '我的评论 - Love Wall',
  meta: [
    { name: 'description', content: '管理你发表的所有评论' }
  ]
})
</script>
