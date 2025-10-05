<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">我的表白</h1>
      <p class="text-gray-600 mt-2">管理你发布的所有表白内容</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <GlassCard class="p-6 text-center">
        <div class="text-2xl font-bold text-brand-600 mb-1">{{ postsData?.total || 0 }}</div>
        <div class="text-sm text-gray-600">总表白数</div>
      </GlassCard>
      
      <GlassCard class="p-6 text-center">
        <div class="text-2xl font-bold text-green-600 mb-1">{{ featuredCount }}</div>
        <div class="text-sm text-gray-600">精华表白</div>
      </GlassCard>
      
      <GlassCard class="p-6 text-center">
        <div class="text-2xl font-bold text-blue-600 mb-1">{{ pinnedCount }}</div>
        <div class="text-sm text-gray-600">置顶表白</div>
      </GlassCard>
    </div>

    <!-- Controls -->
    <GlassCard class="p-4">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div class="flex gap-3">
          <NuxtLink to="/posts/new" class="glass-button">
            <PlusIcon class="w-4 h-4 mr-2" />
            发布新表白
          </NuxtLink>
        </div>

        <!-- Filters -->
        <div class="flex gap-2">
          <select
            v-model="filters.status"
            @change="applyFilters"
            class="glass-input px-3 py-2 text-sm"
          >
            <option value="">全部状态</option>
            <option value="0">已发布</option>
            <option value="1">已隐藏</option>
          </select>
          
          <select
            v-model="filters.featured"
            @change="applyFilters"
            class="glass-input px-3 py-2 text-sm"
          >
            <option value="">全部类型</option>
            <option value="true">精华</option>
            <option value="false">普通</option>
          </select>
        </div>
      </div>
    </GlassCard>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <LoadingSpinner size="lg" />
    </div>

    <!-- Empty State -->
    <div v-else-if="!posts.length" class="text-center py-12">
      <GlassCard class="p-12">
        <div class="w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <HeartIcon class="w-8 h-8 text-white" />
        </div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">还没有发布表白</h3>
        <p class="text-gray-600 mb-6">分享你的第一个爱意表达吧！</p>
        <!-- 移除底部发布按钮，保留顶部入口 -->
      </GlassCard>
    </div>

    <!-- Posts List -->
    <div v-else class="space-y-4">
      <div
        v-for="post in sortedPosts"
        :key="post.id"
        class="group relative"
      >
        <GlassCard class="p-6 hover:shadow-glow-lg transition-all cursor-pointer" @click="handleCardClick(post)">
          <div class="flex gap-4">
            <!-- Image -->
            <div class="w-24 flex-shrink-0">
              <img
                v-if="post.images?.length"
                :src="assetUrl(post.images[0])"
                :alt="`${post.author_name}对${post.target_name}的表白`"
                class="w-24 h-24 object-cover rounded-lg"
              >
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-2">
                  <h3 class="text-lg font-semibold text-gray-800">
                    {{ post.author_name }} → {{ post.target_name }}
                  </h3>
                  
                  <!-- Badges -->
                  <div class="flex gap-1">
                    <span
                      v-if="post.status === 0 && post.is_featured"
                      class="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full"
                    >
                      精华
                    </span>
                    <span
                      v-if="post.status === 0 && post.is_pinned"
                      class="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full"
                    >
                      置顶
                    </span>
                    <span
                      v-if="post.status === 1"
                      class="px-2 py-0.5 text-xs bg-gray-100 text-gray-800 rounded-full"
                    >
                      已隐藏
                    </span>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">

                  
                  <GlassButton
                    v-if="canEdit(post)"
                    @click.stop="editPost(post)"
                    variant="secondary"
                    class="!p-2"
                    title="编辑"
                  >
                    <EditIcon class="w-4 h-4" />
                  </GlassButton>
                  
                  <GlassButton
                    @click.stop="confirmDelete(post)"
                    variant="secondary"
                    class="!p-2 !text-red-600 hover:!bg-red-50"
                    title="删除"
                  >
                    <Trash2Icon class="w-4 h-4" />
                  </GlassButton>
                </div>
              </div>

              <p class="text-gray-700 leading-relaxed line-clamp-3 mb-3">{{ post.content }}</p>
              
              <div class="flex items-center justify-between text-sm text-gray-500">
                <div class="flex items-center gap-4">
                  <span class="flex items-center gap-1">
                    <CalendarIcon class="w-4 h-4" />
                    {{ formatDate(post.created_at) }}
                  </span>
                  
                  <span v-if="post.updated_at && post.updated_at !== post.created_at" class="flex items-center gap-1">
                    <ClockIcon class="w-4 h-4" />
                    已编辑
                  </span>
                </div>

                <div class="flex items-center gap-3">
                  <span class="flex items-center gap-1">
                    <MessageSquareIcon class="w-4 h-4" />
                    {{ post.comment_count ?? '—' }}
                  </span>
                  <span class="flex items-center gap-1">
                    <EyeIcon class="w-4 h-4" />
                    {{ post.view_count ?? '—' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      <!-- Load More -->
      <div
        v-if="postsData && postsData.page * postsData.page_size < postsData.total"
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
          确定要删除表白"{{ deleteModal.post?.author_name }} → {{ deleteModal.post?.target_name }}"吗？
          删除后无法恢复。
        </p>
        <div class="flex gap-3 justify-end">
          <GlassButton
            @click="deleteModal.show = false"
            variant="secondary"
          >
            取消
          </GlassButton>
          <GlassButton
            @click="deletePost"
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
  PlusIcon,
  RefreshCwIcon,
  HeartIcon,
  EyeIcon,
  EditIcon,
  Trash2Icon,
  CalendarIcon,
  ClockIcon,
  MessageSquareIcon
} from 'lucide-vue-next'
import type { PostDto, Pagination } from '~/types'

definePageMeta({
  middleware: 'auth'
})

// Stores
const auth = useAuthStore()
const toast = useToast()
const router = useRouter()
const assetUrl = useAssetUrl()

// State
const posts = ref<PostDto[]>([])
const postsData = ref<Pagination<PostDto> | null>(null)
const loading = ref(true)
const loadingMore = ref(false)
const deleting = ref(false)

const filters = reactive({
  status: '',
  featured: ''
})

const deleteModal = reactive({
  show: false,
  post: null as PostDto | null
})

// Computed
const featuredCount = computed(() => {
  return posts.value.filter(post => post.is_featured).length
})

const pinnedCount = computed(() => {
  return posts.value.filter(post => post.is_pinned).length
})

// Methods
const loadPosts = async (page = 1, reset = false) => {
  if (page === 1) {
    loading.value = true
  } else {
    loadingMore.value = true
  }

  try {
    const api = useApi()
    // Note: We need a "my posts" endpoint. For now, we'll simulate it
    // In real implementation, there should be an endpoint like `/my/posts`
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

    // Fetch my posts via backend endpoint
    const data = await api.getUserPosts(auth.currentUser!.id, params)
    if (reset || page === 1) {
      posts.value = data.items
    } else {
      posts.value.push(...data.items)
    }
    postsData.value = data
  } catch (error: any) {
    toast.error('加载表白列表失败')
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const loadMore = () => {
  if (postsData.value) {
    loadPosts(postsData.value.page + 1)
  }
}

const applyFilters = () => {
  loadPosts(1, true)
}

const refresh = () => {
  loadPosts(1, true)
}

// Counts are returned inline per item; no extra stats fetch

const canEdit = (post: PostDto) => {
  if (!post.created_at) return false
  const createdAt = new Date(post.created_at)
  const now = new Date()
  const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60)
  return diffMinutes <= 15 || auth.hasPerm('MANAGE_POSTS')
}

const editPost = (post: PostDto) => {
  // Open detail with edit modal via query flag
  router.push(`/posts/${post.id}?edit=1`)
}

const goDetail = (post: PostDto) => {
  router.push(`/posts/${post.id}`)
}

const handleCardClick = (post: PostDto) => {
  if (post.status !== 0) return
  goDetail(post)
}
const confirmDelete = (post: PostDto) => {
  deleteModal.post = post
  deleteModal.show = true
}

const deletePost = async () => {
  if (!deleteModal.post) return
  
  deleting.value = true
  try {
    const api = useApi()
    await api.deletePost(deleteModal.post.id)
    
    // Remove from local list
    posts.value = posts.value.filter(p => p.id !== deleteModal.post!.id)
    if (postsData.value) {
      postsData.value.total -= 1
    }
    
    toast.success('表白已删除')
    deleteModal.show = false
    deleteModal.post = null
  } catch (error) {
    toast.error('删除失败')
  } finally {
    deleting.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 全局排序优先级: 置顶+精华 > 置顶 > 精华 > 普通 > 隐藏(> 已删除)
const sortedPosts = computed(() =>
  posts.value.slice().sort((a, b) => {
    const score = (p: PostDto) => {
      if ((p as any).status === 2) return 5
      if ((p as any).status === 1) return 4
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

// Initialize
onMounted(() => {
  loadPosts()
})

// SEO
useHead({
  title: '我的表白 - 郑州四中表白墙',
  meta: [
    { name: 'description', content: '管理你发布的所有表白内容' }
  ]
})
</script>

