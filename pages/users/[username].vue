<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <LoadingSpinner size="lg" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <GlassCard class="p-8">
        <h1 class="text-2xl font-bold text-red-600 mb-4">用户不存在</h1>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <GlassButton @click="$router.back()" variant="secondary">
          返回上页
        </GlassButton>
      </GlassCard>
    </div>

    <!-- User Profile -->
    <div v-else-if="user" class="space-y-6">
      <!-- User Info Card -->
      <GlassCard class="p-8">
        <div class="flex flex-col md:flex-row items-center md:items-start gap-6">
          <!-- Avatar -->
          <div class="flex-shrink-0">
            <div class="w-32 h-32 rounded-full overflow-hidden shadow-lg">
              <img
                v-if="user.avatar_url"
                :src="assetUrl(user.avatar_url)"
                :alt="userDisplayName"
                class="w-32 h-32 object-cover"
              >
              <div 
                v-else
                class="w-32 h-32 bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-4xl font-bold"
              >
                {{ userDisplayName.slice(0, 2) }}
              </div>
            </div>
          </div>

          <!-- User Details -->
          <div class="flex-1 text-center md:text-left">
            <div class="mb-4">
              <div class="flex items-center justify-center md:justify-start gap-2 mb-2">
                <h1 class="text-3xl font-bold text-gray-800">{{ userDisplayName }}</h1>
                <TagBadge
                  v-if="activeTag"
                  :title="activeTag.title"
                  :background="activeTag.background_color"
                  :text="activeTag.text_color"
                />
              </div>
              <p class="text-gray-600">@{{ user.username }}</p>
            </div>
            
            <!-- Bio -->
            <div v-if="user.bio" class="mb-4">
              <p class="text-gray-700 leading-relaxed">{{ user.bio }}</p>
            </div>
            
            <!-- Stats -->
            <div class="flex justify-center md:justify-start gap-6 text-sm text-gray-600">
              <span>加入于 {{ formatDate(user.created_at) }}</span>
              <span v-if="user.status === 0" class="text-green-600">● 活跃</span>
            </div>
          </div>
        </div>
      </GlassCard>

      <!-- User Posts Section -->
      <GlassCard class="p-6">
        <div class="border-b border-white/20 pb-4 mb-6">
          <h2 class="text-xl font-semibold text-gray-800">
            {{ userDisplayName }} 的表白
          </h2>
        </div>

        <!-- Posts Loading -->
        <div v-if="postsLoading" class="flex justify-center py-8">
          <LoadingSpinner />
        </div>

        <!-- No Posts -->
        <div v-else-if="!userPosts.length" class="text-center py-12 text-gray-500">
          <div class="mb-4">
            <HeartIcon class="w-16 h-16 mx-auto text-gray-300" />
          </div>
          <p>{{ userDisplayName }} 还没有发表过表白</p>
        </div>

        <!-- Posts List -->
        <div v-else class="space-y-4">
          <div
            v-for="post in userPosts"
            :key="post.id"
            class="p-4 bg-white/10 rounded-xl border border-white/10 hover:bg-white/20 transition-all cursor-pointer"
            @click="navigateTo(`/posts/${post.id}`)"
          >
            <div class="flex gap-4">
              <!-- Post Image Thumbnail -->
              <div v-if="post.image_path" class="flex-shrink-0">
                <img
                  :src="assetUrl(post.image_path)"
                  :alt="`${post.author_name}对${post.target_name}的表白`"
                  class="w-20 h-20 object-cover rounded-lg"
                >
              </div>
              
              <!-- Post Content -->
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <h3 class="font-semibold text-gray-800">
                    {{ post.author_name }} → {{ post.target_name }}
                  </h3>
                  <TagBadge
                    v-if="post.author_tag"
                    :title="post.author_tag.title"
                    :background="post.author_tag.background_color"
                    :text="post.author_tag.text_color"
                  />
                  <div class="flex gap-1 ml-auto">
                    <span
                      v-if="post.is_featured"
                      class="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full"
                    >
                      精选
                    </span>
                    <span
                      v-if="post.is_pinned"
                      class="px-2 py-1 text-xs bg-sky-100 text-sky-800 rounded-full"
                    >
                      置顶
                    </span>
                  </div>
                </div>
                
                <p class="text-gray-600 text-sm line-clamp-2 mb-2">{{ post.content }}</p>
                
                <div class="flex items-center gap-3 text-xs text-gray-500">
                  <span>{{ formatDate(post.created_at) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Load More Posts -->
          <div v-if="postsData && postsData.page * postsData.page_size < postsData.total" class="text-center pt-4">
            <GlassButton
              @click="loadMorePosts"
              :loading="postsLoading"
              variant="secondary"
            >
              加载更多表白
            </GlassButton>
          </div>
        </div>
      </GlassCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { HeartIcon } from 'lucide-vue-next'
import type { User, PostDto, Pagination } from '~/types'

// Get route params
const route = useRoute()
const username = route.params.username as string

// State
const user = ref<User | null>(null)
const activeTag = ref<{ name: string; title: string; background_color: string; text_color: string } | null>(null)
const userStatus = ref<{ exists: boolean; isdeleted: boolean; is_banned: boolean; id?: string } | null>(null)
const userPosts = ref<PostDto[]>([])
const postsData = ref<Pagination<PostDto> | null>(null)
const loading = ref(true)
const postsLoading = ref(false)
const error = ref<string | null>(null)

// Composables
const assetUrl = useAssetUrl()
const toast = useToast()

// Computed
const userDisplayName = computed(() => {
  if (!user.value) return ''
  return user.value.display_name || user.value.username
})

// Methods
const loadUser = async () => {
  try {
    const api = useApi()
    const status = await api.getUserStatusByUsername(username)
    userStatus.value = { exists: status.exists, isdeleted: !!status.isdeleted, is_banned: !!status.is_banned, id: status.id }
    if (!status.exists) {
      error.value = '用户不存在或已注销'
      return
    }
    user.value = await api.getUserByUsername(username)
    activeTag.value = await api.getUserActiveTagByUsername(username)
  } catch (err: any) {
    error.value = err.message || '用户信息加载失败'
  }
}

const loadUserPosts = async (page = 1) => {
  if (!user.value) return
  
  postsLoading.value = true
  try {
    const api = useApi()
    const data = await api.getUserPosts(user.value.id, { page, page_size: 10 })
    
    if (page === 1) {
      userPosts.value = data.items
    } else {
      userPosts.value.push(...data.items)
    }
    postsData.value = data
  } catch (err: any) {
    toast.error('加载用户表白失败')
  } finally {
    postsLoading.value = false
  }
}

const loadMorePosts = () => {
  if (postsData.value) {
    loadUserPosts(postsData.value.page + 1)
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// Initialize
onMounted(async () => {
  await loadUser()
  if (user.value) {
    await loadUserPosts()
  }
  loading.value = false
})

// SEO
useHead(() => {
  if (!user.value) {
    return { title: '用户不存在 - Love Wall' }
  }
  
  return {
    title: `${userDisplayName.value} (@${user.value.username}) - Love Wall`,
    meta: [
      { name: 'description', content: `查看 ${userDisplayName.value} 在 Love Wall 的个人主页` },
    ]
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
