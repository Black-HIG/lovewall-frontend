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
      <div
        v-else
        class="w-full h-full bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100"
      />
    </div>

    <!-- Blur Overlay -->
    <div class="fixed inset-0 z-10 pointer-events-none bg-white/20 backdrop-blur-sm" />

    <!-- Main Content Wrapper -->
    <div class="relative z-20 h-screen flex flex-col overflow-hidden">
      <!-- Status Bar -->
      <header class="fixed top-0 left-0 right-0 z-50">
        <div class="content-container pt-2">
          <div class="glass-bar h-14 px-3 sm:px-4 flex items-center justify-between">
            <!-- Site name / logo -->
            <NuxtLink to="/" class="flex items-center gap-2 text-brand-600 hover:text-brand-700">
              <HeartIcon class="w-5 h-5" />
              <span class="font-bold text-lg hidden sm:block">Love Wall</span>
            </NuxtLink>

            

            <!-- Auth Area -->
            <div class="relative flex items-center gap-2 overflow-visible z-50" ref="userMenuRef">
              <!-- 未登录：登录/注册 -->
              <template v-if="!auth.isAuthenticated">
                <NuxtLink
                  to="/auth/login"
                  class="glass-button-secondary px-3 py-1.5 text-sm font-medium"
                >
                  登录
                </NuxtLink>
                <NuxtLink
                  to="/auth/register"
                  class="glass-button px-3 py-1.5 text-sm font-medium"
                >
                  注册
                </NuxtLink>
              </template>

              <!-- 已登录：头像/昵称 + 下拉 -->
              <template v-else>
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
                <div
                  v-if="showUserMenu"
                  class="absolute right-0 top-full mt-2 w-48 glass-card py-2 shadow-lg z-50"
                >
                  <NuxtLink
                    to="/me"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-white/20"
                    @click="showUserMenu = false"
                  >
                    个人中心
                  </NuxtLink>
                  <NuxtLink
                    to="/me/posts"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-white/20"
                    @click="showUserMenu = false"
                  >
                    我的帖子
                  </NuxtLink>
                  <NuxtLink
                    to="/me/tags"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-white/20"
                    @click="showUserMenu = false"
                  >
                    我的标签
                  </NuxtLink>
                  <button
                    v-if="auth.isSuperadmin || auth.hasAnyPerm(['MANAGE_USERS','MANAGE_ANNOUNCEMENTS','MANAGE_COMMENTS','MANAGE_TAGS'])"
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-white/20"
                    @click="goAdmin"
                  >
                    管理后台
                  </button>
                  <hr class="my-1 border-white/20">
                  <button
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-white/20"
                    @click="handleLogout"
                  >
                    退出登录
                  </button>
                </div>
              </template>
            </div>
          </div>
        </div>
      </header>

      <!-- 固定头部占位 -->
      <div class="pt-16" />

      <!-- Announcements -->
      <div>
        <AnnouncementBar v-if="announcements.length > 0" :announcements="announcements" />
      </div>

      <!-- Page Content -->
      <main class="content-container flex-1 min-h-0 py-6 relative">
        <!-- 页面内容始终占满剩余空间（去掉全局外层玻璃框） -->
        <div class="h-full overflow-auto no-scrollbar">
          <NuxtPage />
        </div>
        <!-- Toast Notifications -->
        <ToastContainer />
      </main>

      <!-- Footer divider and sticky block -->
      <div class="content-container shrink-0">
        <hr class="border-t border-white/40 mb-4" />
        <footer class="glass-card py-6 text-center text-sm text-gray-600">
          <div class="space-y-2">
            <p>© 2024 Love Wall. Made with ❤️</p>
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
    <div
      v-if="initializing"
      class="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm"
    >
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
import { HeartIcon, UserIcon, ChevronDownIcon } from 'lucide-vue-next'
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
    // Initialize auth
    await auth.initAuth()
    
    // Load announcements
    if (process.client) {
      try {
        const api = useApi()
        announcements.value = await api.listAnnouncements()
      } catch (error) {
        console.warn('Failed to load announcements:', error)
        // Don't fail app initialization for announcements
      }
    }
  } catch (error) {
    console.error('App initialization failed:', error)
    // Don't throw error to avoid breaking the app
  } finally {
    initializing.value = false
  }
}

onMounted(() => {
  initializeApp()
})
</script>
