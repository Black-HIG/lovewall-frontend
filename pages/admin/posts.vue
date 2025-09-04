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
                  v-if="post.image_path"
                  :src="assetUrl(post.image_path)"
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
                    <div class="flex gap-2">
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
                  <GlassButton
                    v-if="auth.hasPerm('PIN_POST')"
                    @click.stop="togglePin(post)"
                    :loading="actionLoading === post.id"
                    variant="secondary"
                    class="text-sm px-3 py-1"
                  >
                    {{ post.is_pinned ? '取消置顶' : '置顶' }}
                  </GlassButton>
                  
                  <GlassButton
                    v-if="auth.hasPerm('FEATURE_POST')"
                    @click.stop="toggleFeature(post)"
                    :loading="actionLoading === post.id"
                    variant="secondary"
                    class="text-sm px-3 py-1"
                  >
                    {{ post.is_featured ? '取消精华' : '精华' }}
                  </GlassButton>
                  
                  <GlassButton
                    v-if="auth.hasPerm('HIDE_POST') && post.status === 0"
                    @click.stop="hidePost(post)"
                    :loading="actionLoading === post.id"
                    variant="secondary"
                    class="text-sm px-3 py-1 !text-yellow-600"
                  >
                    隐藏
                  </GlassButton>
                  
                  <GlassButton
                    v-if="auth.hasPerm('HIDE_POST') && post.status === 1"
                    @click.stop="showPost(post)"
                    :loading="actionLoading === post.id"
                    variant="secondary"
                    class="text-sm px-3 py-1 !text-green-600"
                  >
                    恢复
                  </GlassButton>
                  
                  <GlassButton
                    v-if="(auth.isSuperadmin || auth.hasPerm('DELETE_POST')) && post.status === 2"
                    @click.stop="showPost(post)"
                    :loading="actionLoading === post.id"
                    variant="secondary"
                    class="text-sm px-3 py-1 !text-green-600"
                  >
                    恢复
                  </GlassButton>
                  
                  <GlassButton
                    v-if="auth.hasPerm('DELETE_POST')"
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
            :loading="actionLoading === deleteModal.post?.id"
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
  RefreshCwIcon,
  FileTextIcon,
  EyeIcon,
  CalendarIcon
} from 'lucide-vue-next'
import type { PostDto, Pagination } from '~/types'

definePageMeta({
  middleware: 'admin'
})

// Stores
const auth = useAuthStore()
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
  post: null as PostDto | null
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

const togglePin = async (post: PostDto) => {
  actionLoading.value = post.id
  try {
    const api = useApi()
    await api.pinPost(post.id, !post.is_pinned)
    post.is_pinned = !post.is_pinned
    toast.success(post.is_pinned ? '已置顶' : '已取消置顶')
  } catch (error) {
    toast.error('操作失败')
  } finally {
    actionLoading.value = null
  }
}

const toggleFeature = async (post: PostDto) => {
  actionLoading.value = post.id
  try {
    const api = useApi()
    await api.featurePost(post.id, !post.is_featured)
    post.is_featured = !post.is_featured
    toast.success(post.is_featured ? '已设为精华' : '已取消精华')
  } catch (error) {
    toast.error('操作失败')
  } finally {
    actionLoading.value = null
  }
}

const hidePost = async (post: PostDto) => {
  actionLoading.value = post.id
  try {
    const api = useApi()
    await api.hidePost(post.id, true)
    post.status = 1
    toast.success('表白已隐藏')
  } catch (error) {
    toast.error('操作失败')
  } finally {
    actionLoading.value = null
  }
}

const showPost = async (post: PostDto) => {
  actionLoading.value = post.id
  try {
    const api = useApi()
    if (post.status === 2) {
      await api.restorePost(post.id)
      post.status = 0
    } else {
      await api.hidePost(post.id, false)
      post.status = 0
    }
    toast.success('表白已恢复')
  } catch (error) {
    toast.error('操作失败')
  } finally {
    actionLoading.value = null
  }
}

const confirmDelete = (post: PostDto) => {
  deleteModal.post = post
  deleteModal.show = true
}

const deletePost = async () => {
  if (!deleteModal.post) return
  
  actionLoading.value = deleteModal.post.id
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
    actionLoading.value = null
  }
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
