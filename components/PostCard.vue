<template>
  <GlassCard 
    :class="[
      variant === 'list' ? 'post-card-list' : 'post-card',
      'overflow-hidden cursor-pointer group'
    ]" 
    @click="goDetail"
  >
    <!-- Header -->
    <div class="flex items-center justify-between p-4 pb-3">
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <!-- Author Avatar -->
        <div 
          class="w-10 h-10 rounded-full flex-shrink-0 cursor-pointer avatar-ring transition-all"
          @click.stop="navigateToAuthor"
        >
          <img
            v-if="authorAvatar"
            :src="authorAvatar"
            :alt="post.author_name"
            class="w-10 h-10 rounded-full object-cover border-2 border-white/20"
          >
          <div 
            v-else
            class="w-10 h-10 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white/20"
          >
            {{ post.author_name.slice(0, 2) }}
          </div>
        </div>
        
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <h3 class="text-base font-semibold text-gray-900 cursor-pointer hover:text-brand-600 transition-colors" @click.stop="navigateToAuthor">
              {{ post.author_name }}
            </h3>
            <!-- Author Active Tag -->
            <TagBadge
              v-if="activeTag && activeTag.title"
              :title="activeTag.title"
              :background="activeTag.background_color"
              :text="activeTag.text_color"
            />
          </div>
          
          <!-- Status badges -->
          <div class="flex items-center gap-1.5">
            <span
              v-if="post.status !== 1 && post.is_pinned"
              class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-500/80 text-white"
            >
              <PinIcon class="w-3 h-3" />
              置顶
            </span>
            
            <span
              v-if="post.status !== 1 && post.is_featured"
              class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/80 text-white"
            >
              <StarIcon class="w-3 h-3" />
              精华
            </span>

            <!-- Hidden badge for moderators -->
            <span
              v-if="isModerator && post.status === 1"
              class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-500/80 text-white"
            >
              已隐藏
            </span>
            
            <span class="text-xs text-gray-500 ml-auto">{{ formatDate(post.created_at) }}</span>
          </div>
        </div>
      </div>

      <!-- Actions dropdown -->
      <div v-if="showActions && canManage" class="relative flex-shrink-0" ref="dropdownRef" @click.stop>
        <button
          @click="showDropdown = !showDropdown"
          class="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white/20 transition-colors opacity-80 group-hover:opacity-100"
          >
            <MoreVerticalIcon class="w-4 h-4" />
          </button>

        <div
          v-if="showDropdown"
          class="absolute right-0 mt-1 w-48 glass-card py-2 shadow-lg z-10"
        >
          <NuxtLink
            :to="`/posts/${post.id}`"
            class="block px-4 py-2 text-sm text-gray-700 hover:bg-white/20"
            @click="showDropdown = false"
            >
              查看详情
            </NuxtLink>
          
          <template v-if="canManagePost">
            <hr class="my-1 border-white/20">
            <button
              v-if="auth.hasPerm('PIN_POST') && post.status === 0"
              @click="handlePin(!post.is_pinned)"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-white/20"
            >
              {{ post.is_pinned ? '取消置顶' : '置顶' }}
            </button>
            
            <button
              v-if="auth.hasPerm('FEATURE_POST') && post.status === 0"
              @click="handleFeature(!post.is_featured)"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-white/20"
            >
              {{ post.is_featured ? '取消精华' : '设为精华' }}
            </button>
            
            <button
              v-if="auth.hasPerm('HIDE_POST')"
              @click="handleHide"
              class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50/20"
            >
              {{ post.status === 0 ? '隐藏' : '恢复' }}
            </button>
            
            <button
              v-if="auth.hasPerm('DELETE_POST')"
              @click="handleDelete"
              class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50/20"
            >
              删除
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="px-4 pb-3">
      <!-- Love declaration -->
      <div class="mb-3">
        <p class="text-lg font-medium text-gray-900 mb-2">
          → {{ post.target_name }}
        </p>
        <p class="text-gray-700 leading-relaxed text-sm" :class="{ 'line-clamp-4': !expanded }">
          {{ post.content }}
        </p>
        
        <button
          v-if="post.content.length > 150"
          @click.stop="expanded = !expanded"
          class="mt-2 text-sm text-brand-600 hover:text-brand-700 transition-colors"
        >
          {{ expanded ? '收起' : '展开' }}
        </button>
      </div>
    </div>

    <!-- Image -->
    <div v-if="post.image_path" class="px-4 pb-3">
      <img
        :src="assetUrl(post.image_path)"
        :alt="`${post.author_name} 的表白图片`"
        class="w-full max-h-64 object-cover rounded-xl border border-white/20 cursor-pointer hover:opacity-90 transition-opacity"
        @click.stop="showImageModal = true"
      />
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between px-4 py-3 border-t border-white/10">
      <div class="flex items-center gap-4">
        <button
          @click.stop="sharePost"
          class="flex items-center gap-2 text-gray-500 hover:text-brand-600 transition-colors text-sm"
        >
          <Share2Icon class="w-4 h-4" />
          分享
        </button>
      </div>
      
      <div class="text-xs text-gray-400">
        {{ formatTimeAgo(post.created_at) }}
      </div>
    </div>

    <!-- Image Modal -->
    <div
      v-if="showImageModal"
      class="fixed inset-0 z-[9000] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      @click="showImageModal = false"
    >
      <div class="relative max-w-4xl max-h-[90vh] mx-4">
        <img
          :src="assetUrl(post.image_path)"
          :alt="`${post.author_name} 的表白图片`"
          class="max-w-full max-h-full object-contain rounded-lg"
          @click.stop
        />
        <button
          @click="showImageModal = false"
          class="absolute top-4 right-4 p-2 text-white bg-black/50 rounded-full hover:bg-black/70 transition-colors"
        >
          <XIcon class="w-5 h-5" />
        </button>
      </div>
    </div>
  </GlassCard>
</template>

<script setup lang="ts">
import {
  PinIcon,
  StarIcon,
  MoreVerticalIcon,
  Share2Icon,
  XIcon
} from 'lucide-vue-next'
import { onClickOutside } from '@vueuse/core'
import GlassCard from '~/components/ui/GlassCard.vue'
import TagBadge from '~/components/ui/TagBadge.vue'
import type { PostDto } from '~/types'

interface Props {
  post: PostDto
  showActions?: boolean
  variant?: 'grid' | 'list'
}

const props = withDefaults(defineProps<Props>(), {
  showActions: false,
  variant: 'grid'
})

const emit = defineEmits<{
  refresh: []
}>()

// Stores
const auth = useAuthStore()
const api = useApi()
const toast = useToast()
const assetUrl = useAssetUrl()
const router = useRouter()

// State
const expanded = ref(false)
const showDropdown = ref(false)
const showImageModal = ref(false)
const dropdownRef = ref<HTMLElement>()
const authorProfile = ref<any>(null)
const activeTag = ref<any>(null)
const authorAvatar = ref<string | null>(null)

// Close dropdown when clicking outside
onClickOutside(dropdownRef, () => {
  showDropdown.value = false
})

// Fetch author info
const fetchAuthorInfo = async () => {
  try {
    if (props.post.author_id) {
      // 获取用户详细信息
      try {
        const userRes = await api.getUser(props.post.author_id)
        authorProfile.value = userRes
        if (userRes.avatar_url) {
          authorAvatar.value = assetUrl(userRes.avatar_url)
        }
      } catch (error) {
        console.warn('Failed to fetch user profile:', error)
      }
      
      // 获取用户活跃标签
      try {
        const tagRes = await api.getUserActiveTag(props.post.author_id)
        activeTag.value = tagRes
      } catch (error: any) {
        // 没有活跃标签是正常情况，不需要报错或显示错误
        activeTag.value = null
      }
    }
  } catch (error) {
    console.error('Failed to fetch author info:', error)
  }
}

// 组件挂载时获取作者信息
onMounted(() => {
  fetchAuthorInfo()
})

// Computed
const canManage = computed(() => {
  return auth.isAuthenticated && (
    auth.isSuperadmin ||
    auth.hasAnyPerm(['PIN_POST', 'FEATURE_POST', 'HIDE_POST', 'DELETE_POST']) ||
    auth.currentUser?.id === props.post.author_id
  )
})

const canManagePost = computed(() => {
  return auth.isSuperadmin || auth.hasAnyPerm(['PIN_POST', 'FEATURE_POST', 'HIDE_POST', 'DELETE_POST'])
})

const isModerator = computed(() => auth.isSuperadmin || auth.hasAnyPerm(['HIDE_POST','DELETE_POST','EDIT_POST']))

const goDetail = () => {
  router.push(`/posts/${props.post.id}`)
}

// Navigate to author profile
const navigateToAuthor = () => {
  // 如果有author_id，使用ID路由，否则使用用户名（临时方案）
  if (props.post.author_id) {
    navigateTo(`/users/id/${props.post.author_id}`)
  } else {
    // 备用方案：通过作者名称导航（不推荐，因为名称可能重复）
    navigateTo(`/users/${encodeURIComponent(props.post.author_name)}`)
  }
}

// Actions
const handlePin = async (pin: boolean) => {
  try {
    await api.pinPost(props.post.id, pin)
    toast.success(pin ? '已置顶' : '已取消置顶')
    emit('refresh')
  } catch (error) {
    console.error('Pin post failed:', error)
  }
  showDropdown.value = false
}

const handleFeature = async (feature: boolean) => {
  try {
    await api.featurePost(props.post.id, feature)
    toast.success(feature ? '已设为精华' : '已取消精华')
    emit('refresh')
  } catch (error) {
    console.error('Feature post failed:', error)
  }
  showDropdown.value = false
}

const handleHide = async () => {
  const hide = props.post.status === 0
  if (hide && !confirm('确定要隐藏这个帖子吗？')) return
  try {
    await api.hidePost(props.post.id, hide)
    toast.success(hide ? '已隐藏帖子' : '已恢复帖子')
    emit('refresh')
  } catch (error) {
    console.error('Hide/unhide post failed:', error)
  }
  showDropdown.value = false
}

const handleDelete = async () => {
  if (!confirm('确定要删除这个帖子吗？此操作不可恢复！')) return
  
  try {
    await api.deletePost(props.post.id)
    toast.success('已删除帖子')
    emit('refresh')
  } catch (error) {
    console.error('Delete post failed:', error)
  }
  showDropdown.value = false
}

const sharePost = async () => {
  const url = `${window.location.origin}/posts/${props.post.id}`
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: `${props.post.author_name} → ${props.post.target_name}`,
        text: props.post.content,
        url,
      })
    } catch (error) {
      // User cancelled sharing
    }
  } else {
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url)
      toast.success('链接已复制到剪贴板')
    } catch (error) {
      console.error('Copy failed:', error)
      toast.error('分享失败')
    }
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 30) return `${days} 天前`
  
  return date.toLocaleDateString('zh-CN')
}

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return '刚刚'
  if (minutes < 5) return '几分钟前'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
}
</script>
