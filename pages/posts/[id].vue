<template>
  <div class="w-full">
    <div class="max-w-5xl mx-auto space-y-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <LoadingSpinner size="lg" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <div class="glass-card p-8">
        <h1 class="text-2xl font-bold text-red-600 mb-4">加载失败</h1>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <GlassButton @click="refresh" class="glass-button-secondary">
          重新加载
        </GlassButton>
      </div>
    </div>

    <!-- Post Content -->
    <div v-else-if="post" class="space-y-6">
      <!-- Post Card -->
      <GlassCard class="p-6">
        <div class="flex flex-col lg:flex-row gap-6">
          <!-- Image or Author Avatar -->
          <div class="lg:w-1/3">
            <img
              v-if="post.image_path"
              :src="assetUrl(post.image_path)"
              :alt="`${post.author_name}对${post.target_name}的表白`"
              class="w-full rounded-xl object-cover shadow-lg cursor-pointer"
              @click="showImageModal = true"
            >
            <!-- Author Avatar (if no image) -->
            <div 
              v-else
              class="w-24 h-24 mx-auto rounded-full flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-brand-300/50 transition-all"
              @click="navigateToUser(post)"
            >
              <img
                v-if="authorAvatar"
                :src="authorAvatar"
                :alt="post.author_name"
                class="w-24 h-24 rounded-full object-cover border-2 border-white/20"
              >
              <div 
                v-else
                class="w-24 h-24 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center text-white text-lg font-medium border-2 border-white/20"
              >
                {{ post.author_name.slice(0, 2) }}
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1">
            <div class="mb-4">
              <div class="flex items-center gap-2 mb-2">
                <div class="flex items-center gap-2">
                  <!-- Author avatar (if post has image) -->
                  <div 
                    v-if="post.image_path"
                    class="w-8 h-8 rounded-full flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-brand-300/50 transition-all"
                    @click="navigateToUser(post)"
                  >
                    <img
                      v-if="authorAvatar"
                      :src="authorAvatar"
                      :alt="post.author_name"
                      class="w-8 h-8 rounded-full object-cover border border-white/20"
                    >
                    <div 
                      v-else
                      class="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center text-white text-xs font-medium border border-white/20"
                    >
                      {{ post.author_name.slice(0, 2) }}
                    </div>
                  </div>
                  
                  <h1 class="text-2xl font-bold text-gray-800">
                    {{ post.author_name }}
                  </h1>
                  <!-- Author Active Tag -->
                  <TagBadge
                    v-if="post.author_tag"
                    :title="post.author_tag.title"
                    :background="post.author_tag.background_color"
                    :text="post.author_tag.text_color"
                  />
                </div>
                
                <h1 class="text-2xl font-bold text-gray-800">
                  → {{ post.target_name }}
                </h1>
              </div>
              
                <div class="flex items-center gap-2 text-sm text-gray-500">
                  <CalendarIcon class="w-4 h-4" />
                  <span>{{ formatDate(post.created_at) }}</span>
                  
                  <!-- Admin badges -->
                  <div class="flex gap-2 ml-auto">
                    <span
                    v-if="post.is_featured"
                    class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                  >
                    精华
                  </span>
                  <span
                    v-if="post.is_pinned"
                    class="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full"
                  >
                    置顶
                  </span>
                  <span
                    v-if="(auth.isSuperadmin || auth.hasAnyPerm(['HIDE_POST','DELETE_POST','EDIT_POST'])) && post.status === 1"
                    class="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full"
                  >
                    已隐藏
                  </span>
                </div>
              </div>
            </div>

            <!-- Post content -->
            <div class="prose prose-lg max-w-none">
              <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">{{ post.content }}</p>
            </div>

            <!-- Admin actions -->
            <div v-if="showAdminActions" class="mt-6 pt-4 border-t border-white/20">
              <div class="flex flex-wrap gap-2">
                <template v-if="post.status === 0">
                  <GlassButton
                    v-if="auth.hasPerm('PIN_POST')"
                    @click="togglePin"
                    :loading="actionLoading"
                    class="glass-button-secondary text-sm px-3 py-1"
                  >
                    {{ post.is_pinned ? '取消置顶' : '置顶' }}
                  </GlassButton>
                  
                  <GlassButton
                    v-if="auth.hasPerm('FEATURE_POST')"
                    @click="toggleFeature"
                    :loading="actionLoading"
                    class="glass-button-secondary text-sm px-3 py-1"
                  >
                    {{ post.is_featured ? '取消精华' : '精华' }}
                  </GlassButton>
                </template>
                
                <GlassButton
                  v-if="auth.hasPerm('HIDE_POST') && post.status !== 2"
                  @click="toggleHide"
                  :loading="actionLoading"
                  class="glass-button-secondary text-sm px-3 py-1"
                >
                  {{ post.status === 1 ? '恢复' : '隐藏' }}
                </GlassButton>
                
                <GlassButton
                  v-if="auth.hasPerm('DELETE_POST')"
                  @click="confirmDelete"
                  :loading="actionLoading"
                  class="glass-button-secondary text-sm px-3 py-1 !text-red-600"
                >
                  删除
                </GlassButton>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      <!-- Comments Section -->
      <GlassCard class="p-6">
        <div class="border-b border-white/20 pb-4 mb-6">
          <h2 class="text-xl font-semibold text-gray-800">
            评论 ({{ commentsData?.total || 0 }})
          </h2>
        </div>

        <!-- Hidden posts: block entire comments area -->
        <div v-if="post?.status === 1" class="text-center py-12">
          <p class="text-gray-600">隐藏的条目不应当拥有评论，请先取消隐藏</p>
        </div>
        <template v-else>
          <!-- Comment Form (if authenticated) -->
          <div v-if="auth.isAuthenticated" class="mb-6">
            <form @submit.prevent="submitComment" class="space-y-4">
              <div class="relative">
                <GlassTextarea
                  v-model="commentForm.content"
                  placeholder="写下你的看法..."
                  rows="5"
                  :error="commentErrors.content"
                  :input-class="'pr-28 min-h-[140px]'"
                  required
                />
                <GlassButton
                  type="submit"
                  :loading="commentSubmitting"
                  :disabled="!commentForm.content.trim()"
                  class="absolute right-3 bottom-3 rounded-full h-10 px-5"
                >
                  发布评论
                </GlassButton>
              </div>
            </form>
          </div>

          <div v-else class="mb-6 text-center py-8">
            <p class="text-gray-600 mb-4">登录后可发表评论</p>
            <NuxtLink to="/auth/login" class="glass-button">
              立即登录
            </NuxtLink>
          </div>

          <!-- Comments List -->
          <div class="space-y-4">
            <!-- Loading comments -->
            <div v-if="commentsLoading" class="flex justify-center py-4">
              <LoadingSpinner />
            </div>

            <!-- No comments -->
            <div v-else-if="!comments.length" class="text-center py-8 text-gray-500">
              还没有评论，来发表第一条评论吧！
            </div>

            <!-- Comments -->
            <div v-else>
              <div
                v-for="comment in comments"
                :key="comment.id"
                class="p-4 bg-white/10 rounded-xl border border-white/10"
              >
                <div class="flex items-start gap-3">
                  <!-- User Avatar -->
                  <div 
                    class="w-10 h-10 rounded-full flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-brand-300/50 transition-all"
                    @click="navigateToUser(comment)"
                  >
                    <img
                      v-if="comment.user_avatar_url"
                      :src="assetUrl(comment.user_avatar_url)"
                      :alt="commentDisplayName(comment)"
                      class="w-10 h-10 rounded-full object-cover"
                    >
                    <div 
                      v-else
                      class="w-10 h-10 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    >
                      {{ commentDisplayName(comment).slice(0, 2) }}
                    </div>
                  </div>
                  
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-sm font-medium text-gray-700">
                        {{ commentDisplayName(comment) }}
                      </span>
                      <TagBadge
                        v-if="comment.user_tag"
                        :title="comment.user_tag.title"
                        :background="comment.user_tag.background_color"
                        :text="comment.user_tag.text_color"
                      />
                      <span class="text-xs text-gray-500 ml-auto">
                        {{ formatDate(comment.created_at) }}
                      </span>
                    </div>
                    
                    <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">{{ comment.content }}</p>
                    
                    <!-- Comment actions -->
                    <div v-if="canManageComment(comment)" class="mt-2 flex gap-2">
                      <GlassButton
                        v-if="comment.user_id === auth.currentUser?.id && canEditComment(comment)"
                        @click="startEditComment(comment)"
                        class="glass-button-secondary !px-2 !py-1 text-xs"
                      >
                        编辑
                      </GlassButton>
                      <GlassButton
                        @click="hideComment(comment)"
                        class="glass-button-secondary !px-2 !py-1 text-xs"
                      >
                        {{ comment.status === 0 ? '隐藏' : '恢复' }}
                      </GlassButton>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Load more comments -->
              <div v-if="commentsData && commentsData.page * commentsData.page_size < commentsData.total" class="text-center pt-4">
                <GlassButton
                  @click="loadMoreComments"
                  :loading="commentsLoading"
                  class="glass-button-secondary"
                >
                  加载更多评论
                </GlassButton>
              </div>
            </div>
          </div>
        </template>
      </GlassCard>
    </div>

    <!-- Image Modal -->
    <div
      v-if="showImageModal && post?.image_path"
      class="fixed inset-0 z-[9000] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      @click="showImageModal = false"
    >
      <div class="max-w-4xl max-h-[90vh] p-4">
        <img
          :src="assetUrl(post.image_path)"
          :alt="`${post.author_name}对${post.target_name}的表白`"
          class="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        >
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <GlassModal
      :is-open="showDeleteModal"
      title="确认删除"
      max-width="max-w-md"
      @close="showDeleteModal = false"
    >
      <p class="text-gray-600 mb-6">确定要删除这条表白吗？删除后无法恢复。</p>
      
      <template #footer>
        <div class="flex gap-3 justify-end">
          <GlassButton
            @click="showDeleteModal = false"
            class="glass-button-secondary"
          >
            取消
          </GlassButton>
          <GlassButton
            @click="deletePost"
            :loading="actionLoading"
            class="!bg-red-600 hover:!bg-red-700"
          >
            确认删除
          </GlassButton>
        </div>
      </template>
    </GlassModal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CalendarIcon } from 'lucide-vue-next'
// 显式导入，确保本页组件解析正常
import GlassButton from '~/components/ui/GlassButton.vue'
import GlassTextarea from '~/components/ui/GlassTextarea.vue'
import GlassModal from '~/components/ui/GlassModal.vue'
import TagBadge from '~/components/ui/TagBadge.vue'
import type { PostDto, CommentDto, Pagination, CommentForm } from '~/types'

// Get route params
const route = useRoute()
const router = useRouter()
const postId = route.params.id as string

// Stores
const auth = useAuthStore()
const toast = useToast()
const assetUrl = useAssetUrl()
const home = useHomeStore()

// State
const post = ref<PostDto | null>(null)
const comments = ref<CommentDto[]>([])
const commentsData = ref<Pagination<CommentDto> | null>(null)
const loading = ref(true)
const commentsLoading = ref(false)
const commentSubmitting = ref(false)
const actionLoading = ref(false)
const error = ref<string | null>(null)
const showImageModal = ref(false)
const showDeleteModal = ref(false)
const authorAvatar = ref<string | null>(null)

// Comment form
const commentForm = reactive<CommentForm>({
  content: ''
})
const commentErrors = ref<Partial<CommentForm>>({})

// Computed
const showAdminActions = computed(() => {
  return auth.isAuthenticated && (
    auth.isSuperadmin ||
    auth.hasAnyPerm(['PIN_POST', 'FEATURE_POST', 'HIDE_POST', 'DELETE_POST'])
  )
})

// Fetch author avatar
const fetchAuthorAvatar = async () => {
  try {
    if (post.value?.author_id) {
      const api = useApi()
      const userRes = await api.getUser(post.value.author_id)
      if (userRes.avatar_url) {
        authorAvatar.value = assetUrl(userRes.avatar_url)
      }
    }
  } catch (error) {
    // If can't fetch user info, just don't show avatar
    console.warn('Failed to fetch author avatar:', error)
  }
}

// Methods
const loadPost = async () => {
  try {
    const api = useApi()
    post.value = await api.getPost(postId)
    // Fetch author avatar after loading post
    await fetchAuthorAvatar()
  } catch (err: any) {
    // 若普通详情接口拿不到，且当前用户具备管理权限，尝试从首页缓存里回退读取（隐藏贴在首页可见）
    const canModerate = auth.isSuperadmin || auth.hasAnyPerm(['HIDE_POST', 'DELETE_POST', 'EDIT_POST'])
    if (canModerate) {
      const cached = home.posts.find(p => p.id === postId)
      if (cached) {
        post.value = cached
        error.value = null
        // Fetch author avatar for cached post too
        await fetchAuthorAvatar()
        return
      }
    }
    error.value = err.message || '加载帖子失败'
  }
}

const loadComments = async (page = 1) => {
  commentsLoading.value = true
  try {
    const api = useApi()
    const data = await api.listComments(postId, { page, page_size: 20 })
    
    if (page === 1) {
      comments.value = data.items
    } else {
      comments.value.push(...data.items)
    }
    commentsData.value = data
  } catch (err: any) {
    toast.error('加载评论失败')
  } finally {
    commentsLoading.value = false
  }
}

const loadMoreComments = () => {
  if (commentsData.value) {
    loadComments(commentsData.value.page + 1)
  }
}

const submitComment = async () => {
  if (!commentForm.content.trim()) return
  
  commentSubmitting.value = true
  commentErrors.value = {}
  
  try {
    const api = useApi()
    const newComment = await api.createComment(postId, commentForm)
    
    // Add to top of comments list
    // 确保展示昵称：优先后端 user_display_name；若缺失则用当前登录者昵称回填
    const enriched = {
      ...newComment,
      user_display_name: (newComment as any).user_display_name || auth.userDisplayName
    } as any
    comments.value.unshift(enriched as any)
    if (commentsData.value) {
      commentsData.value.total += 1
    }
    
    // Reset form
    commentForm.content = ''
    toast.success('评论发表成功')
  } catch (err: any) {
    toast.error('评论发表失败')
  } finally {
    commentSubmitting.value = false
  }
}

const canManageComment = (comment: CommentDto) => {
  return auth.isAuthenticated && (
    comment.user_id === auth.currentUser?.id ||
    auth.isSuperadmin ||
    auth.hasPerm('MANAGE_COMMENTS')
  )
}

const canEditComment = (comment: CommentDto) => {
  if (!comment.created_at) return false
  const createdAt = new Date(comment.created_at)
  const now = new Date()
  const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60)
  return diffMinutes <= 15 || auth.hasPerm('MANAGE_COMMENTS')
}

const startEditComment = (comment: CommentDto) => {
  // TODO: Implement comment editing
  toast.info('评论编辑功能正在开发中')
}

const hideComment = async (comment: CommentDto) => {
  try {
    const api = useApi()
    await api.hideComment(comment.id, comment.status === 0)
    
    // Update local state
    comment.status = comment.status === 0 ? 1 : 0
    toast.success(comment.status === 0 ? '评论已恢复' : '评论已隐藏')
  } catch (err) {
    toast.error('操作失败')
  }
}

const togglePin = async () => {
  if (!post.value) return
  
  actionLoading.value = true
  try {
    const api = useApi()
    await api.pinPost(post.value.id, !post.value.is_pinned)
    post.value.is_pinned = !post.value.is_pinned
    toast.success(post.value.is_pinned ? '已置顶' : '已取消置顶')
  } catch (err) {
    toast.error('操作失败')
  } finally {
    actionLoading.value = false
  }
}

const toggleFeature = async () => {
  if (!post.value) return
  
  actionLoading.value = true
  try {
    const api = useApi()
    await api.featurePost(post.value.id, !post.value.is_featured)
    post.value.is_featured = !post.value.is_featured
    toast.success(post.value.is_featured ? '已设为精华' : '已取消精华')
  } catch (err) {
    toast.error('操作失败')
  } finally {
    actionLoading.value = false
  }
}

const toggleHide = async () => {
  if (!post.value) return
  actionLoading.value = true
  try {
    const api = useApi()
    if (post.value.status === 1) {
      await api.hidePost(post.value.id, false)
      post.value.status = 0
      toast.success('帖子已恢复')
    } else if (post.value.status === 0) {
      await api.hidePost(post.value.id, true)
      post.value.status = 1
      toast.success('帖子已隐藏')
    }
  } catch (err) {
    toast.error('操作失败')
  } finally {
    actionLoading.value = false
  }
}

const confirmDelete = () => {
  showDeleteModal.value = true
}

const deletePost = async () => {
  if (!post.value) return
  
  actionLoading.value = true
  try {
    const api = useApi()
    await api.deletePost(post.value.id)
    toast.success('帖子已删除')
    showDeleteModal.value = false
    router.push('/')
  } catch (err) {
    toast.error('删除失败')
  } finally {
    actionLoading.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// Derive a friendly display name for comment author
const commentDisplayName = (c: CommentDto): string => {
  return (
    c.user_display_name ||
    c.user_username ||
    `用户${c.user_id?.slice(0, 6)}`
  )
}

// Navigate to user profile
const navigateToUser = (postOrComment: any) => {
  if (postOrComment.author_id) {
    navigateTo(`/users/id/${postOrComment.author_id}`)
  } else if (postOrComment.user_id) {
    navigateTo(`/users/id/${postOrComment.user_id}`)
  } else if (postOrComment.author_name) {
    // 备用方案：通过作者名称导航（不推荐，因为名称可能重复）
    navigateTo(`/users/${encodeURIComponent(postOrComment.author_name)}`)
  } else if (postOrComment.user_username) {
    navigateTo(`/users/${postOrComment.user_username}`)
  } else {
    navigateTo(`/users/id/${postOrComment.user_id}`)
  }
}

const refresh = async () => {
  loading.value = true
  error.value = null
  await loadPost()
  if (post.value) {
    await loadComments()
  }
  loading.value = false
}

// Initialize
onMounted(async () => {
  await loadPost()
  if (post.value) {
    await loadComments()
  }
  loading.value = false
})

// SEO
useHead(() => {
  if (!post.value) {
    return { title: '加载中 - Love Wall' }
  }
  
  return {
    title: `${post.value.author_name}对${post.value.target_name}的表白 - Love Wall`,
    meta: [
      { name: 'description', content: post.value.content.slice(0, 150) + '...' },
    ]
  }
})
</script>
