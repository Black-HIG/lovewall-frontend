<template>
  <div class="space-y-8">
    <!-- Header (no outer frame) -->
    <section>
      <div class="page-header">
        <h1 class="page-title">Love Wall</h1>
        <p class="text-gray-600 max-w-2xl mx-auto">
          这里是一个温暖的表白墙，记录每一个美好的告白时刻。勇敢地说出你的心声吧！
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
          <!-- Layout Toggle -->
          <div class="flex items-center gap-1 p-1 bg-white/20 border border-white/20 backdrop-blur-sm rounded-lg shadow-sm">
            <button
              @click="layoutMode = 'grid'"
              :class="[
                'p-1.5 rounded text-xs transition-all',
                layoutMode === 'grid' 
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
                layoutMode === 'list' 
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

        <!-- Grid Layout -->
        <div 
          v-if="layoutMode === 'grid'"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <PostCard
            v-for="post in posts"
            :key="post.id"
            :post="post"
            :show-actions="auth.isAuthenticated"
            variant="grid"
            @refresh="refreshPosts"
          />
        </div>
        
        <!-- List Layout (Stacked) -->
        <div 
          v-else-if="layoutMode === 'list'"
          class="max-w-2xl mx-auto space-y-4"
        >
          <PostCard
            v-for="post in posts"
            :key="post.id"
            :post="post"
            :show-actions="auth.isAuthenticated"
            variant="list"
            @refresh="refreshPosts"
            class="w-full"
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

// Stores and composables
const auth = useAuthStore()
const home = useHomeStore()
const config = useRuntimeConfig()

// State
// 首页展示：置顶始终靠前
const posts = computed(() => home.sortedPosts)
const loading = computed(() => home.loading)
const loadingMore = computed(() => home.loadingMore)
const currentPage = computed(() => home.page)
const hasMore = computed(() => home.hasMore)

const pageSize = config.public.pageSize as number

// Layout mode - 保存到localStorage
const layoutMode = ref<'grid' | 'list'>('grid')

// 从localStorage读取布局偏好
onMounted(() => {
  const savedLayout = localStorage.getItem('love-wall-layout') as 'grid' | 'list' | null
  if (savedLayout && ['grid', 'list'].includes(savedLayout)) {
    layoutMode.value = savedLayout
  }
})

// 监听布局变化并保存
watch(layoutMode, (newLayout) => {
  localStorage.setItem('love-wall-layout', newLayout)
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
  await home.refresh()
}

// Load more posts
const loadMore = async () => {
  await home.loadMore()
}

// Initialize - always refresh when visiting homepage
onMounted(async () => {
  await home.forceRefresh()
})

// Also refresh when returning to homepage from other pages
onActivated(async () => {
  await home.forceRefresh()
})

// Set page meta
  definePageMeta({
    title: 'Love Wall - 表白墙',
    description: '一个温暖的表白墙，记录美好的告白时刻',
})
</script>
