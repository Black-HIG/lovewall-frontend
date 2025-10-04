<template>
  <div ref="shareButtonRef" class="relative">
    <!-- 主分享按钮 -->
    <button
      @click="handleMainShare"
      :disabled="loading"
      class="flex items-center gap-2 glass-button"
      :class="[
        variant === 'secondary' ? 'glass-button-secondary' : '',
        size === 'sm' ? 'text-sm px-3 py-1.5' : 'px-4 py-2'
      ]"
    >
      <LoaderIcon 
        v-if="loading"
        class="w-4 h-4 animate-spin"
      />
      <ShareIcon 
        v-else-if="canShare"
        class="w-4 h-4"
      />
      <ExternalLinkIcon 
        v-else
        class="w-4 h-4"
      />
      <span v-if="showText">{{ shareText }}</span>
    </button>

    <!-- 分享选项下拉菜单 -->
    <div 
      v-if="showOptions && isOptionsOpen"
      class="absolute top-full left-0 mt-2 w-48 bg-white/20 backdrop-blur-lg rounded-xl border border-white/20 shadow-glass p-2 z-50"
      @click.stop
    >
      <div class="space-y-1">
        <!-- 原生分享 -->
        <button
          v-if="canShare"
          @click="shareNative"
          class="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-white/20 transition-colors"
        >
          <ShareIcon class="w-4 h-4" />
          <span>系统分享</span>
        </button>

        <!-- 复制链接 -->
        <button
          @click="copyLink"
          class="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-white/20 transition-colors"
        >
          <CopyIcon class="w-4 h-4" />
          <span>复制链接</span>
        </button>

        <div class="border-t border-white/20 my-2"></div>

        <!-- 平台分享选项 -->
        <button
          v-for="platform in availablePlatforms"
          :key="platform.key"
          @click="shareToPlatform(platform.key)"
          class="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-white/20 transition-colors"
        >
          <component :is="getPlatformIcon(platform.key)" class="w-4 h-4" />
          <span>{{ platform.name }}</span>
        </button>
      </div>
    </div>

    <!-- 点击外部关闭菜单 -->
    <div 
      v-if="isOptionsOpen"
      class="fixed inset-0 z-40"
      @click="isOptionsOpen = false"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { 
  LoaderIcon, 
  ShareIcon, 
  ExternalLinkIcon,
  CopyIcon,
  SendIcon,
  MessageCircleIcon,
  TwitterIcon,
  FacebookIcon
} from 'lucide-vue-next'

interface Props {
  data: {
    title: string
    text: string
    url: string
    image?: string
  }
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  showOptions?: boolean
  mode?: 'smart' | 'native' | 'manual'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'ghost',
  size: 'md',
  showText: true,
  showOptions: false,
  mode: 'smart'
})

const { canShare, platform, share, smartShare, copyToClipboard, getPlatformShareUrl } = useShare()

const loading = ref(false)
const isOptionsOpen = ref(false)

const shareIcon = computed(() => {
  if (canShare.value) return 'lucide:share'
  return 'lucide:external-link'
})

const shareText = computed(() => {
  if (canShare.value) return '分享'
  return '分享'
})

// 获取平台图标组件
const getPlatformIcon = (platformKey: string) => {
  const iconMap: Record<string, any> = {
    twitter: TwitterIcon,
    facebook: FacebookIcon,
    telegram: SendIcon,
    whatsapp: MessageCircleIcon,
  }
  return iconMap[platformKey] || ShareIcon
}

// 可用的分享平台
const availablePlatforms = computed(() => {
  const platforms = [
    { key: 'twitter', name: 'Twitter' },
    { key: 'facebook', name: 'Facebook' },
    { key: 'telegram', name: 'Telegram' },
    { key: 'whatsapp', name: 'WhatsApp' },
  ]

  // 根据平台显示不同的选项
  if (platform.value === 'ios' || platform.value === 'android') {
    platforms.unshift({ key: 'telegram', name: 'Telegram' })
  }

  return platforms
})

// 主分享处理
const handleMainShare = async () => {
  if (props.showOptions) {
    isOptionsOpen.value = !isOptionsOpen.value
    return
  }

  loading.value = true
  try {
    if (props.mode === 'smart') {
      await smartShare(props.data)
    } else if (props.mode === 'native' && canShare.value) {
      // 强制使用原生分享，不降级
      await share(props.data, { preferredMethod: 'native' })
    } else {
      await share(props.data, { preferredMethod: 'copy' })
    }
  } catch (error) {
    console.error('分享失败:', error)
    // 如果原生分享失败，尝试复制链接作为降级
    if (props.mode === 'native' || props.mode === 'smart') {
      try {
        const shareText = `${props.data.title}\n${props.data.text}\n${props.data.url}`
        const copied = await copyToClipboard(shareText)
        if (copied) {
          useToast().success('系统分享不可用，链接已复制到剪贴板')
        }
      } catch {
        useToast().error('分享失败')
      }
    }
  } finally {
    loading.value = false
  }
}

// 原生分享
const shareNative = async () => {
  loading.value = true
  try {
    await share(props.data, { preferredMethod: 'native' })
  } finally {
    loading.value = false
    isOptionsOpen.value = false
  }
}

// 复制链接
const copyLink = async () => {
  const success = await copyToClipboard(props.data.url)
  if (success) {
    useToast().success('链接已复制')
  } else {
    useToast().error('复制失败')
  }
  isOptionsOpen.value = false
}

// 分享到特定平台
const shareToPlatform = (platformKey: string) => {
  const url = getPlatformShareUrl(props.data, platformKey)
  if (url) {
    window.open(url, '_blank', 'width=600,height=400')
  }
  isOptionsOpen.value = false
}

// 组件引用
const shareButtonRef = ref<HTMLElement>()

// 点击外部关闭
onClickOutside(shareButtonRef, () => {
  isOptionsOpen.value = false
})
</script>