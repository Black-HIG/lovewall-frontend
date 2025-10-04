<template>
  <div class="w-full space-y-6">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">表白管理</h1>
      <p class="text-gray-600 mt-2">审核、管理和操作表白内容</p>
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
            <option value="0">已发布</option>
            <option value="1">已隐藏</option>
            <option value="2">已删除</option>
          </select>
          
          <select
            v-model="filters.featured"
            @change="applyFilters"
            class="glass-input px-3 py-2"
          >
            <option value="">全部类型</option>
            <option value="true">精华</option>
            <option value="false">普通</option>
          </select>
          
          <select
            v-model="filters.pinned"
            @change="applyFilters"
            class="glass-input px-3 py-2"
          >
            <option value="">全部</option>
            <option value="true">置顶</option>
            <option value="false">未置顶</option>
          </select>
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
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <GlassCard class="p-4 text-center">
        <div class="text-2xl font-bold text-blue-600 mb-1">{{ postsData?.total || 0 }}</div>
        <div class="text-sm text-gray-600">总表白数</div>
      </GlassCard>
      
      <GlassCard class="p-4 text-center">
        <div class="text-2xl font-bold text-amber-600 mb-1">{{ featuredCount }}</div>
        <div class="text-sm text-gray-600">精华表白</div>
      </GlassCard>
      
      <GlassCard class="p-4 text-center">
        <div class="text-2xl font-bold text-blue-600 mb-1">{{ pinnedCount }}</div>
        <div class="text-sm text-gray-600">置顶表白</div>
      </GlassCard>
      
      <GlassCard class="p-4 text-center">
        <div class="text-2xl font-bold text-gray-600 mb-1">{{ hiddenCount }}</div>
        <div class="text-sm text-gray-600">已隐藏</div>
      </GlassCard>
    </div>

    <!-- Posts List -->
    <div class="space-y-4">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>

      <!-- Empty State -->
      <div v-else-if="!posts.length" class="text-center py-12">
        <GlassCard class="p-12">
          <div class="w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileTextIcon class="w-8 h-8 text-white" />
          </div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">未找到表白</h3>
          <p class="text-gray-600">尝试调整筛选条件</p>
        </GlassCard>
      </div>

      <!-- Posts -->
      <div v-else>
        <div
          v-for="post in sortedPosts"
          :key="post.id"
          class="group"
        >
          <GlassCard class="p-6 hover:shadow-glow-lg transition-all cursor-pointer" @click="goDetail(post)">
            <div class="flex gap-6">
              <!-- Image -->
              <div class="w-32 flex-shrink-0">
                <img
                  v-if="post.images?.length"
                  :src="assetUrl(post.images[0])"
                  :alt="`${post.author_name}对${post.target_name}的表白`"
                  class="w-32 h-32 object-cover rounded-xl"
                >
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between mb-3">
                  <div>
                    <div class="flex items-center gap-2 mb-2">
                      <h3 class="text-lg font-semibold text-gray-800">
                        {{ post.author_name }} → {{ post.target_name }}
                      </h3>
                      
                      <TagBadge
                        v-if="post.author_tag"
                        :title="post.author_tag.title"
                        :background="post.author_tag.background_color"
                        :text="post.author_tag.text_color"
                      />
                    </div>
                    
                    <div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <CalendarIcon class="w-4 h-4" />
                      <span>{{ formatDate(post.created_at) }}</span>
                      
                      <span v-if="post.updated_at && post.updated_at !== post.created_at" class="ml-2">
                        (已编辑)
                      </span>
                    </div>

                    <!-- Status badges -->
                    <div class="flex gap-2 flex-wrap">
                      <span
                        :class="{
                          'bg-green-100 text-green-800': post.status === 0,
                          'bg-yellow-100 text-yellow-800': post.status === 1,
                          'bg-red-100 text-red-800': post.status === 2
                        }"
                        class="px-2 py-0.5 text-xs rounded-full"
                      >
                        {{ getStatusText(post.status) }}
                      </span>
                      
                      <!-- 审核状态 -->
                      <span
                        v-if="post.audit_status === 2"
                        class="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full"
                        :title="post.audit_msg || 'AI审核未通过'"
                      >
                        AI拒绝
                      </span>
                      
                      <span
                        v-if="post.manual_review_requested"
                        class="px-2 py-0.5 text-xs bg-orange-100 text-orange-800 rounded-full"
                        title="用户已申请人工复核"
                      >
                        申请复核
                      </span>
                      
                      <span
                        v-if="post.status === 0 && post.is_featured"
                        class="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full"
                      >
                        精华
                      </span>
                      
                      <span
                        v-if="post.status === 0 && post.is_pinned"
                        class="px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full"
                      >
                        置顶
                      </span>
                    </div>
                    
                    <!-- AI拒绝原因 -->
                    <div v-if="post.audit_status === 2 && post.audit_msg" class="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <p class="text-xs text-red-700">
                        <strong>AI审核意见：</strong>{{ post.audit_msg }}
                      </p>
                    </div>
                  </div>

                  <!-- Quick Actions -->
                  <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <NuxtLink
                      :to="`/posts/${post.id}`"
                      class="p-2 text-gray-600 hover:text-brand-600 transition-colors"
                      @click.stop
                      title="查看详情"
                    >
                      <EyeIcon class="w-4 h-4" />
                    </NuxtLink>
                  </div>
                </div>

                <p class="text-gray-700 leading-relaxed line-clamp-3 mb-4">{{ post.content }}</p>
                
                <!-- Admin Actions -->
                <div class="flex flex-wrap gap-2 pt-3 border-t border-white/10">
                  <!-- Moderation: approve/reject -->
                  <GlassButton
                    v-if="permissions.hasPostModerationPermission && post.status !== 0"
                    @click.stop="approvePost(post)"
                    :loading="actionLoading === post.id"
                    class="text-sm px-3 py-1 !text-green-600"
                    variant="secondary"
                  >
                    通过审核
                  </GlassButton>
                  <GlassButton
                    v-if="permissions.hasPostModerationPermission && post.status !== 0"
                    @click.stop="openReject(post)"
                    :loading="actionLoading === post.id"
                    class="text-sm px-3 py-1 !text-red-600"
                    variant="secondary"
                  >
                    拒绝审核
                  </GlassButton>

                  <GlassButton
                    v-if="auth.hasPerm('MANAGE_FEATURED')"
                    @click.stop="togglePin(post)"
                    :loading="actionLoading === post.id"
                    variant="secondary"
                    class="text-sm px-3 py-1"
                  >
                    {{ post.is_pinned ? '取消置顶' : '置顶' }}
                  </GlassButton>
                  
                  <GlassButton
                    v-if="auth.hasPerm('MANAGE_FEATURED')"
                    @click.stop="toggleFeature(post)"
                    :loading="actionLoading === post.id"
                    variant="secondary"
                    class="text-sm px-3 py-1"
                  >
                    {{ post.is_featured ? '取消精华' : '精华' }}
                  </GlassButton>
                  
                  <GlassButton
                    v-if="auth.hasPerm('MANAGE_POSTS') && post.status === 0"
                    @click.stop="hidePost(post)"
                    :loading="actionLoading === post.id"
                    variant="secondary"
                    class="text-sm px-3 py-1 !text-yellow-600"
                  >
                    隐藏
                  </GlassButton>
                  
                  <GlassButton
                    v-if="auth.hasPerm('MANAGE_POSTS') && post.status === 1"
                    @click.stop="restoreHiddenPost(post)"
                    :loading="actionLoading === post.id"
                    variant="secondary"
                    class="text-sm px-3 py-1 !text-green-600"
                  >
                    恢复
                  </GlassButton>
                  
                  <GlassButton
                    v-if="(auth.isSuperadmin || auth.hasPerm('MANAGE_POSTS')) && post.status === 2"
                    @click.stop="restoreDeletedPost(post)"
                    :loading="actionLoading === post.id"
                    variant="secondary"
                    class="text-sm px-3 py-1 !text-green-600"
                  >
                    恢复
                  </GlassButton>
                  
                  <GlassButton
                    v-if="auth.hasPerm('MANAGE_POSTS')"
                    @click.stop="confirmDelete(post)"
                    :loading="actionLoading === post.id"
                    variant="secondary"
                    class="text-sm px-3 py-1 !text-red-600"
                  >
                    删除
                  </GlassButton>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        <!-- Pagination -->
        <div
          v-if="postsData && postsData.total > postsData.page_size"
          class="flex justify-center pt-6"
        >
          <div class="flex gap-2">
            <GlassButton
              @click="prevPage"
              :disabled="postsData.page <= 1"
              variant="secondary"
              class="px-4 py-2 text-sm"
            >
              上一页
            </GlassButton>
            
            <div class="flex items-center px-4 py-2 text-sm text-gray-600">
              第 {{ postsData.page }} 页，共 {{ Math.ceil(postsData.total / postsData.page_size) }} 页
            </div>
            
            <GlassButton
              @click="nextPage"
              :disabled="postsData.page * postsData.page_size >= postsData.total"
              variant="secondary"
              class="px-4 py-2 text-sm"
            >
              下一页
            </GlassButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal (GlassModal style) -->
    <GlassModal
      :is-open="deleteModal.show"
      title="确认删除"
      max-width="max-w-md"
      @close="closeDeleteModal"
    >
      <p class="text-gray-700 mb-6">
        确定要删除表白“{{ deleteModal.post?.author_name }} → {{ deleteModal.post?.target_name }}”吗？删除后不可恢复。
      </p>
      <div class="space-y-3">
        <label class="text-sm text-gray-700">处理原因（可选）</label>
        <GlassTextarea
          v-model="deleteModal.reason"
          :rows="3"
          placeholder="填写给用户的处理说明"
        />
      </div>

      <template #footer>
        <div class="flex gap-3 justify-end">
          <button type="button" class="glass-button-secondary" @click="closeDeleteModal">
            取消
          </button>
          <button
            type="button"
            class="glass-button !bg-red-600 hover:!bg-red-700"
            :disabled="actionLoading === deleteModal.post?.id"
            @click="deletePost"
          >
            <LoadingSpinner v-if="actionLoading === deleteModal.post?.id" size="sm" class="mr-2" />
            确认删除
          </button>
        </div>
      </template>
    </GlassModal>

    <!-- Moderation Reason Modal -->
    <GlassModal
      :is-open="actionReasonModal.show"
      :title="actionReasonTitle"
      max-width="max-w-md"
      @close="closeActionReasonModal"
    >
      <div class="space-y-3">
        <label class="text-sm text-gray-700">处理原因（可选）</label>
        <GlassTextarea
          v-model="actionReasonModal.reason"
          :rows="3"
          placeholder="这次操作的说明，将同步给相关用户"
        />
      </div>
      <template #footer>
        <div class="flex gap-3 justify-end">
          <GlassButton @click="closeActionReasonModal" variant="secondary">取消</GlassButton>
          <GlassButton :loading="actionLoading === actionReasonModal.post?.id" @click="confirmActionReason">
            {{ actionReasonConfirmText }}
          </GlassButton>
        </div>
      </template>
    </GlassModal>
    
    <!-- Reject Reason Modal -->
    <GlassModal
      :is-open="rejectModal.show"
      title="拒绝审核"
      max-width="max-w-md"
      @close="rejectModal.show = false"
    >
      <div class="space-y-3">
        <label class="text-sm text-gray-700">原因（可选）</label>
        <GlassTextarea v-model="rejectModal.reason" :rows="4" placeholder="填写本次拒绝的原因..." />
      </div>
      <template #footer>
        <div class="flex gap-3 justify-end">
          <GlassButton @click="rejectModal.show = false" variant="secondary">取消</GlassButton>
          <GlassButton :loading="actionLoading === rejectModal.post?.id" @click="rejectPost">确认拒绝</GlassButton>
        </div>
      </template>
    </GlassModal>
  </div>
</template>

<script setup lang="ts">
import {
  RefreshCwIcon,
  FileTextIcon,
  EyeIcon,
  CalendarIcon
} from 'lucide-vue-next'
import type { PostDto, Pagination } from '~/types'
import GlassModal from '~/components/ui/GlassModal.vue'

definePageMeta({
  middleware: 'admin'
})

// Stores
const auth = useAuthStore()
const permissions = usePermissions()
const toast = useToast()
const assetUrl = useAssetUrl()
const router = useRouter()

// State
const posts = ref<PostDto[]>([])
const postsData = ref<Pagination<PostDto> | null>(null)
const loading = ref(true)
const actionLoading = ref<string | null>(null)

const filters = reactive({
  status: '',
  featured: '',
  pinned: ''
})

const deleteModal = reactive({
  show: false,
  post: null as PostDto | null,
  reason: ''
})

const actionReasonModal = reactive({
  show: false,
  post: null as PostDto | null,
  action: 'pin' as 'pin' | 'feature' | 'hide',
  enable: true,
  reason: ''
})

const rejectModal = reactive<{ show: boolean; post: PostDto | null; reason: string }>({
  show: false,
  post: null,
  reason: ''
})

// Computed
const featuredCount = computed(() => {
  return posts.value.filter(post => post.is_featured).length
})

const pinnedCount = computed(() => {
  return posts.value.filter(post => post.is_pinned).length
})

const hiddenCount = computed(() => {
  return posts.value.filter(post => post.status === 1).length
})

// 全局排序优先级: 置顶+精华 > 置顶 > 精华 > 普通 > 隐藏(> 已删除)
const sortedPosts = computed(() =>
  posts.value.slice().sort((a, b) => {
    const score = (p: PostDto) => {
      if (p.status === 2) return 5
      if (p.status === 1) return 4
      if (p.is_pinned && p.is_featured) return 0
      if (p.is_pinned) return 1
      if (p.is_featured) return 2
      return 3
    }
    const sa = score(a)
    const sb = score(b)
    if (sa !== sb) return sa - sb
    const at = new Date(a.created_at).getTime()
    const bt = new Date(b.created_at).getTime()
    return bt - at
  })
)

// Methods
const loadPosts = async (page = 1) => {
  loading.value = true
  try {
    const api = useApi()
    const params: any = {
      page,
      page_size: 20
    }
    
    if (filters.status) {
      params.status = parseInt(filters.status)
    }
    
    if (filters.featured) {
      params.featured = filters.featured === 'true'
    }
    
    if (filters.pinned) {
      params.pinned = filters.pinned === 'true'
    }
    
    const data = await api.moderationPosts(params)
    posts.value = data.items
    postsData.value = data
  } catch (error: any) {
    toast.error('加载表白列表失败')
  } finally {
    loading.value = false
  }
}

const refresh = () => {
  loadPosts(1)
}

const applyFilters = () => {
  loadPosts(1)
}

const prevPage = () => {
  if (postsData.value && postsData.value.page > 1) {
    loadPosts(postsData.value.page - 1)
  }
}

const nextPage = () => {
  if (postsData.value && postsData.value.page * postsData.value.page_size < postsData.value.total) {
    loadPosts(postsData.value.page + 1)
  }
}

const getStatusText = (status: number) => {
  switch (status) {
    case 0: return '已发布'
    case 1: return '已隐藏'
    case 2: return '已删除'
    default: return '未知'
  }
}

const goDetail = (post: PostDto) => {
  router.push(`/posts/${post.id}`)
}

const openActionReason = (post: PostDto, action: 'pin' | 'feature' | 'hide', enable: boolean) => {
  actionReasonModal.post = post
  actionReasonModal.action = action
  actionReasonModal.enable = enable
  actionReasonModal.reason = ''
  actionReasonModal.show = true
}

const closeActionReasonModal = () => {
  actionReasonModal.show = false
  actionReasonModal.reason = ''
}

const togglePin = (post: PostDto) => {
  openActionReason(post, 'pin', !post.is_pinned)
}

const toggleFeature = (post: PostDto) => {
  openActionReason(post, 'feature', !post.is_featured)
}

const hidePost = (post: PostDto) => {
  openActionReason(post, 'hide', true)
}

const restoreHiddenPost = (post: PostDto) => {
  openActionReason(post, 'hide', false)
}

const restoreDeletedPost = async (post: PostDto) => {
  actionLoading.value = post.id
  try {
    const api = useApi()
    await api.restorePost(post.id)
    post.status = 0
    toast.success('表白已恢复')
  } catch (error) {
    toast.error('操作失败')
  } finally {
    actionLoading.value = null
  }
}

const actionReasonTitle = computed(() => {
  if (!actionReasonModal.post) return '处理原因'
  const enable = actionReasonModal.enable
  switch (actionReasonModal.action) {
    case 'pin':
      return enable ? '置顶处理' : '取消置顶处理'
    case 'feature':
      return enable ? '设为精华处理' : '取消精华处理'
    case 'hide':
      return enable ? '隐藏处理' : '恢复处理'
    default:
      return '处理原因'
  }
})

const actionReasonConfirmText = computed(() => {
  const enable = actionReasonModal.enable
  switch (actionReasonModal.action) {
    case 'pin':
      return enable ? '确认置顶' : '确认取消置顶'
    case 'feature':
      return enable ? '确认设为精华' : '确认取消精华'
    case 'hide':
      return enable ? '确认隐藏' : '确认恢复'
    default:
      return '确认'
  }
})

const confirmActionReason = async () => {
  if (!actionReasonModal.post) return
  actionLoading.value = actionReasonModal.post.id
  const reason = actionReasonModal.reason.trim() || undefined
  const api = useApi()
  try {
    if (actionReasonModal.action === 'pin') {
      const res = await api.pinPost(actionReasonModal.post.id, actionReasonModal.enable, reason)
      actionReasonModal.post.is_pinned = res.is_pinned
      toast.success(actionReasonModal.enable ? '已置顶' : '已取消置顶')
    } else if (actionReasonModal.action === 'feature') {
      const res = await api.featurePost(actionReasonModal.post.id, actionReasonModal.enable, reason)
      actionReasonModal.post.is_featured = res.is_featured
      toast.success(actionReasonModal.enable ? '已设为精华' : '已取消精华')
    } else if (actionReasonModal.action === 'hide') {
      const res = await api.hidePost(actionReasonModal.post.id, actionReasonModal.enable, reason)
      actionReasonModal.post.status = res.status
      toast.success(actionReasonModal.enable ? '表白已隐藏' : '表白已恢复')
    }
  } catch (error) {
    toast.error('操作失败')
  } finally {
    actionLoading.value = null
    closeActionReasonModal()
  }
}

const approvePost = async (post: PostDto) => {
  actionLoading.value = post.id
  try {
    const api = useApi()
    await api.adminApprovePost(post.id)
    post.status = 0
    ;(post as any).audit_status = 0
    ;(post as any).audit_msg = null
    toast.success('审核通过')
  } catch (error) {
    toast.error('操作失败')
  } finally {
    actionLoading.value = null
  }
}

const openReject = (post: PostDto) => {
  rejectModal.post = post
  rejectModal.reason = ''
  rejectModal.show = true
}

const rejectPost = async () => {
  if (!rejectModal.post) return
  actionLoading.value = rejectModal.post.id
  try {
    const api = useApi()
    await api.adminRejectPost(rejectModal.post.id, rejectModal.reason || undefined)
    ;(rejectModal.post as any).audit_status = 2
    ;(rejectModal.post as any).audit_msg = rejectModal.reason || (rejectModal.post as any).audit_msg
    toast.success('已拒绝')
    rejectModal.show = false
  } catch (error) {
    toast.error('操作失败')
  } finally {
    actionLoading.value = null
  }
}

const confirmDelete = (post: PostDto) => {
  deleteModal.post = post
  deleteModal.reason = ''
  deleteModal.show = true
}

const deletePost = async () => {
  if (!deleteModal.post) return
  
  actionLoading.value = deleteModal.post.id
  try {
    const api = useApi()
    await api.deletePost(deleteModal.post.id, deleteModal.reason.trim() || undefined)
    
    // Remove from local list
    posts.value = posts.value.filter(p => p.id !== deleteModal.post!.id)
    if (postsData.value) {
      postsData.value.total -= 1
    }
    
    toast.success('表白已删除')
    closeDeleteModal()
  } catch (error) {
    toast.error('删除失败')
  } finally {
    actionLoading.value = null
  }
}

const closeDeleteModal = () => {
  deleteModal.show = false
  deleteModal.reason = ''
  deleteModal.post = null
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// Initialize
onMounted(() => {
  loadPosts()
})

// SEO
useHead({
  title: '表白管理 - Love Wall',
  meta: [
    { name: 'description', content: '审核、管理和操作表白内容' }
  ]
})
</script>


