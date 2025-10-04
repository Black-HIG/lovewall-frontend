<template>
  <div class="h-screen overflow-hidden relative">
    <!-- Background Image -->
    <div class="fixed inset-0 z-0">
      <img
        v-if="bg.src.value && !bg.loading.value"
        :src="bg.src.value"
        alt="Background"
        class="w-full h-full object-cover animate-fade-in"
        loading="eager"
      >

      <!-- Fallback gradient background -->
      <div v-else class="w-full h-full bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100" />
    </div>

    <!-- Blur Overlay -->
    <div class="fixed inset-0 z-10 pointer-events-none bg-white/20 backdrop-blur-strong" />

    <!-- Main Content Wrapper -->
    <div class="relative z-20 h-screen flex flex-col overflow-hidden">
      <!-- Status Bar -->
      <header class="fixed top-0 left-0 right-0 z-50">
        <div class="glass-bar rounded-none h-14 px-3 sm:px-4 flex items-center justify-between">
          <!-- Site name / logo -->
          <NuxtLink to="/" class="flex items-center gap-2 text-brand-600 hover:text-brand-700">
            <HeartIcon class="w-5 h-5" />
            <span class="font-bold text-lg hidden sm:block">Love Wall</span>
          </NuxtLink>

          <!-- Auth Area -->
          <div class="relative flex items-center gap-2 overflow-visible z-50" ref="userMenuRef">
            <!-- 未登录：登录/注册 -->
            <template v-if="!auth.isAuthenticated">
              <NuxtLink to="/auth/login" class="glass-button-secondary px-3 py-1.5 text-sm font-medium">登录</NuxtLink>
              <NuxtLink to="/auth/register" class="glass-button px-3 py-1.5 text-sm font-medium">注册</NuxtLink>
            </template>

            <!-- 已登录：通知按钮 + 头像/昵称 + 下拉 -->
            <template v-else>
              <!-- 通知按钮（在头像左侧） -->
              <NuxtLink
                to="/notifications"
                class="relative inline-flex items-center justify-center rounded-lg h-9 w-9 text-gray-700 hover:text-brand-600 hover:bg-white/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60"
                title="系统通知"
                aria-label="系统通知"
              >
                <BellIcon class="w-5 h-5" />
                <!-- 未读红点 -->
                <span v-if="unreadCount > 0" class="absolute top-1 right-1 inline-block w-2 h-2 bg-red-500 rounded-full" />
              </NuxtLink>
              <button
                class="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-white/20 transition-colors"
                @click="showUserMenu = !showUserMenu"
              >
                <img
                  v-if="auth.currentUser?.avatar_url"
                  :src="assetUrl(auth.currentUser.avatar_url)"
                  :alt="auth.userDisplayName"
                  class="w-7 h-7 rounded-full"
                >
                <UserIcon v-else class="w-6 h-6" />
                <span class="hidden sm:block">{{ auth.userDisplayName }}</span>
                <ChevronDownIcon class="w-4 h-4" />
              </button>

              <!-- Dropdown menu -->
              <div v-if="showUserMenu" class="absolute right-0 top-full mt-2 w-56 glass-card backdrop-blur-ultra py-2 shadow-lg z-50">
                <NuxtLink to="/me" class="block px-4 py-2 text-sm text-gray-700 hover:bg-white/20" @click="showUserMenu = false">个人中心</NuxtLink>
                <NuxtLink to="/me/comments" class="block px-4 py-2 text-sm text-gray-700 hover:bg-white/20" @click="showUserMenu = false">我的评论</NuxtLink>
                <NuxtLink to="/me/tags" class="block px-4 py-2 text-sm text-gray-700 hover:bg-white/20" @click="showUserMenu = false">我的标签</NuxtLink>
                <button
                  v-if="auth.isSuperadmin || auth.hasAnyPerm(['MANAGE_USERS','MANAGE_ANNOUNCEMENTS','MANAGE_COMMENTS','MANAGE_TAGS'])"
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-white/20"
                  @click="goAdmin"
                >管理后台</button>
                <hr class="my-1 border-white/20">
                <button class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-white/20" @click="handleLogout">退出登录</button>
              </div>
            </template>
          </div>
        </div>
      </header>

      <!-- 固定头部占位 -->
      <div class="pt-14" />

      <!-- Announcements -->
      <div>
        <AnnouncementBar v-if="announcements.length > 0" :announcements="announcements" />
      </div>

      <!-- Page Content -->
      <main class="content-container flex-1 min-h-0 py-6 relative">
        <div class="h-full overflow-auto no-scrollbar">
          <NuxtPage />
        </div>
        <!-- Toast Notifications -->
        <ToastContainer />
      </main>

      <!-- Footer -->
      <div class="shrink-0">
        <hr class="border-t border-white/40 mb-4" />
        <footer class="glass-card rounded-none py-6 text-center text-sm text-gray-600">
          <div class="space-y-2">
            <p>© 2024 Love Wall. Made with ❤</p>
            <div class="flex justify-center gap-4">
              <a href="#" class="hover:text-brand-600 transition-colors">隐私政策</a>
              <a href="#" class="hover:text-brand-600 transition-colors">服务条款</a>
              <a href="#" class="hover:text-brand-600 transition-colors">联系我们</a>
            </div>
          </div>
        </footer>
      </div>
    </div>

    <!-- Loading Screen -->
    <div v-if="initializing" class="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div class="text-center">
        <LoadingSpinner size="lg" />
        <p class="mt-4 text-gray-600">加载中...</p>
      </div>
    </div>

    <!-- Route announcer for accessibility -->
    <NuxtRouteAnnouncer />
  </div>
</template>

<script setup lang="ts">
import type { AnnouncementDto } from '~/types'
import { HeartIcon, UserIcon, ChevronDownIcon, BellIcon } from 'lucide-vue-next'
import { onClickOutside } from '@vueuse/core'
import ToastContainer from '~/components/ui/ToastContainer.vue'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import AnnouncementBar from '~/components/layout/AnnouncementBar.vue'

// Stores
const auth = useAuthStore()

// Background image
const bg = useRandomBg()
const assetUrl = useAssetUrl()

// State
const announcements = ref<AnnouncementDto[]>([])
const initializing = ref(true)
const showUserMenu = ref(false)
const userMenuRef = ref<HTMLElement>()
onClickOutside(userMenuRef, () => { showUserMenu.value = false })

const handleLogout = async () => {
  showUserMenu.value = false
  await auth.logout()
}

const goAdmin = async () => {
  showUserMenu.value = false
  await navigateTo('/admin')
}

// Initialize app
const initializeApp = async () => {
  try {
    await auth.initAuth()
    if (process.client) {
      try {
        const api = useApi()
        announcements.value = await api.listAnnouncements()
      } catch {}
    }
  } catch (error) {
    console.error('App initialization failed:', error)
  } finally {
    initializing.value = false
  }
}

onMounted(() => {
  initializeApp()
})

// 通知红点：未读计数和轮询刷新
const api = useApi()
const unreadCount = ref(0)

const loadUnreadCount = async () => {
  if (!auth.isAuthenticated) return
  try {
    const res = await api.getUnreadNotificationCount()
    unreadCount.value = res.count || 0
  } catch {}
}

let unreadInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  if (process.client && auth.isAuthenticated) {
    loadUnreadCount()
    unreadInterval = setInterval(loadUnreadCount, 30000)
  }
})

onUnmounted(() => {
  if (unreadInterval) clearInterval(unreadInterval)
})

watch(() => auth.isAuthenticated, (v) => {
  if (v) {
    loadUnreadCount()
    if (!unreadInterval) unreadInterval = setInterval(loadUnreadCount, 30000)
  } else {
    unreadCount.value = 0
    if (unreadInterval) { clearInterval(unreadInterval); unreadInterval = null }
  }
})

// 路由变化时刷新一次（进入通知页读完后尽快清红点）
const route = useRoute()
watch(() => route.path, () => {
  showUserMenu.value = false
  if (process.client) setTimeout(loadUnreadCount, 500)
})
</script>


