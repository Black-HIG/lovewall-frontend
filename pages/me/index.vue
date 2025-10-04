<template>
  <div class="max-w-6xl mx-auto space-y-8">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">个人中心</h1>
      <p class="text-gray-600 mt-2">管理你的个人信息和内容</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <LoadingSpinner size="lg" />
    </div>

    <!-- User Profile Card -->
    <GlassCard v-else class="p-6">
      <div class="flex flex-col md:flex-row items-start gap-6">
        <!-- Avatar -->
        <div class="flex-shrink-0 relative">
          <!-- 管理员光圈效果 -->
          <div
            v-if="auth.currentUser?.isadmin"
            class="absolute -inset-1 rounded-full bg-blue-500/30 blur-[8px]"
          ></div>

          <!-- 头像容器 -->
          <div class="relative w-24 h-24 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-2xl font-bold">
            <img
              v-if="auth.currentUser?.avatar_url"
              :src="assetUrl(auth.currentUser.avatar_url)"
              :alt="auth.userDisplayName"
              class="w-24 h-24 rounded-full object-cover border-2 border-white/20"
            >
            <span v-else>
              {{ auth.userDisplayName.slice(0, 2) }}
            </span>
          </div>
        </div>

        <!-- User Info -->
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <h2 class="text-2xl font-bold text-gray-800">{{ auth.userDisplayName }}</h2>
            <TagBadge
              v-if="activeTag"
              :title="activeTag.tag?.title || ''"
              :background="activeTag.tag?.background_color || '#6b7280'"
              :text="activeTag.tag?.text_color || '#ffffff'"
            />
            <span
              v-if="auth.isSuperadmin"
              class="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full"
            >
              超级管理员
            </span>
          </div>
          
          <!-- 权限显示 -->
          <UserPermissionDisplay />
          
          <div class="space-y-1 text-sm text-gray-600 mt-4">
            <p><span class="font-medium">用户名:</span> {{ auth.currentUser?.username }}</p>
            <p v-if="auth.currentUser?.email">
              <span class="font-medium">邮箱:</span> {{ auth.currentUser.email }}
            </p>
            <p><span class="font-medium">注册时间:</span> {{ formatDate(auth.currentUser?.created_at) }}</p>
            <p v-if="auth.currentUser?.last_login_at">
              <span class="font-medium">上次登录:</span> {{ formatDate(auth.currentUser.last_login_at) }}
            </p>
          </div>

          <!-- Bio -->
          <div v-if="auth.currentUser?.bio" class="mt-4">
            <p class="text-gray-700">{{ auth.currentUser.bio }}</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex-shrink-0 flex gap-2">
          <GlassButton
            variant="secondary"
            type="button"
            class="glass-button"
            @click="showEditModal = true"
          >
            编辑资料
          </GlassButton>
          <GlassButton
            v-if="auth.isSuperadmin || auth.hasAnyPerm(['MANAGE_USERS','MANAGE_ANNOUNCEMENTS','MANAGE_COMMENTS','MANAGE_TAGS'])"
            class="glass-button"
            @click="navigateTo('/admin')"
          >
            进入后台
          </GlassButton>
        </div>
      </div>
    </GlassCard>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <GlassCard class="p-6 text-center">
        <div class="text-3xl font-bold text-brand-600 mb-2">{{ stats.posts }}</div>
        <div class="text-sm text-gray-600">发表的表白</div>
      </GlassCard>
      
      <GlassCard class="p-6 text-center">
        <div class="text-3xl font-bold text-green-600 mb-2">{{ stats.comments }}</div>
        <div class="text-sm text-gray-600">发表的评论</div>
      </GlassCard>
      
      <GlassCard class="p-6 text-center">
        <div class="text-3xl font-bold text-purple-600 mb-2">{{ stats.tags }}</div>
        <div class="text-sm text-gray-600">拥有的标签</div>
      </GlassCard>
      
      <GlassCard class="p-6 text-center">
        <div class="text-3xl font-bold text-blue-600 mb-2">{{ daysSinceJoined }}</div>
        <div class="text-sm text-gray-600">加入天数</div>
      </GlassCard>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <NuxtLink to="/posts/new" class="block">
        <GlassCard class="p-6 text-center hover:shadow-glow-lg transition-all">
          <div class="w-12 h-12 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <PlusIcon class="w-6 h-6 text-white" />
          </div>
          <h3 class="font-semibold text-gray-800 mb-2">发布表白</h3>
          <p class="text-sm text-gray-600">分享你的爱意</p>
        </GlassCard>
      </NuxtLink>

      <NuxtLink to="/me/posts" class="block">
        <GlassCard class="p-6 text-center hover:shadow-glow-lg transition-all">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileTextIcon class="w-6 h-6 text-white" />
          </div>
          <h3 class="font-semibold text-gray-800 mb-2">我的表白</h3>
          <p class="text-sm text-gray-600">查看已发布内容</p>
        </GlassCard>
      </NuxtLink>

      <NuxtLink to="/me/comments" class="block">
        <GlassCard class="p-6 text-center hover:shadow-glow-lg transition-all">
          <div class="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquareIcon class="w-6 h-6 text-white" />
          </div>
          <h3 class="font-semibold text-gray-800 mb-2">我的评论</h3>
          <p class="text-sm text-gray-600">管理评论记录</p>
        </GlassCard>
      </NuxtLink>

      <NuxtLink to="/me/tags" class="block">
        <GlassCard class="p-6 text-center hover:shadow-glow-lg transition-all">
          <div class="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <TagIcon class="w-6 h-6 text-white" />
          </div>
          <h3 class="font-semibold text-gray-800 mb-2">我的标签</h3>
          <p class="text-sm text-gray-600">标签管理与激活</p>
        </GlassCard>
      </NuxtLink>
      
      <NuxtLink to="/me/change-password" class="block">
        <GlassCard class="p-6 text-center hover:shadow-glow-lg transition-all">
          <div class="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldIcon class="w-6 h-6 text-white" />
          </div>
          <h3 class="font-semibold text-gray-800 mb-2">修改密码</h3>
          <p class="text-sm text-gray-600">保护账户安全</p>
        </GlassCard>
      </NuxtLink>
    </div>

    <!-- Recent Activity -->
    <GlassCard class="p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">最近活动</h3>
      
      <!-- Loading recent activity -->
      <div v-if="activityLoading" class="flex justify-center py-8">
        <LoadingSpinner />
      </div>
      
      <!-- No activity -->
      <div v-else-if="!recentPosts.length && !recentComments.length" class="text-center py-8 text-gray-500">
        还没有任何活动，快去发布你的第一条表白吧！
      </div>
      
      <!-- Activity list -->
      <div v-else class="space-y-4">
        <!-- Recent posts -->
        <div v-if="recentPosts.length" class="space-y-3">
          <h4 class="font-medium text-gray-700">最近发布的表白</h4>
          <div
            v-for="post in recentPosts"
            :key="post.id"
            class="p-4 bg-white/10 rounded-xl border border-white/10"
          >
            <div class="flex items-center justify-between mb-2">
              <h5 class="font-medium text-gray-800">
                {{ post.author_name }} → {{ post.target_name }}
              </h5>
              <span class="text-xs text-gray-500">{{ formatDate(post.created_at) }}</span>
            </div>
            <p class="text-sm text-gray-600 line-clamp-2">{{ post.content }}</p>
            <div class="mt-2">
              <NuxtLink
                :to="`/posts/${post.id}`"
                class="glass-button-secondary text-xs px-2 py-1 inline-block"
              >
                查看详情 →
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Recent comments -->
        <div v-if="recentComments.length" class="space-y-3">
          <h4 class="font-medium text-gray-700">最近发表的评论</h4>
          <div
            v-for="comment in recentComments"
            :key="comment.id"
            class="p-4 bg-white/10 rounded-xl border border-white/10"
          >
            <div class="flex items-center justify-between mb-2">
              <h5 class="font-medium text-gray-800">评论了一条表白</h5>
              <span class="text-xs text-gray-500">{{ formatDate(comment.created_at) }}</span>
            </div>
            <p class="text-sm text-gray-600 line-clamp-2">{{ comment.content }}</p>
            <div class="mt-2">
              <NuxtLink
                :to="`/posts/${comment.post_id}`"
                class="glass-button-secondary text-xs px-2 py-1 inline-block"
              >
                查看表白 →
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>

    <!-- Edit Profile Modal -->
    <EditProfileModal
      :is-open="showEditModal"
      :user="auth.currentUser"
      @close="showEditModal = false"
      @updated="handleProfileUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { 
  PlusIcon, 
  FileTextIcon, 
  MessageSquareIcon, 
  TagIcon,
  ShieldIcon 
} from 'lucide-vue-next'
import type { PostDto, CommentDto, UserTagDto, User } from '~/types'

definePageMeta({
  middleware: 'auth'
})

// Stores
const auth = useAuthStore()
const assetUrl = useAssetUrl()

// State
const loading = ref(true)
const activityLoading = ref(false)
const showEditModal = ref(false)
const activeTag = ref<UserTagDto | null>(null)
const recentPosts = ref<PostDto[]>([])
const recentComments = ref<CommentDto[]>([])
const stats = reactive({
  posts: 0,
  comments: 0,
  tags: 0
})

// Computed
const daysSinceJoined = computed(() => {
  if (!auth.currentUser?.created_at) return 0
  const joinDate = new Date(auth.currentUser.created_at)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - joinDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
})

// Methods
const formatDate = (dateString?: string | null) => {
  if (!dateString) return '未知'
  return new Date(dateString).toLocaleString('zh-CN')
}

const loadUserData = async () => {
  loading.value = true
  activityLoading.value = true
  
  try {
    const api = useApi()
    
    // Load user tags and find active one
    const userTagsResp = await api.getMyTags()
    const items = userTagsResp.items
    activeTag.value = items.find((tag: UserTagDto) => tag.is_active) || null
    stats.tags = items.length
    
    // Load recent posts (first few)
    try {
      // Note: We'll need to implement a "my posts" API endpoint
      // For now, we'll skip this and handle it when the endpoint is available
      recentPosts.value = []
      stats.posts = 0
    } catch (error) {
      console.warn('Failed to load posts:', error)
    }
    
    // Load recent comments
    try {
      const commentsData = await api.getMyComments({ page: 1, page_size: 5 })
      recentComments.value = commentsData.items
      stats.comments = commentsData.total
    } catch (error) {
      console.warn('Failed to load comments:', error)
    }
    
  } catch (error: any) {
    // 降级为控制台提示，避免在部分子请求失败但页面仍可正常显示时打扰用户
    console.warn('加载用户数据出现非致命错误：', error)
  } finally {
    loading.value = false
    activityLoading.value = false
  }
}

const handleProfileUpdated = async (updatedUser: User) => {
  // Refresh user tags in case they changed
  try {
    const api = useApi()
    const userTagsResp = await api.getMyTags()
    const items = userTagsResp.items
    activeTag.value = items.find((tag: UserTagDto) => tag.is_active) || null
  } catch (error) {
    console.warn('Failed to refresh user tags:', error)
  }
}

// Initialize
onMounted(() => {
  loadUserData()
})

// SEO
useHead({
  title: '个人中心 - Love Wall',
  meta: [
    { name: 'description', content: '管理你的个人信息和表白内容' }
  ]
})
</script>
