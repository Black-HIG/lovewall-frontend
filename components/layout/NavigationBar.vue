<template>
  <nav class="fixed top-0 left-0 right-0 z-50 navigation-section">
    <div class="content-container">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <NuxtLink
          to="/"
          class="flex items-center gap-2 text-xl font-bold text-brand-600 hover:text-brand-700"
        >
          <HeartIcon class="w-6 h-6" />
          <span>Love Wall</span>
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
        <div class="flex items-center gap-3">
          <!-- Auth buttons for non-authenticated users -->
          <template v-if="!auth.isAuthenticated">
            <div class="flex items-center gap-2">
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
            <div class="relative" ref="userMenuRef">
              <button
                class="flex items-center gap-2 p-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-white/20 transition-colors"
                @click="showUserMenu = !showUserMenu"
              >
                <img
                  v-if="auth.currentUser?.avatar_url"
                  :src="auth.currentUser.avatar_url"
                  :alt="auth.userDisplayName"
                  class="w-6 h-6 rounded-full"
                >
                <UserIcon v-else class="w-6 h-6" />
                <span class="hidden sm:block">{{ auth.userDisplayName }}</span>
                <ChevronDownIcon class="w-4 h-4" />
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
            class="md:hidden p-2 text-gray-700 hover:text-brand-600"
            @click="showMobileMenu = !showMobileMenu"
          >
            <MenuIcon class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <div
        v-if="showMobileMenu"
        class="md:hidden py-4 border-t border-white/20"
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
  MenuIcon 
} from 'lucide-vue-next'
import { onClickOutside } from '@vueuse/core'

const auth = useAuthStore()
const showUserMenu = ref(false)
const showMobileMenu = ref(false)
const userMenuRef = ref<HTMLElement>()

// Close dropdowns when clicking outside
onClickOutside(userMenuRef, () => {
  showUserMenu.value = false
})

const handleLogout = async () => {
  showUserMenu.value = false
  await auth.logout()
}</script>
