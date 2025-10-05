<template>
  <div class="w-full space-y-8">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">管理后台</h1>
      <p class="text-gray-600 mt-2">系统管理和内容审核</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <LoadingSpinner size="lg" />
    </div>

    <div v-else class="space-y-8">
      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- 表白数据 - 所有管理员都可查看 -->
        <GlassCard class="p-6 text-center">
          <div class="w-12 h-12 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileTextIcon class="w-6 h-6 text-white" />
          </div>
          <div class="text-2xl font-bold text-brand-600 mb-1">{{ stats.posts }}</div>
          <div class="text-sm text-gray-600">总表白数</div>
        </GlassCard>
        
        <!-- 用户数据 - 需要权限 -->
        <PermissionGuard :any-perms="['MANAGE_USERS']">
          <GlassCard class="p-6 text-center">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <UsersIcon class="w-6 h-6 text-white" />
            </div>
            <div class="text-2xl font-bold text-blue-600 mb-1">{{ stats.users }}</div>
            <div class="text-sm text-gray-600">总用户数</div>
          </GlassCard>
        </PermissionGuard>
        
        <!-- 评论数据 - 需要权限 -->
        <PermissionGuard :any-perms="['MANAGE_COMMENTS']">
          <GlassCard class="p-6 text-center">
            <div class="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquareIcon class="w-6 h-6 text-white" />
            </div>
            <div class="text-2xl font-bold text-green-600 mb-1">{{ stats.comments }}</div>
            <div class="text-sm text-gray-600">总评论数</div>
          </GlassCard>
        </PermissionGuard>
        
        <!-- 标签数据 - 需要权限 -->
        <PermissionGuard :any-perms="['MANAGE_TAGS']">
          <GlassCard class="p-6 text-center">
            <div class="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <TagIcon class="w-6 h-6 text-white" />
            </div>
            <div class="text-2xl font-bold text-purple-600 mb-1">{{ stats.tags }}</div>
            <div class="text-sm text-gray-600">标签数</div>
          </GlassCard>
        </PermissionGuard>
      </div>

      <!-- Today's Stats -->
      <GlassCard class="p-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">今日概览</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center">
            <div class="text-2xl font-bold text-brand-600 mb-1">{{ todayStats.posts }}</div>
            <div class="text-sm text-gray-600">新表白</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600 mb-1">{{ todayStats.comments }}</div>
            <div class="text-sm text-gray-600">新评论</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600 mb-1">{{ todayStats.users }}</div>
            <div class="text-sm text-gray-600">新用户</div>
          </div>
        </div>
      </GlassCard>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- 表白管理 - 所有管理员都可访问 -->
        <NuxtLink to="/admin/posts" class="block">
          <GlassCard class="p-6 text-center hover:shadow-glow-lg transition-all group">
            <div class="w-12 h-12 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <FileTextIcon class="w-6 h-6 text-white" />
            </div>
            <h3 class="font-semibold text-gray-800 mb-2">表白管理</h3>
            <p class="text-sm text-gray-600">审核、置顶和精华表白</p>
          </GlassCard>
        </NuxtLink>

        <!-- 用户管理 - 需要权限 -->
        <PermissionGuard :any-perms="['MANAGE_USERS']">
          <NuxtLink to="/admin/users" class="block">
            <GlassCard class="p-6 text-center hover:shadow-glow-lg transition-all group">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <UsersIcon class="w-6 h-6 text-white" />
              </div>
              <h3 class="font-semibold text-gray-800 mb-2">用户管理</h3>
              <p class="text-sm text-gray-600">管理用户账户和权限</p>
            </GlassCard>
          </NuxtLink>
        </PermissionGuard>

        <!-- 评论管理 - 需要权限 -->
        <PermissionGuard :any-perms="['MANAGE_COMMENTS']">
          <NuxtLink to="/admin/comments" class="block">
            <GlassCard class="p-6 text-center hover:shadow-glow-lg transition-all group">
              <div class="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <MessageSquareIcon class="w-6 h-6 text-white" />
              </div>
              <h3 class="font-semibold text-gray-800 mb-2">评论管理</h3>
              <p class="text-sm text-gray-600">审核和管理用户评论</p>
            </GlassCard>
          </NuxtLink>
        </PermissionGuard>

        <!-- 公告管理 - 需要权限 -->
        <PermissionGuard :any-perms="['MANAGE_ANNOUNCEMENTS']">
          <NuxtLink to="/admin/announcements" class="block">
            <GlassCard class="p-6 text-center hover:shadow-glow-lg transition-all group">
              <div class="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <MegaphoneIcon class="w-6 h-6 text-white" />
              </div>
              <h3 class="font-semibold text-gray-800 mb-2">公告管理</h3>
              <p class="text-sm text-gray-600">发布和管理系统公告</p>
            </GlassCard>
          </NuxtLink>
        </PermissionGuard>

        <!-- 标签管理 - 需要权限 -->
        <PermissionGuard :any-perms="['MANAGE_TAGS']">
          <NuxtLink to="/admin/tags" class="block">
            <GlassCard class="p-6 text-center hover:shadow-glow-lg transition-all group">
              <div class="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <TagIcon class="w-6 h-6 text-white" />
              </div>
              <h3 class="font-semibold text-gray-800 mb-2">标签管理</h3>
              <p class="text-sm text-gray-600">创建标签和生成兑换码</p>
            </GlassCard>
          </NuxtLink>
        </PermissionGuard>

        <!-- 系统设置 - 仅超管 -->
        <PermissionGuard require-superadmin>
          <NuxtLink to="/admin/system" class="block">
            <GlassCard class="p-6 text-center hover:shadow-glow-lg transition-all group">
              <div class="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <SettingsIcon class="w-6 h-6 text-white" />
              </div>
              <h3 class="font-semibold text-gray-800 mb-2">系统设置</h3>
              <p class="text-sm text-gray-600">系统配置和维护</p>
            </GlassCard>
          </NuxtLink>
        </PermissionGuard>
      </div>

      <!-- Recent Activity -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Recent Posts -->
        <GlassCard class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-800">最新表白</h3>
            <NuxtLink to="/admin/posts" class="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 hover:underline font-medium transition-colors">
              查看全部 →
            </NuxtLink>
          </div>
          
          <div v-if="recentPosts.length" class="space-y-3">
            <div
              v-for="post in recentPosts"
              :key="post.id"
              class="p-3 bg-white/10 rounded-lg border border-white/10"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="font-medium text-gray-800">
                  {{ post.author_name }} → {{ post.target_name }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ formatDate(post.created_at) }}
                </div>
              </div>
              <p class="text-sm text-gray-600 line-clamp-2">{{ post.content }}</p>
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-gray-500">
            暂无最新表白
          </div>
        </GlassCard>

        <!-- Recent Comments -->
        <PermissionGuard :any-perms="['MANAGE_COMMENTS']">
          <GlassCard class="p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-800">最新评论</h3>
              <NuxtLink to="/admin/comments" class="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 hover:underline font-medium transition-colors">
                查看全部 →
              </NuxtLink>
            </div>
            
            <div v-if="recentComments.length" class="space-y-3">
              <div
                v-for="comment in recentComments"
                :key="comment.id"
                class="p-3 bg-white/10 rounded-lg border border-white/10"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="font-medium text-gray-800">
                    用户评论
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ formatDate(comment.created_at) }}
                  </div>
                </div>
                <p class="text-sm text-gray-600 line-clamp-2">{{ comment.content }}</p>
              </div>
            </div>
            
            <div v-else class="text-center py-8 text-gray-500">
              暂无最新评论
            </div>
          </GlassCard>
        </PermissionGuard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  UsersIcon,
  FileTextIcon,
  MessageSquareIcon,
  TagIcon,
  SettingsIcon,
  MegaphoneIcon
} from 'lucide-vue-next'
import type { PostDto, CommentDto } from '~/types'

definePageMeta({
  middleware: 'admin'
})

// Stores
const auth = useAuthStore()
const toast = useToast()

// State
const loading = ref(true)
const stats = reactive({
  users: 0,
  posts: 0,
  comments: 0,
  tags: 0
})

const todayStats = reactive({
  posts: 0,
  comments: 0,
  users: 0
})

const recentPosts = ref<PostDto[]>([])
const recentComments = ref<CommentDto[]>([])

// Methods
const loadDashboardData = async () => {
  loading.value = true
  
  try {
    const api = useApi()
    
    // Load platform metrics (if has permission)
    let gotMetrics = false
    if (auth.hasPerm('MANAGE_USERS') || auth.isSuperadmin) {
      try {
        const m = await api.getAdminMetrics()
        stats.users = m.total_users
        stats.posts = m.total_posts
        stats.comments = m.total_comments
        todayStats.users = m.today_new_users
        todayStats.posts = m.today_new_posts
        todayStats.comments = m.today_comments
        gotMetrics = true
      } catch (error) {
        console.warn('Failed to load admin metrics:', error)
      }
    }
    
    // Load recent posts - this should work for all users
    try {
      const postsData = await api.listPosts({ page: 1, page_size: 5 })
      recentPosts.value = postsData.items
      if (!gotMetrics) stats.posts = postsData.total
      
      // Calculate today's posts from recent posts if metrics API doesn't provide it
      if (!auth.hasPerm('MANAGE_USERS') && !auth.isSuperadmin) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        todayStats.posts = recentPosts.value.filter(post => 
          new Date(post.created_at) >= today
        ).length
      }
    } catch (error) {
      console.warn('Failed to load posts:', error)
    }

    // Load recent comments (if has permission)
    if (auth.hasPerm('MANAGE_COMMENTS')) {
      try {
        const commentsData = await api.getAdminComments({ page: 1, page_size: 5 })
        recentComments.value = commentsData.items
        // Don't override stats.comments if we got it from metrics API
        if (!auth.hasPerm('MANAGE_USERS') && !auth.isSuperadmin) {
          stats.comments = commentsData.total
        }
      } catch (error) {
        console.warn('Failed to load comments:', error)
      }
    }

    // Load users count (if has permission)
    if ((auth.hasPerm('MANAGE_USERS') || auth.isSuperadmin) && !gotMetrics) {
      try {
        const usersData = await api.listUsers({ page: 1, page_size: 1 })
        stats.users = usersData.total
      } catch (error) {
        console.warn('Failed to load users:', error)
      }
    }

    // Load tags count (if has permission)
    if (auth.hasPerm('MANAGE_TAGS')) {
      try {
        const tagsData = await api.listTags({ page: 1, page_size: 1 })
        stats.tags = tagsData.total
      } catch (error) {
        console.warn('Failed to load tags:', error)
      }
    }

  } catch (error: any) {
    console.error('Dashboard loading error:', error)
    toast.error('加载仪表板数据失败')
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// Initialize
onMounted(() => {
  loadDashboardData()
})

// SEO
useHead({
  title: '管理后台 - 郑州四中表白墙',
  meta: [
    { name: 'description', content: '郑州四中表白墙管理后台，系统管理和内容审核' }
  ]
})
</script>
