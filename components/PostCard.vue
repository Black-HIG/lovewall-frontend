<template>
  <GlassCard 
    :class="[
      variant === 'list' ? 'post-card-list' : 'post-card',
      'cursor-pointer group relative overflow-hidden',
      'transition-all duration-300 hover:scale-[1.02] hover:shadow-glow-lg',
      deviceType === 'mobile' ? 'rounded-2xl' : 'rounded-3xl'
    ]" 
    @click="goDetail"
  >
    <!-- Header -->
    <div :class="[
      'flex items-center justify-between pb-3',
      deviceType === 'mobile' ? 'px-3 pt-3' : 'px-4 pt-4'
    ]">
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <!-- Author Avatar -->
        <div class="relative">
          <!-- 管理员光圈效果 -->
          <div
            v-if="post.author_isadmin"
            class="absolute -inset-0.5 rounded-full bg-blue-500/30 blur-[6px]"
          ></div>

          <!-- 头像容器 -->
          <div
            :class="[
              'relative rounded-full flex-shrink-0 cursor-pointer transition-all hover:scale-110',
              deviceType === 'mobile' ? 'w-8 h-8' : 'w-10 h-10'
            ]"
            @click.stop="navigateToAuthor"
          >
            <!-- Avatar image when confirmed exists -->
            <img
              v-if="authorHasAvatar === true && authorAvatar"
              :src="authorAvatar"
              :alt="post.author_name"
              :class="[
                'rounded-full object-cover border-2 border-white/20',
                deviceType === 'mobile' ? 'w-8 h-8' : 'w-10 h-10'
              ]"
              @error="handleAuthorAvatarError"
            >

            <!-- Transparent placeholder while loading/unknown -->
            <div
              v-else-if="authorHasAvatar === null"
              :class="[
                'rounded-full',
                deviceType === 'mobile' ? 'w-8 h-8' : 'w-10 h-10'
              ]"
            />

            <!-- Default initials only when user has no avatar -->
            <div
              v-else
              :class="[
                'bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center text-white font-medium border-2 border-white/20',
                deviceType === 'mobile' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
              ]"
            >
              {{ post.author_name.slice(0, 2) }}
            </div>
          </div>
        </div>
        
        <div class="flex-1 min-w-0">
          <div :class="[
            'flex items-center gap-2',
            deviceType === 'mobile' ? 'mb-0.5' : 'mb-1'
          ]">
            <h3 :class="[
              'font-semibold text-gray-900 cursor-pointer hover:text-brand-600 transition-colors truncate',
              deviceType === 'mobile' ? 'text-sm' : 'text-base'
            ]" @click.stop="navigateToAuthor">
              {{ post.author_name }}
            </h3>
            <span
              v-if="authorDeleted"
              class="px-1.5 py-0.5 text-[10px] font-medium bg-gray-200 text-gray-700 rounded-full"
            >
              已注销
            </span>
            <!-- Author Active Tag -->
            <TagBadge
              v-if="activeTag && activeTag.title"
              :title="activeTag.title"
              :background="activeTag.background_color"
              :text="activeTag.text_color"
            />
            <span
              v-if="activeTag?.user_deleted"
              class="px-1.5 py-0.5 text-[10px] bg-red-100 text-red-600 rounded-full"
            >
              标签所属用户已注销
            </span>
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
          class="absolute right-0 mt-1 w-48 glass-card py-2 shadow-lg z-50"
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
              v-if="auth.hasPerm('MANAGE_FEATURED') && post.status === 0"
              @click="handlePin(!post.is_pinned)"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-white/20"
            >
              {{ post.is_pinned ? '取消置顶' : '置顶' }}
            </button>
            
            <button
              v-if="auth.hasPerm('MANAGE_FEATURED') && post.status === 0"
              @click="handleFeature(!post.is_featured)"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-white/20"
            >
              {{ post.is_featured ? '取消精华' : '设为精华' }}
            </button>
            
            <button
              v-if="auth.hasPerm('MANAGE_POSTS')"
              @click="handleHide"
              class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50/20"
            >
              {{ post.status === 0 ? '隐藏' : '恢复' }}
            </button>
            
            <button
              v-if="auth.hasPerm('MANAGE_POSTS')"
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
    <div :class="[
      'pb-3',
      deviceType === 'mobile' ? 'px-3' : 'px-4'
    ]">
      <!-- Love declaration -->
      <div :class="deviceType === 'mobile' ? 'mb-2' : 'mb-3'">
        <p :class="[
          'font-medium text-gray-900 mb-2',
          deviceType === 'mobile' ? 'text-base' : 'text-lg'
        ]">
          → {{ post.target_name }}
        </p>
        <p :class="[
          'text-gray-700 leading-relaxed',
          deviceType === 'mobile' ? 'text-xs' : 'text-sm',
          { 'line-clamp-3': !expanded && deviceType === 'mobile' },
          { 'line-clamp-4': !expanded && deviceType !== 'mobile' }
        ]">
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

    <!-- Images -->
    <div
      v-if="post.images?.length"
      :class="[
        'pb-3',
        deviceType === 'mobile' ? 'px-3' : 'px-4'
      ]"
      @click.stop
    >
      <ImageGrid
        :images="post.images"
        :alt-prefix="post.author_name + ' 的表白图片'"
      />
    </div>

    <!-- Footer -->
    <div :class="[
      'flex items-center justify-between border-t border-white/10',
      deviceType === 'mobile' ? 'px-3 py-2' : 'px-4 py-3'
    ]">
      <div class="flex items-center gap-4">
        <ShareButton
          :data="shareData"
          :show-text="deviceType !== 'mobile'"
          :size="deviceType === 'mobile' ? 'sm' : 'md'"
          mode="smart"
          @click.stop
        />
      </div>
      
      <div :class="[
        'text-gray-400',
        deviceType === 'mobile' ? 'text-xs' : 'text-sm'
      ]">
        {{ formatTimeAgo(post.created_at) }}
      </div>
    </div>

  </GlassCard>
</template>

<script setup lang="ts">
import {
  PinIcon,
  StarIcon,
  MoreVerticalIcon
} from 'lucide-vue-next'
import { onClickOutside } from '@vueuse/core'
import GlassCard from '~/components/ui/GlassCard.vue'
import TagBadge from '~/components/ui/TagBadge.vue'
import ShareButton from '~/components/ui/ShareButton.vue'
import ImageGrid from '~/components/ui/ImageGrid.vue'
import type { PostDto } from '~/types'
import type { ActiveTagDto } from '~/types/extra'

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
const { deviceType, isMobile } = useDevice()
const { confirm: confirmDialog } = useConfirm()
const { prompt: promptDialog } = usePrompt()

// State
const expanded = ref(false)
const showDropdown = ref(false)
const dropdownRef = ref<HTMLElement>()
const authorProfile = ref<any>(null)
const authorDeleted = ref(false)
const activeTag = ref<ActiveTagDto | null>(null)
const authorAvatar = ref<string | null>(null)
// 三态：true(确认有头像)、false(没有头像)、null(未知/加载中)
const authorHasAvatar = ref<boolean | null>(null)

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
        authorDeleted.value = !!userRes.isdeleted
        if (userRes.avatar_url) {
          authorAvatar.value = assetUrl(userRes.avatar_url)
          authorHasAvatar.value = true
        } else {
          authorHasAvatar.value = false
        }
      } catch (error) {
        console.warn('Failed to fetch user profile:', error)
        // 拉取失败时保持未知态，避免误显示默认头像
        authorHasAvatar.value = null
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

// Avatar load error handler
const handleAuthorAvatarError = () => {
  authorHasAvatar.value = false
  authorAvatar.value = null
}

// Computed
const canManage = computed(() => {
  return auth.isAuthenticated && (
    auth.isSuperadmin ||
    auth.hasAnyPerm(['MANAGE_FEATURED', 'MANAGE_POSTS']) ||
    auth.currentUser?.id === props.post.author_id
  )
})

const canManagePost = computed(() => {
  return auth.isSuperadmin || auth.hasAnyPerm(['MANAGE_FEATURED', 'MANAGE_POSTS'])
})

const isModerator = computed(() => auth.isSuperadmin || auth.hasPerm('MANAGE_POSTS'))

// 分享数据
const shareData = computed(() => {
  const origin = process.client ? window.location.origin : 'https://your-domain.com'
  return {
    title: `${props.post.author_name} 对 ${props.post.target_name} 的表白`,
    text: props.post.content.length > 100 ? 
      `${props.post.content.substring(0, 100)}...` : 
      props.post.content,
    url: `${origin}/posts/${props.post.id}`,
    image: props.post.images?.[0] ? assetUrl(props.post.images[0]) : undefined
  }
})

const goDetail = async () => {
  await navigateTo(`/posts/${props.post.id}`)
}

// Navigate to author profile
const navigateToAuthor = () => {
  if (authorDeleted.value) {
    toast.info('该用户已注销，无法访问主页')
    return
  }
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
    const reason = await promptModerationReason(pin ? '置顶' : '取消置顶')
    if (reason === null) return
    await api.pinPost(props.post.id, pin, reason || undefined)
    toast.success(pin ? '已置顶' : '已取消置顶')
    emit('refresh')
  } catch (error) {
    console.error('Pin post failed:', error)
  }
  showDropdown.value = false
}

const handleFeature = async (feature: boolean) => {
  try {
    const reason = await promptModerationReason(feature ? '设为精华' : '取消精华')
    if (reason === null) return
    await api.featurePost(props.post.id, feature, reason || undefined)
    toast.success(feature ? '已设为精华' : '已取消精华')
    emit('refresh')
  } catch (error) {
    console.error('Feature post failed:', error)
  }
  showDropdown.value = false
}

const handleHide = async () => {
  const hide = props.post.status === 0
  if (hide) {
    const confirmed = await confirmDialog('确定要隐藏这个帖子吗？')
    if (!confirmed) return
  }
  try {
    const reason = await promptModerationReason(hide ? '隐藏' : '恢复')
    if (reason === null) return
    await api.hidePost(props.post.id, hide, reason || undefined)
    toast.success(hide ? '已隐藏帖子' : '已恢复帖子')
    emit('refresh')
  } catch (error) {
    console.error('Hide/unhide post failed:', error)
  }
  showDropdown.value = false
}

const handleDelete = async () => {
  const confirmed = await confirmDialog({
    title: '删除帖子',
    message: '确定要删除这个帖子吗？此操作不可恢复！',
    confirmText: '删除',
    cancelText: '取消'
  })
  if (!confirmed) return
  
  try {
    const reason = await promptModerationReason('删除')
    if (reason === null) return
    await api.deletePost(props.post.id, reason || undefined)
    toast.success('已删除帖子')
    emit('refresh')
  } catch (error) {
    console.error('Delete post failed:', error)
  }
  showDropdown.value = false
}


const promptModerationReason = async (action: string): Promise<string | null> => {
  if (!process.client) return ''

  const input = await promptDialog({
    title: `${action}处理原因`,
    message: '可选,取消则中止操作',
    placeholder: '请输入处理原因(可选)',
    defaultValue: ''
  })

  if (input === null) return null
  return input.trim()
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

// Added: absolute date formatter used in header
const formatDate = (dateString: string) => {
  try {
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return String(dateString)
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  } catch {
    return String(dateString)
  }
}
</script>














