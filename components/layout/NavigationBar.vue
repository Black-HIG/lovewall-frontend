<template>
  <nav class="fixed top-0 left-0 right-0 z-50 navigation-section">
    <div class="content-container">
      <div :class="[
        'flex items-center justify-between transition-all duration-300',
        isMobile ? 'h-14 px-3' : 'h-16 px-4'
      ]">
        <!-- Logo -->
        <NuxtLink
          to="/"
          :class="[
            'flex items-center gap-2 font-bold text-brand-600 hover:text-brand-700 transition-all',
            isMobile ? 'text-lg' : 'text-xl'
          ]"
        >
          <HeartIcon :class="isMobile ? 'w-5 h-5' : 'w-6 h-6'" />
          <span :class="{ 'hidden xs:block': isMobile }">Love Wall</span>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center gap-6">
          <NuxtLink
            to="/"
            class="glass-button-secondary text-sm font-medium px-4 py-2"
          >
            首页
          </NuxtLink>
          
          <NuxtLink
            v-if="auth.isAuthenticated"
            to="/posts/new"
            class="glass-button-secondary text-sm font-medium px-4 py-2"
          >
            发布表白
          </NuxtLink>

          <NuxtLink
            v-if="auth.isAuthenticated && (auth.isSuperadmin || auth.hasAnyPerm(['MANAGE_USERS', 'MANAGE_ANNOUNCEMENTS', 'MANAGE_TAGS']))"
            to="/admin"
            class="glass-button-secondary text-sm font-medium px-4 py-2"
          >
            管理后台
          </NuxtLink>
        </div>

        <!-- User Menu -->
        <div :class="[
          'flex items-center',
          isMobile ? 'gap-2' : 'gap-3'
        ]">
          <!-- Auth buttons for non-authenticated users -->
          <template v-if="!auth.isAuthenticated">
            <div v-if="!isMobile" class="flex items-center gap-2">
              <NuxtLink
                to="/auth/login"
                class="glass-button-secondary px-4 py-2 text-sm font-medium"
              >
                登录
              </NuxtLink>
              <NuxtLink
                to="/auth/register"
                class="glass-button px-4 py-2 text-sm font-medium"
              >
                注册
              </NuxtLink>
            </div>
          </template>

          <!-- User dropdown for authenticated users -->
          <template v-if="auth.isAuthenticated">
            <!-- 通知按钮 -->
            <NuxtLink
              to="/notifications"
              :class="[
                'relative inline-flex items-center justify-center rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60',
                isMobile ? 'h-9 w-9' : 'h-10 w-10',
                'text-gray-700 hover:text-brand-600 hover:bg-white/30'
              ]"
              title="系统通知"
              aria-label="系统通知"
            >
              <BellIcon :class="isMobile ? 'w-5 h-5' : 'w-6 h-6'" />
              <!-- 未读红点 -->
              <span
                v-if="unreadCount > 0"
                class="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white"
              >
                {{ unreadCount > 99 ? '99+' : unreadCount }}
              </span>
            </NuxtLink>

            <div class="relative" ref="userMenuRef">
              <button
                :class="[
                  'flex items-center gap-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-white/20 transition-colors',
                  isMobile ? 'p-1.5' : 'p-2'
                ]"
                @click="showUserMenu = !showUserMenu"
              >
                <div v-if="auth.currentUser?.avatar_url" class="relative">
                  <!-- 管理员光圈效果 -->
                  <div
                    v-if="auth.currentUser?.isadmin"
                    class="absolute -inset-[2px] rounded-full bg-blue-500/30 blur-[4px]"
                  ></div>

                  <!-- 头像 -->
                  <img
                    :src="assetUrl(auth.currentUser.avatar_url)"
                    :alt="auth.userDisplayName"
                    :class="[
                      'relative rounded-full object-cover border border-white/20',
                      isMobile ? 'w-5 h-5' : 'w-6 h-6'
                    ]"
                  >
                </div>
                <UserIcon v-else :class="isMobile ? 'w-5 h-5' : 'w-6 h-6'" />
                <span v-if="!isMobile" class="hidden sm:block">{{ auth.userDisplayName }}</span>
                <ChevronDownIcon v-if="!isMobile" class="w-4 h-4" />
              </button>

              <!-- Dropdown menu -->
              <div
                v-if="showUserMenu"
                class="absolute right-0 mt-2 w-48 glass-card py-2 shadow-lg"
              >
                <NuxtLink
                  to="/me"
                  class="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white/20 rounded-lg"
                  @click="showUserMenu = false"
                >
                  个人中心
                </NuxtLink>
                <NuxtLink
                  to="/me/posts"
                  class="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white/20 rounded-lg"
                  @click="showUserMenu = false"
                >
                  我的帖子
                </NuxtLink>
                <NuxtLink
                  to="/me/tags"
                  class="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white/20 rounded-lg"
                  @click="showUserMenu = false"
                >
                  我的标签
                </NuxtLink>
                <hr class="my-1 border-white/20">
                <button
                  class="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white/20 rounded-lg"
                  @click="handleLogout"
                >
                  退出登录
                </button>
              </div>
            </div>
          </template>

          <!-- Mobile menu button -->
          <button
            v-if="isMobile"
            class="p-1.5 text-gray-700 hover:text-brand-600 transition-colors"
            @click="showMobileMenu = !showMobileMenu"
          >
            <MenuIcon class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <div
        v-if="showMobileMenu && isMobile"
        class="py-3 border-t border-white/20 animate-slide-down"
      >
        <div class="space-y-2">
          <NuxtLink
            to="/"
            class="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white/20 rounded-lg"
            @click="showMobileMenu = false"
          >
            首页
          </NuxtLink>
          
          <NuxtLink
            v-if="auth.isAuthenticated"
            to="/posts/new"
            class="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white/20 rounded-lg"
            @click="showMobileMenu = false"
          >
            发布表白
          </NuxtLink>

          <NuxtLink
            v-if="auth.isAuthenticated && (auth.isSuperadmin || auth.hasAnyPerm(['MANAGE_USERS', 'MANAGE_ANNOUNCEMENTS', 'MANAGE_TAGS']))"
            to="/admin"
            class="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white/20 rounded-lg"
            @click="showMobileMenu = false"
          >
            管理后台
          </NuxtLink>

          <!-- Mobile Auth buttons -->
          <template v-if="!auth.isAuthenticated">
            <div class="pt-2 border-t border-white/20 mt-2">
              <NuxtLink
                to="/auth/login"
                class="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white/20 rounded-lg"
                @click="showMobileMenu = false"
              >
                登录
              </NuxtLink>
              <NuxtLink
                to="/auth/register"
                class="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white/20 rounded-lg"
                @click="showMobileMenu = false"
              >
                注册
              </NuxtLink>
            </div>
          </template>

          <!-- Mobile User menu -->
          <template v-if="auth.isAuthenticated">
            <div class="pt-2 border-t border-white/20 mt-2">
              <NuxtLink
                to="/me"
                class="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white/20 rounded-lg"
                @click="showMobileMenu = false"
              >
                个人中心
              </NuxtLink>
              <button
                class="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white/20 rounded-lg"
                @click="handleLogout"
              >
                退出登录
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import {
  HeartIcon,
  UserIcon,
  ChevronDownIcon,
  MenuIcon,
  BellIcon
} from 'lucide-vue-next'
import { onClickOutside } from '@vueuse/core'

const auth = useAuthStore()
const api = useApi()
const assetUrl = useAssetUrl()
const { isMobile, deviceType } = useDevice()
const showUserMenu = ref(false)
const showMobileMenu = ref(false)
const userMenuRef = ref<HTMLElement>()
const unreadCount = ref(0)

// 加载未读通知数
const loadUnreadCount = async () => {
  if (!auth.isAuthenticated) return
  try {
    const res = await api.getUnreadNotificationCount()
    unreadCount.value = res.count || 0
  } catch (e) {
    // 忽略错误,避免影响页面加载
  }
}

// 定时刷新未读数
let unreadInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  if (process.client && auth.isAuthenticated) {
    loadUnreadCount()
    unreadInterval = setInterval(loadUnreadCount, 30000) // 30秒刷新一次
  }
})

onUnmounted(() => {
  if (unreadInterval) {
    clearInterval(unreadInterval)
  }
})

// 监听登录状态变化
watch(() => auth.isAuthenticated, (newVal) => {
  if (newVal) {
    loadUnreadCount()
    if (!unreadInterval) {
      unreadInterval = setInterval(loadUnreadCount, 30000)
    }
  } else {
    unreadCount.value = 0
    if (unreadInterval) {
      clearInterval(unreadInterval)
      unreadInterval = null
    }
  }
})

// Close dropdowns when clicking outside
onClickOutside(userMenuRef, () => {
  showUserMenu.value = false
})

const handleLogout = async () => {
  showUserMenu.value = false
  showMobileMenu.value = false
  await auth.logout()
}

// 关闭移动菜单当路由改变时
const route = useRoute()
watch(() => route.path, () => {
  showMobileMenu.value = false
  showUserMenu.value = false
})
</script>
