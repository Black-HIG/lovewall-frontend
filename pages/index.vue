<template>
  <div class="space-y-8">
    <!-- Header (no outer frame) -->
    <section>
      <div class="page-header">
        <h1 class="page-title">郑州市第四高级中学表白墙</h1>
        <p class="text-gray-600 max-w-2xl mx-auto">
          校园信息交流平台。在这里发布你的想法、分享校园生活，与同学建立联系。
        </p>
      </div>

      <!-- Quick Actions -->
      <div v-if="auth.isAuthenticated" class="flex justify-center">
        <NuxtLink
          to="/posts/new"
          class="glass-button-secondary inline-flex items-center gap-2 rounded-full"
        >
          <PlusIcon class="w-5 h-5" />
          发布表白
        </NuxtLink>
      </div>
    </section>

    <!-- 移除置顶/精选单独区块，统一在最新列表展示（卡片上有标识） -->

    <!-- Recent Posts -->
    <section class="space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <ClockIcon class="w-5 h-5 text-gray-600" />
          <h2 class="text-xl font-semibold text-gray-800">最新表白</h2>
        </div>
        
        <div class="flex items-center gap-2">
          <!-- Layout Toggle (Hidden on mobile) -->
          <div v-if="!isMobile" class="flex items-center gap-1 p-1 bg-white/20 border border-white/20 backdrop-blur-sm rounded-lg shadow-sm">
            <button
              @click="layoutMode = 'grid'"
              :class="[
                'p-1.5 rounded text-xs transition-all',
                effectiveLayout === 'grid' 
                  ? 'bg-white text-brand-600 shadow-sm' 
                  : 'text-gray-600 hover:text-brand-600'
              ]"
              title="网格布局"
            >
              <GridIcon class="w-4 h-4" />
            </button>
            <button
              @click="layoutMode = 'list'"
              :class="[
                'p-1.5 rounded text-xs transition-all',
                effectiveLayout === 'list' 
                  ? 'bg-white text-brand-600 shadow-sm' 
                  : 'text-gray-600 hover:text-brand-600'
              ]"
              title="列表布局"
            >
              <ListIcon class="w-4 h-4" />
            </button>
          </div>
          
          <GlassButton
            @click="refreshPosts"
            :disabled="loading"
            variant="secondary"
            class="!px-3 !py-1.5 text-sm"
          >
            <RefreshCwIcon :class="['w-4 h-4', { 'animate-spin': loading }]" />
            刷新
          </GlassButton>
        </div>
      </div>

      <!-- Posts Grid -->
      <div class="space-y-4">
        <div v-if="loading && posts.length === 0" class="text-center py-12">
          <LoadingSpinner size="lg" />
          <p class="mt-4 text-gray-600">加载表白中...</p>
        </div>

        <div v-else-if="posts.length === 0 && !loading" class="text-center py-12">
          <HeartIcon class="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-600 mb-4">还没有表白哦</p>
          <NuxtLink
            v-if="auth.isAuthenticated"
            to="/posts/new"
            class="glass-button-secondary inline-flex items-center gap-2"
          >
            <PlusIcon class="w-4 h-4" />
            成为第一个
          </NuxtLink>
        </div>

        <!-- Responsive Layout -->
        <div 
          v-if="effectiveLayout === 'grid'"
          :class="gridClasses"
        >
          <PostCard
            v-for="post in posts"
            :key="post.id"
            :post="post"
            :show-actions="auth.isAuthenticated"
            variant="grid"
            @refresh="refreshPosts"
            class="animate-fade-in-up"
          />
        </div>
        
        <!-- List Layout (Always used on mobile) -->
        <div 
          v-else
          :class="[
            'space-y-4',
            isMobile ? 'px-2' : 'max-w-3xl mx-auto'
          ]"
        >
          <PostCard
            v-for="post in posts"
            :key="post.id"
            :post="post"
            :show-actions="auth.isAuthenticated"
            variant="list"
            @refresh="refreshPosts"
            class="w-full animate-fade-in-up"
          />
        </div>
      </div>

      <!-- Load More Button -->
      <div v-if="hasMore && !loading" class="text-center">
        <GlassButton
          @click="loadMore"
          :disabled="loadingMore"
          variant="secondary"
        >
          <LoadingSpinner v-if="loadingMore" size="sm" variant="white" />
          <span>{{ loadingMore ? '加载中...' : '加载更多' }}</span>
        </GlassButton>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { PlusIcon, HeartIcon, ClockIcon, RefreshCwIcon, GridIcon, ListIcon } from 'lucide-vue-next'
import type { PostDto } from '~/types'
import { onBeforeRouteUpdate } from 'vue-router'
import GlassButton from '~/components/ui/GlassButton.vue'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import PostCard from '~/components/PostCard.vue'

// Stores and composables
const auth = useAuthStore()
const home = useHomeStore()
const config = useRuntimeConfig()
const { deviceType, isMobile, isTablet, gridColumns } = useDevice()

// State
// 首页展示：置顶始终靠前
const posts = computed(() => {
  const arr = home.posts as PostDto[]
  const score = (p: PostDto) => {
    if ((p as any).status === 2) return 5
    if ((p as any).status === 1) return 4
    if (p.is_pinned && p.is_featured) return 0
    if (p.is_pinned) return 1
    if (p.is_featured) return 2
    return 3
  }
  const sorted = (arr || []).slice().sort((a, b) => {
    const sa = score(a)
    const sb = score(b)
    if (sa !== sb) return sa - sb
    const at = new Date(a.created_at).getTime()
    const bt = new Date(b.created_at).getTime()
    return bt - at
  })
  console.log('Index: posts recalculated, count:', sorted.length)
  return sorted
})
const loading = computed(() => home.loading)
const loadingMore = computed(() => home.loadingMore)
const currentPage = computed(() => home.page)
const hasMore = computed(() => home.hasMore)

const pageSize = config.public.pageSize as number

// Layout mode - 保存到localStorage，移动端强制列表布局
const layoutMode = ref<'grid' | 'list' | 'auto'>('auto')

// 有效布局模式（考虑设备类型）
const effectiveLayout = computed(() => {
  if (isMobile.value) return 'list' // 移动端强制列表布局
  if (layoutMode.value === 'auto') {
    return isTablet.value ? 'grid' : 'grid' // 平板和桌面默认网格
  }
  return layoutMode.value
})

// 响应式网格类
const gridClasses = computed(() => {
  const base = 'grid gap-4 md:gap-6'
  
  if (isMobile.value) {
    return `${base} grid-cols-1`
  }
  
  if (isTablet.value) {
    return `${base} grid-cols-1 sm:grid-cols-2`
  }
  
  // 桌面端根据屏幕宽度动态调整
  return `${base} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5`
})

// 从localStorage读取布局偏好
onMounted(() => {
  const savedLayout = localStorage.getItem('love-wall-layout') as 'grid' | 'list' | 'auto' | null
  if (savedLayout && ['grid', 'list', 'auto'].includes(savedLayout)) {
    layoutMode.value = savedLayout
  }
})

// 监听布局变化并保存（仅非移动端保存偏好）
watch(layoutMode, (newLayout) => {
  if (!isMobile.value) {
    localStorage.setItem('love-wall-layout', newLayout)
  }
})

// Load posts
const loadPosts = async (page = 1, append = false) => {
  if (append) {
    await home.loadMore()
  } else {
    await home.initialLoad()
  }
}

// 不再单独加载置顶/精选

// Refresh all posts
const refreshPosts = async () => {
  try {
    console.log('[Index] Refresh button clicked')
    await home.refresh()
    console.log('[Index] Refresh completed')
  } catch (e) {
    console.error('[Index] Refresh failed', e)
  }
}

// Load more posts
const loadMore = async () => {
  try {
    console.log('[Index] Load more clicked')
    await home.loadMore()
    console.log('[Index] Load more completed')
  } catch (e) {
    console.error('[Index] Load more failed', e)
  }
}

// Initialize - load data when page mounts
onMounted(async () => {
  console.log('Index: onMounted called')
  
  // 等待认证初始化完成
  if (!auth.initialized) {
    console.log('Index: waiting for auth initialization...')
    // 简单等待机制
    const maxWait = 50 // 最多等待5秒
    let waitCount = 0
    while (!auth.initialized && waitCount < maxWait) {
      await new Promise(resolve => setTimeout(resolve, 100))
      waitCount++
    }
  }
  
  console.log('Index: auth state:', {
    isAuthenticated: auth.isAuthenticated,
    currentUser: auth.currentUser?.id,
    isSuperadmin: auth.isSuperadmin,
    initialized: auth.initialized
  })
  
  await home.forceRefresh()
  console.log('Index: forceRefresh completed')
})

// Use Vue Router 4 composition guard signature (no next)
onBeforeRouteUpdate((to, from) => {
  if (to.fullPath === from.fullPath) {
    return
  }

  console.log('Index: onBeforeRouteUpdate triggered', { to: to.fullPath })
  home.forceRefresh().catch((error) => {
    console.error('Index: onBeforeRouteUpdate refresh failed', error)
  })
})

// When returning to this page via in-app navigation, refresh to ensure data is shown
onActivated(async () => {
  try {
    console.log('Index: onActivated refresh')
    await home.forceRefresh()
  } catch (e) {
    console.error('Index: onActivated refresh failed', e)
  }
})

// Set page meta
definePageMeta({
  title: '郑州市第四高级中学表白墙',
  description: '郑州四中官方校园信息交流平台，学生可以在这里发布表白、分享联系方式、交流校园生活。安全、正规、实名认证的校园社区。',
  key: (route: any) => `index-${(route as any).fullPath || '/'}`
})

useHead({
  title: '郑州四中表白墙 - 校园信息交流平台',
  meta: [
    { name: 'description', content: '郑州四中官方校园信息交流平台，学生可以在这里发布表白、分享联系方式、交流校园生活。安全、正规、实名认证的校园社区。' },
    { name: 'keywords', content: '郑州四中表白墙,郑州市第四高级中学,校园表白,学生社区,校园交流平台' }
  ]
})
</script>



