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
        <GlassButton @click="refresh" variant="secondary">
          重新加载
        </GlassButton>
      </div>
    </div>

    <!-- Post Content -->
    <div v-else-if="post" class="space-y-6">
      <!-- Post Card -->
      <GlassCard class="p-6">
        <div class="flex flex-col lg:flex-row gap-6">
          <!-- Images or Author Avatar -->
          <div class="lg:w-1/3 space-y-4">
            <ImageGrid
              v-if="post.images?.length"
              :images="post.images"
              :alt-prefix="post.card_type !== 'communication' && post.card_type !== 'social' && post.target_name ? `${post.author_name}对${post.target_name}的表白` : `${post.author_name}的交流`"
            />
            <div
              class="relative w-24 h-24 mx-auto flex-shrink-0 transition-transform hover:scale-105 cursor-pointer"
              @click="navigateToUser(post)"
            >
              <!-- 管理员光圈效果 -->
              <template v-if="post.author_isadmin">
                <div
                  class="absolute -inset-[4px] rounded-full border-[4px] border-sky-400/95 pointer-events-none"
                ></div>
                <div
                  class="absolute -inset-[10px] rounded-full bg-sky-300/40 blur-3xl pointer-events-none"
                ></div>
              </template>

              <!-- 头像容器 -->
              <img
                v-if="authorAvatar"
                :src="authorAvatar"
                :alt="post.author_name"
                class="relative z-10 w-full h-full rounded-full object-cover"
                :class="post.author_isadmin ? 'border-0' : 'border-2 border-white/20'"
              >
              <div
                v-else
                class="relative z-10 w-full h-full bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center text-white text-lg font-medium"
                :class="post.author_isadmin ? 'border-0' : 'border-2 border-white/20'"
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
                    v-if="post.images?.length"
                    class="relative w-8 h-8 flex-shrink-0 transition-transform hover:scale-110 cursor-pointer"
                    @click="navigateToUser(post)"
                  >
                    <!-- 管理员光圈效果 -->
                    <template v-if="post.author_isadmin">
                      <div
                        class="absolute -inset-[3px] rounded-full border-[3px] border-sky-400/95 pointer-events-none"
                      ></div>
                      <div
                        class="absolute -inset-[7px] rounded-full bg-sky-300/40 blur-2xl pointer-events-none"
                      ></div>
                    </template>

                    <!-- 头像容器 -->
                    <img
                      v-if="authorAvatar"
                      :src="authorAvatar"
                      :alt="post.author_name"
                      class="relative z-10 w-full h-full rounded-full object-cover"
                      :class="post.author_isadmin ? 'border-0' : 'border border-white/20'"
                    >
                    <div
                      v-else
                      class="relative z-10 w-full h-full bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center text-white text-xs font-medium"
                      :class="post.author_isadmin ? 'border-0' : 'border border-white/20'"
                    >
                      {{ post.author_name.slice(0, 2) }}
                    </div>
                  </div>
                  
                  <h1 class="text-2xl font-bold text-gray-800">
                    {{ post.author_name }}
                  </h1>
                  <!-- 新增: 在线状态徽章 -->
                  <OnlineBadge
                    v-if="post.author_id"
                    :user-id="post.author_id"
                  />
                  <!-- Author Active Tag -->
                  <TagBadge
                    v-if="post.author_tag"
                    :title="post.author_tag.title"
                    :background="post.author_tag.background_color"
                    :text="post.author_tag.text_color"
                  />
                </div>
                
                <h1
                  v-if="(post.card_type !== 'communication' && post.card_type !== 'social') && post.target_name"
                  class="text-2xl font-bold text-gray-800"
                >
                  → {{ post.target_name }}
                </h1>
              </div>
              
                <div class="flex items-center gap-2 text-sm text-gray-500">
                  <CalendarIcon class="w-4 h-4" />
                  <span>{{ formatDate(post.created_at) }}</span>
                  
                  <!-- Admin badges -->
                  <div class="flex items-center gap-2 ml-auto flex-wrap">
                    <!-- 审核状态 -->
                    <span
                      v-if="(auth.isSuperadmin || auth.hasPerm('MANAGE_POSTS')) && post.is_pending_review"
                      class="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full"
                      :title="post.audit_msg || '需要人工审核'"
                    >
                      待审核
                    </span>
                    
                    <span
                      v-if="(auth.isSuperadmin || auth.hasPerm('MANAGE_POSTS')) && post.manual_review_requested"
                      class="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full"
                      title="用户已申请人工复核"
                    >
                      申请复核
                    </span>
                    
                    <span
                    v-if="post.is_featured"
                    class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                  >
                    精华
                  </span>
                  <span
                    v-if="post.is_pinned"
                    class="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full"
                  >
                    置顶
                  </span>
                  <span
                    v-if="(auth.isSuperadmin || auth.hasPerm('MANAGE_POSTS')) && post.status === 1"
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

            <!-- AI审核信息（仅管理员可见） -->
            <div 
              v-if="(auth.isSuperadmin || auth.hasPerm('MANAGE_POSTS')) && post.is_pending_review && post.audit_msg" 
              class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
            >
              <div class="flex items-start gap-2">
                <div class="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span class="text-yellow-600 text-xs font-bold">!</span>
                </div>
                <div>
                  <p class="text-sm font-medium text-yellow-800 mb-1">审核意见</p>
                  <p class="text-sm text-yellow-700">{{ post.audit_msg }}</p>
                  <p v-if="post.manual_review_requested" class="text-xs text-orange-600 mt-1">
                    用户已申请人工复核，请管理员审查。
                  </p>
                </div>
              </div>
            </div>

            <!-- Admin actions -->
            <div v-if="showAdminActions" class="mt-6 pt-4 border-t border-white/20">
              <div class="flex flex-wrap gap-2">
                <template v-if="post.status === 0">
                  <GlassButton
                    v-if="auth.hasPerm('MANAGE_FEATURED')"
                    @click="togglePin"
                    :loading="actionLoading"
                    variant="secondary"
                    class="text-sm px-3 py-1"
                  >
                    {{ post.is_pinned ? '取消置顶' : '置顶' }}
                  </GlassButton>
                  
                  <GlassButton
                    v-if="auth.hasPerm('MANAGE_FEATURED')"
                    @click="toggleFeature"
                    :loading="actionLoading"
                    variant="secondary"
                    class="text-sm px-3 py-1"
                  >
                    {{ post.is_featured ? '取消精华' : '精华' }}
                  </GlassButton>
                </template>
                
                <GlassButton
                  v-if="auth.hasPerm('MANAGE_POSTS')"
                  @click="toggleHide"
                  :loading="actionLoading"
                  variant="secondary"
                  class="text-sm px-3 py-1"
                >
                  {{ post.status === 1 ? '恢复' : '隐藏' }}
                </GlassButton>
                
                <GlassButton
                  v-if="auth.hasPerm('MANAGE_POSTS')"
                  @click="confirmDelete"
                  :loading="actionLoading"
                  variant="secondary"
                  class="text-sm px-3 py-1 !text-red-600"
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
                  :rows="5"
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
                    class="relative w-10 h-10 flex-shrink-0 transition-transform hover:scale-110 cursor-pointer"
                    @click="navigateToUser(comment)"
                  >
                    <!-- 管理员光圈效果 -->
                    <template v-if="comment.user_isadmin">
                      <div
                        class="absolute -inset-[3px] rounded-full border-[3px] border-sky-400/95 pointer-events-none"
                      ></div>
                      <div
                        class="absolute -inset-[7px] rounded-full bg-sky-300/40 blur-2xl pointer-events-none"
                      ></div>
                    </template>

                    <!-- 头像容器 -->
                    <img
                      v-if="comment.user_avatar_url"
                      :src="assetUrl(comment.user_avatar_url)"
                      :alt="commentDisplayName(comment)"
                      class="relative z-10 w-full h-full rounded-full object-cover"
                      :class="comment.user_isadmin ? 'border-0' : 'border-2 border-white/20'"
                      @error="() => { comment.user_avatar_url = null }"
                    >
                    <div
                      v-else
                      class="relative z-10 w-full h-full bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center text-white text-sm font-medium"
                      :class="comment.user_isadmin ? 'border-0' : 'border-2 border-white/20'"
                    >
                      {{ commentDisplayName(comment).slice(0, 2) }}
                    </div>
                  </div>
                  
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-sm font-medium text-gray-700">
                        {{ commentDisplayName(comment) }}
                      </span>
                      <!-- 新增: 在线状态徽章 -->
                      <OnlineBadge
                        v-if="comment.user_id"
                        :user-id="comment.user_id"
                      />
                      <TagBadge
                        v-if="comment.user_tag"
                        :title="comment.user_tag.title"
                        :background="comment.user_tag.background_color"
                        :text="comment.user_tag.text_color"
                      />
                      <div class="ml-auto flex items-center gap-2">
                        <span class="text-xs text-gray-500">
                          {{ formatDate(comment.created_at) }}
                        </span>
                        <button
                          v-if="canManageComment(comment)"
                          @click="hideComment(comment)"
                          class="px-2 py-1 text-xs text-gray-600 hover:text-brand-600 border border-gray-300 hover:border-brand-400 rounded transition-colors"
                        >
                          {{ comment.status === 0 ? '隐藏' : '恢复' }}
                        </button>
                      </div>
                    </div>
                    
                    <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">{{ comment.content }}</p>
                    
                    
                  </div>
                </div>
              </div>

              <!-- Load more comments -->
                <div v-if="commentsData && commentsData.page * commentsData.page_size < commentsData.total" class="text-center pt-4">
                <GlassButton
                  @click="loadMoreComments"
                  :loading="commentsLoading"
                  variant="secondary"
                >
                  加载更多评论
                </GlassButton>
              </div>
            </div>
          </div>
        </template>
      </GlassCard>
    </div>

    <!-- Delete Confirmation Modal -->
    <GlassModal
      :is-open="showDeleteModal"
      title="确认删除"
      max-width="max-w-md"
      @close="closeDeleteModal"
    >
      <p class="text-gray-600 mb-6">确定要删除这条表白吗？删除后无法恢复。</p>
      <div class="space-y-3">
        <label class="text-sm text-gray-700">处理原因（可选）</label>
        <GlassTextarea
          v-model="deleteReason"
          :rows="3"
          placeholder="填写本次删除的原因"
        />
      </div>
      
      <template #footer>
        <div class="flex gap-3 justify-end">
          <GlassButton @click="closeDeleteModal" variant="secondary">取消</GlassButton>
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

    <!-- AI Rejection Modal -->
    <GlassModal
      :is-open="showAIRejectionModal"
      title="内容审核未通过"
      max-width="max-w-lg"
      @close="showAIRejectionModal = false"
    >
      <div class="space-y-4">
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
            <span class="text-red-600 text-sm font-bold">!</span>
          </div>
          <div class="flex-1">
            <p class="text-gray-700">{{ aiRejectionInfo.message }}</p>
            <div class="mt-3 p-3 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-600 mb-1">您的内容：</p>
              <p class="text-sm font-medium text-gray-800 whitespace-pre-wrap">{{ aiRejectionInfo.content }}</p>
            </div>
          </div>
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p class="text-sm text-blue-800">
            <strong>申请人工复核：</strong>如果您认为这是误判，可以申请管理员进行人工复核。
          </p>
        </div>
      </div>
      
      <template #footer>
        <div class="flex gap-3 justify-end">
          <GlassButton
            @click="showAIRejectionModal = false"
            variant="secondary"
          >
            知道了
          </GlassButton>
          <GlassButton
            @click="requestReview"
            :loading="reviewRequesting"
          >
            申请复核
          </GlassButton>
        </div>
      </template>
    </GlassModal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CalendarIcon } from 'lucide-vue-next'
import { onBeforeRouteUpdate } from 'vue-router'
// 显式导入，确保本页组件解析正常
import GlassButton from '~/components/ui/GlassButton.vue'
import GlassTextarea from '~/components/ui/GlassTextarea.vue'
import GlassModal from '~/components/ui/GlassModal.vue'
import TagBadge from '~/components/ui/TagBadge.vue'
import OnlineBadge from '~/components/ui/OnlineBadge.vue'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import GlassCard from '~/components/ui/GlassCard.vue'
import ImageGrid from '~/components/ui/ImageGrid.vue'
import type { PostDto, CommentDto, Pagination, CommentForm } from '~/types'

// Get route params
const route = useRoute()
const router = useRouter()
const onRouteUpdate = async () => {
  loading.value = true
  error.value = null
  post.value = null
  comments.value = []
  commentsData.value = null
  authorAvatar.value = null
  await loadPost()
  if (post.value) {
    await loadComments(1)
  }
  loading.value = false
}
// Keep id reactive to handle in-component route updates
const postId = computed(() => route.params.id as string)

// Stores
const auth = useAuthStore()
const toast = useToast()
const assetUrl = useAssetUrl()
const home = useHomeStore()
const { confirm: confirmDialog } = useConfirm()
const { prompt: promptDialog } = usePrompt()

// State
const post = ref<PostDto | null>(null)
const comments = ref<CommentDto[]>([])
const commentsData = ref<Pagination<CommentDto> | null>(null)
const loading = ref(true)
const commentsLoading = ref(false)
const commentSubmitting = ref(false)
const actionLoading = ref(false)
const error = ref<string | null>(null)
const showDeleteModal = ref(false)
const deleteReason = ref('')
const showAIRejectionModal = ref(false)
const aiRejectionInfo = ref<{
  message: string
  reason?: string
  type: 'comment' | 'post'
  content: string
}>({
  message: '',
  reason: '',
  type: 'comment',
  content: ''
})
const reviewRequesting = ref(false)
const authorAvatar = ref<string | null>(null)
const userAvatarCache = ref<Map<string, string | null>>(new Map())
// Current user's active tag preview (only if enabled)
const myActiveTagPreview = ref<{ name: string; title: string; background_color: string; text_color: string } | null>(null)

// Comment form
const commentForm = reactive<CommentForm>({
  content: ''
})
const commentErrors = ref<Partial<CommentForm>>({})

// Computed
const showAdminActions = computed(() => {
  return auth.isAuthenticated && (
    auth.isSuperadmin ||
    auth.hasAnyPerm(['MANAGE_FEATURED', 'MANAGE_POSTS'])
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
    // 根据用户权限决定使用哪个接口
    if (auth.isAuthenticated && (auth.isSuperadmin || auth.hasPerm('MANAGE_POSTS'))) {
      post.value = await api.getPostForAdmin(postId.value)
    } else {
      post.value = await api.getPost(postId.value)
    }
    // Fetch author avatar after loading post
    await fetchAuthorAvatar()
  } catch (err: any) {
    // 若普通详情接口拿不到，且当前用户具备管理权限，尝试从首页缓存里回退读取（隐藏贴在首页可见）
    const canModerate = auth.isSuperadmin || auth.hasPerm('MANAGE_POSTS')
    if (canModerate) {
      const cached = home.posts.find(p => p.id === postId.value)
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
    const data = await api.listComments(postId.value, { page, page_size: 20 })

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

    const enrichedComments = data.items.map(comment => ({
      ...comment,
      user_avatar_url: userAvatarCache.value.get(comment.user_id) ?? null
    })) as CommentDto[]

    if (page === 1) {
      comments.value = enrichedComments
    } else {
      comments.value.push(...enrichedComments)
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
  // Length limit: 500 characters
  if (commentForm.content.length > 500) {
    commentErrors.value = { content: '评论内容不能超过 500 个字符' } as any
    const toast = useToast()
    toast.error('评论内容不能超过 500 个字符')
    return
  }
  
  commentSubmitting.value = true
  commentErrors.value = {}
  
  try {
    const api = useApi()
    const newComment = await api.createComment(postId.value, commentForm)
    
    // Add to top of comments list
    // 确保展示昵称：优先后端 user_display_name；若缺失则用当前登录者昵称回填
    const enriched = {
      ...newComment,
      user_display_name: (newComment as any).user_display_name || auth.userDisplayName
    } as any

    // Attach current user's avatar for immediate preview
    if (!enriched.user_avatar_url && auth.currentUser?.avatar_url) {
      (enriched as any).user_avatar_url = auth.currentUser.avatar_url
    }
    if (!enriched.user_username && auth.currentUser?.username) {
      (enriched as any).user_username = auth.currentUser.username
    }
    // Attach active tag (only when enabled)
    if (myActiveTagPreview.value) {
      (enriched as any).user_tag = { ...myActiveTagPreview.value }
    }
    comments.value.unshift(enriched as any)
    if (commentsData.value) {
      // total will increase after approval server-side
    }
    
    // Reset form
    commentForm.content = ''
    toast.success('评论发表成功')
  } catch (err: any) {
    // 处理AI审核失败的情况
    if (err?.response?.status === 422 && err?.response?.data?.error?.code === 'AI_REJECTED') {
      const reason = err?.response?.data?.error?.extras?.reason
      const message = reason ? `评论未通过审核：${reason}` : '评论未通过审核'
      
      // 显示审核失败的详细信息和申请复核选项
      showAIRejectionModal.value = true
      aiRejectionInfo.value = {
        message,
        reason,
        type: 'comment',
        content: commentForm.content
      }
    } else {
      toast.error('评论发表失败')
    }
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

const promptModerationReason = async (action: string): Promise<string | null> => {
  if (typeof window === 'undefined') return ''
  const { prompt } = useAdminDialog()
  const input = await prompt({
    title: `${action}处理`,
    inputLabel: '处理原因(可选)',
    placeholder: '请输入处理原因(可选)',
    confirmText: '确定',
    cancelText: '取消'
  })
  if (input === null) return null
  return input.trim()
}

const togglePin = async () => {
  if (!post.value) return

  const nextState = !post.value.is_pinned
  const reasonInput = await promptModerationReason(nextState ? '置顶' : '取消置顶')
  if (reasonInput === null) return

  actionLoading.value = true
  try {
    const api = useApi()
    const res = await api.pinPost(post.value.id, nextState, reasonInput || undefined)
    post.value.is_pinned = res.is_pinned
    toast.success(post.value.is_pinned ? '已置顶' : '已取消置顶')
  } catch (err) {
    toast.error('操作失败')
  } finally {
    actionLoading.value = false
  }
}

const toggleFeature = async () => {
  if (!post.value) return

  const nextState = !post.value.is_featured
  const reasonInput = await promptModerationReason(nextState ? '设为精华' : '取消精华')
  if (reasonInput === null) return

  actionLoading.value = true
  try {
    const api = useApi()
    const res = await api.featurePost(post.value.id, nextState, reasonInput || undefined)
    post.value.is_featured = res.is_featured
    toast.success(post.value.is_featured ? '已设为精华' : '已取消精华')
  } catch (err) {
    toast.error('操作失败')
  } finally {
    actionLoading.value = false
  }
}

const toggleHide = async () => {
  if (!post.value) return
  const shouldHide = post.value.status === 0
  if (shouldHide) {
    const { confirm } = useAdminDialog()
    const confirmed = await confirm({
      title: '确认隐藏',
      message: '确定要隐藏这个帖子吗？',
      confirmText: '确认隐藏',
      cancelText: '取消'
    })
    if (!confirmed) return
  }

  const reasonInput = await promptModerationReason(shouldHide ? '隐藏' : '恢复')
  if (reasonInput === null) return

  actionLoading.value = true
  try {
    const api = useApi()
    if (post.value.status === 1) {
      const res = await api.hidePost(post.value.id, false, reasonInput || undefined)
      post.value.status = res.status
      toast.success('帖子已恢复')
    } else if (post.value.status === 0) {
      const res = await api.hidePost(post.value.id, true, reasonInput || undefined)
      post.value.status = res.status
      toast.success('帖子已隐藏')
    }
  } catch (err) {
    toast.error('操作失败')
  } finally {
    actionLoading.value = false
  }
}

const confirmDelete = () => {
  deleteReason.value = ''
  showDeleteModal.value = true
}

const deletePost = async () => {
  if (!post.value) return
  
  actionLoading.value = true
  try {
    const api = useApi()
    await api.deletePost(post.value.id, deleteReason.value.trim() || undefined)
    toast.success('帖子已删除')
    closeDeleteModal()
    router.push('/')
  } catch (err) {
    toast.error('删除失败')
  } finally {
    actionLoading.value = false
  }
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deleteReason.value = ''
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

// Fetch current user's active tag preview (only if enabled)
const fetchMyActiveTagPreview = async () => {
  if (!auth.isAuthenticated || !auth.currentUser) return
  try {
    const api = useApi()
    const [status, tag] = await Promise.all([
      api.getMyActiveTagStatus(),
      api.getUserActiveTag(auth.currentUser.id)
    ])
    if (status.has_active && status.current_tag_enabled && tag) {
      myActiveTagPreview.value = tag
    } else {
      myActiveTagPreview.value = null
    }
  } catch {
    myActiveTagPreview.value = null
  }
}

// 申请人工复核
const requestReview = async () => {
  if (!aiRejectionInfo.value.content) return
  
  reviewRequesting.value = true
  try {
    const api = useApi()
    if (aiRejectionInfo.value.type === 'comment') {
      // 对于评论，我们需要存储被拒绝的评论ID（如果有的话）
      // 由于评论创建失败，我们无法获得评论ID，所以需要后端支持基于内容的申请
      // 这里假设后端支持基于内容的申请复核API
      // await api.requestCommentReview(commentId)
      toast.info('评论复核申请功能正在开发中')
    } else {
      await api.requestPostReview(postId.value)
      toast.success('已提交人工复核申请')
      // 更新帖子状态
      if (post.value) {
        post.value.manual_review_requested = true
      }
    }
    showAIRejectionModal.value = false
  } catch (err) {
    toast.error('申请复核失败，请稍后重试')
  } finally {
    reviewRequesting.value = false
  }
}

// Initialize
onMounted(async () => {
  await loadPost()
  if (post.value) {
    await loadComments()
  }
  // Prepare current user's active tag preview for comment UI
  await fetchMyActiveTagPreview()
  loading.value = false
})

// Handle in-app navigation to different post IDs
onBeforeRouteUpdate(async (to, from) => {
  if (to.params.id !== from.params.id) {
    console.log('[PostDetail] onBeforeRouteUpdate triggered', { from: from.params.id, to: to.params.id })
    await onRouteUpdate()
    try { window.scrollTo({ top: 0, behavior: 'smooth' }) } catch {}
  }
})

// Force remount when param changes (extra safety in addition to watch)
definePageMeta({
  key: (route: any) => `post-${route.params?.id ?? ''}`
})
// React to route param changes when navigating between /posts/:id
watch(() => postId.value, async () => {
  await onRouteUpdate()
  try { window.scrollTo({ top: 0, behavior: 'smooth' }) } catch {}
})

// SEO
useHead(() => {
  if (!post.value) {
    return { title: '加载中 - 郑州四中表白墙' }
  }
  const isConfession = post.value.card_type !== 'communication' && post.value.card_type !== 'social'
  const title = isConfession && post.value.target_name
    ? `${post.value.author_name}对${post.value.target_name}的表白 - 郑州四中表白墙`
    : `${post.value.author_name}的交流 - 郑州四中表白墙`
  return {
    title,
    meta: [
      { name: 'description', content: post.value.content.slice(0, 150) + '...' },
    ]
  }
})
</script>

