<template>
  <div class="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
    <!-- Background Image with Blur Overlay -->
    <div class="fixed inset-0 z-0">
      <img 
        v-if="backgroundSrc" 
        :src="backgroundSrc" 
        alt="Background"
        class="w-full h-full object-cover"
        :class="{ 'opacity-0': backgroundLoading, 'opacity-100': !backgroundLoading }"
      />
      <div class="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
    </div>

    <!-- Sidebar -->
    <AdminSidebar 
      :is-open="sidebarOpen" 
      @close="sidebarOpen = false"
    />

    <!-- Main Content -->
    <div class="relative z-10" :class="{ 'lg:ml-64': true }">
      <!-- Top Bar -->
      <header class="h-16 glass-card flex items-center justify-between px-6 shadow-glow-sm">
        <div class="flex items-center gap-4">
          <!-- Mobile Sidebar Toggle -->
          <button 
            class="lg:hidden p-2 text-gray-600 hover:text-brand-600 hover:bg-white/20 rounded-lg transition-colors"
            @click="sidebarOpen = true"
          >
            <MenuIcon class="w-5 h-5" />
          </button>
          
          <!-- Breadcrumb -->
          <nav class="hidden sm:flex items-center gap-2 text-sm">
            <NuxtLink to="/admin" class="text-brand-600 hover:text-brand-700">管理后台</NuxtLink>
            <ChevronRightIcon v-if="currentPageName" class="w-4 h-4 text-gray-400" />
            <span v-if="currentPageName" class="text-gray-600 font-medium">{{ currentPageName }}</span>
          </nav>
        </div>

        <!-- User Info -->
        <div class="flex items-center gap-4">
          <NuxtLink 
            to="/" 
            class="hidden sm:flex items-center gap-2 text-sm text-gray-600 hover:text-brand-600 transition-colors"
          >
            <HomeIcon class="w-4 h-4" />
            <span>返回首页</span>
          </NuxtLink>

          <div class="flex items-center gap-2 text-sm text-gray-600">
            <UserIcon class="w-4 h-4" />
            <span class="font-medium">{{ auth.userDisplayName }}</span>
            <span v-if="auth.isSuperadmin" class="px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
              超管
            </span>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MenuIcon, ChevronRightIcon, HomeIcon, UserIcon } from 'lucide-vue-next'

const auth = useAuthStore()
const route = useRoute()
const sidebarOpen = ref(false)

// 背景图片
const { src: backgroundSrc, loading: backgroundLoading } = useRandomBg()

// 当前页面名称
const currentPageName = computed(() => {
  const pathMap: Record<string, string> = {
    '/admin': '',
    '/admin/posts': '表白管理',
    '/admin/users': '用户管理', 
    '/admin/comments': '评论管理',
    '/admin/announcements': '公告管理',
    '/admin/tags': '标签管理',
    '/admin/system': '系统设置',
  }
  return pathMap[route.path] || ''
})

// 关闭移动端侧边栏当路由变化时
watch(() => route.path, () => {
  sidebarOpen.value = false
})

// SEO
useHead({
  title: `${currentPageName.value ? `${currentPageName.value} - ` : ''}管理后台 - Love Wall`,
  meta: [
    { name: 'description', content: 'Love Wall 管理后台' }
  ]
})
</script>