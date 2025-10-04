/**
 * 系统级分享功能组合函数
 * 优先使用各平台原生分享API，提供完整的系统级分享体验
 * 支持 iOS/iPadOS、Android、Windows、macOS 等平台
 */

export interface ShareData {
  title: string
  text: string
  url: string
  image?: string
  files?: File[]
}

import { useToast } from '#imports'

export const useShare = () => {
  const toast = useToast()

  let lastLoggedCapabilities: string | null = null

  // 详细的平台检测
  const platform = computed(() => {
    if (typeof navigator === 'undefined') return 'unknown'
    
    const userAgent = navigator.userAgent.toLowerCase()
    const platform = navigator.platform?.toLowerCase() || ''
    
    // iOS 设备检测（包括 iPad Pro 等新设备）
    if (/iphone|ipod/.test(userAgent)) {
      return 'ios'
    } else if (/ipad/.test(userAgent) || (platform.includes('mac') && 'ontouchend' in document)) {
      return 'ipados'
    }
    
    // Android 检测
    else if (/android/.test(userAgent)) {
      return 'android'
    }
    
    // Windows 检测
    else if (/windows/.test(userAgent) || platform.includes('win')) {
      return 'windows'
    }
    
    // macOS 检测
    else if (/macintosh|mac os x/.test(userAgent) || platform.includes('mac')) {
      return 'macos'
    }
    
    // Linux 检测
    else if (/linux/.test(userAgent) || platform.includes('linux')) {
      return 'linux'
    }
    
    return 'other'
  })

  // 浏览器检测
  const browser = computed(() => {
    if (typeof navigator === 'undefined') return 'unknown'
    
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (/edg/.test(userAgent)) {
      return 'edge'
    } else if (/chrome/.test(userAgent) && !/edg/.test(userAgent)) {
      return 'chrome'
    } else if (/safari/.test(userAgent) && !/chrome/.test(userAgent)) {
      return 'safari'
    } else if (/firefox/.test(userAgent)) {
      return 'firefox'
    }
    
    return 'other'
  })

  // 检测是否支持原生分享 API
  const canShare = computed(() => {
    if (typeof navigator === 'undefined' || typeof window === 'undefined') return false

    const nav = navigator as Navigator & {
      share?: (data?: ShareData) => Promise<void>
      canShare?: (data?: ShareData) => boolean
      userActivation?: { isActive: boolean }
    }

    const hasWebShareAPI = typeof nav.share === 'function'
    const hasCanShare = typeof nav.canShare === 'function'
    const isSecure =
      window.isSecureContext ||
      window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost'

    const debugPayload = {
      platform: platform.value,
      browser: browser.value,
      hasWebShareAPI,
      hasCanShare,
      isSecure,
      userAgent: navigator.userAgent,
      userActivation: nav.userActivation?.isActive ?? false
    }

    const payloadSignature = JSON.stringify(debugPayload)
    if (lastLoggedCapabilities !== payloadSignature) {
      console.log('[Share Debug] capability check', debugPayload)
      lastLoggedCapabilities = payloadSignature
    }

    if (!hasWebShareAPI) return false

    const isSupported =
      (platform.value === 'ios' || platform.value === 'ipados') ||
      (platform.value === 'android' && browser.value === 'chrome') ||
      (platform.value === 'windows' && (browser.value === 'chrome' || browser.value === 'edge')) ||
      (platform.value === 'macos' && browser.value === 'safari')

    if (!isSecure || !isSupported) {
      if (!isSecure) {
        console.warn('[Share Debug] Insecure context blocks Web Share API')
      }
      return false
    }

    if (hasCanShare) {
      try {
        const documentTitle = typeof document !== 'undefined' ? document.title : ''
        const probeData: ShareData = {
          title: documentTitle,
          text: '',
          url: window.location.href
        }
        const result = nav.canShare(probeData)
        if (!result) {
          console.warn('[Share Debug] navigator.canShare returned false for probe data', probeData)
        }
        return result
      } catch (error) {
        console.warn('[Share Debug] navigator.canShare check failed', error)
        return false
      }
    }

    return true
  })

  // 检测分享数据支持
  const canShareData = (data: ShareData) => {
    if (!canShare.value) return true

    const nav = navigator as Navigator & { canShare?: (data?: ShareData) => boolean }
    if (!nav.canShare) return true

    const shareData: ShareData = {
      title: data.title,
      text: data.text,
      url: data.url
    }

    if (data.files && data.files.length > 0) {
      shareData.files = data.files
    }

    try {
      const result = nav.canShare(shareData)
      if (!result) {
        console.warn('[Share Debug] navigator.canShare returned false for payload', shareData)
      }
      return result
    } catch (error) {
      console.warn('[Share Debug] navigator.canShare threw for payload', shareData, error)
      return false
    }
  }

  // 原生分享 - 支持文件和图片
  const nativeShare = async (data: ShareData) => {
    if (!canShare.value || !navigator.share) {
      throw new Error('Native share not supported')
    }

    try {
      const shareData: any = {
        title: data.title,
        text: data.text,
        url: data.url
      }

      // 如果有图片URL，尝试转换为文件进行分享（部分平台支持）
      if (data.image && canShareFiles()) {
        try {
          const imageFile = await urlToFile(data.image, 'image.jpg')
          if (imageFile) {
            shareData.files = [imageFile]
            // 移除URL，避免重复内容
            delete shareData.url
          }
        } catch (error) {
          console.warn('图片文件转换失败，使用URL分享:', error)
        }
      }

      // 如果有文件，直接添加
      if (data.files && data.files.length > 0) {
        shareData.files = data.files
      }

      // 检查分享数据是否被支持
      if (navigator.canShare && !navigator.canShare(shareData)) {
        // 如果不支持文件分享，降级为URL分享
        if (shareData.files) {
          delete shareData.files
          shareData.url = data.url
        }
        
        if (!navigator.canShare(shareData)) {
          throw new Error('Share data not supported')
        }
      }

      await navigator.share(shareData)
      return true
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // 用户取消分享
        return false
      }
      throw error
    }
  }

  // 检测是否支持文件分享
  const canShareFiles = () => {
    if (!navigator.canShare) return false
    
    try {
      // 创建一个测试文件
      const testFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      return navigator.canShare({ files: [testFile] })
    } catch {
      return false
    }
  }

  // URL转文件（用于图片分享）
  const urlToFile = async (url: string, filename: string): Promise<File | null> => {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch image')
      
      const blob = await response.blob()
      return new File([blob], filename, { type: blob.type })
    } catch (error) {
      console.error('URL to file conversion failed:', error)
      return null
    }
  }

  // 增强的平台特定分享处理
  const shareWithPlatformOptimization = async (data: ShareData) => {
    const currentPlatform = platform.value
    const currentBrowser = browser.value

    // iOS/iPadOS Safari - 完全支持 Web Share API
    if ((currentPlatform === 'ios' || currentPlatform === 'ipados') && currentBrowser === 'safari') {
      try {
        await nativeShare(data)
        toast.success('分享成功')
        return true
      } catch (error) {
        console.warn('iOS Safari 分享失败:', error)
      }
    }

    // Android Chrome - 支持 Web Share API
    else if (currentPlatform === 'android' && currentBrowser === 'chrome') {
      try {
        await nativeShare(data)
        toast.success('分享成功')
        return true
      } catch (error) {
        console.warn('Android Chrome 分享失败:', error)
      }
    }

    // Windows Edge & Chrome - 支持 Web Share API (Windows 10+)
    else if (currentPlatform === 'windows' && (currentBrowser === 'edge' || currentBrowser === 'chrome')) {
      try {
        await nativeShare(data)
        toast.success('分享成功')
        return true
      } catch (error) {
        console.warn('Windows 分享失败:', error)
      }
    }

    // macOS Safari - 支持 Web Share API (macOS 12.3+)
    else if (currentPlatform === 'macos' && currentBrowser === 'safari') {
      try {
        await nativeShare(data)
        toast.success('分享成功')
        return true
      } catch (error) {
        console.warn('macOS Safari 分享失败:', error)
      }
    }

    return false
  }

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
      } else {
        // 降级方案
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        textArea.remove()
      }
      return true
    } catch (error) {
      console.error('复制失败:', error)
      return false
    }
  }

  // 生成平台特定分享链接
  const getPlatformShareUrl = (data: ShareData, targetPlatform: string) => {
    const encodedTitle = encodeURIComponent(data.title)
    const encodedText = encodeURIComponent(data.text)
    const encodedUrl = encodeURIComponent(data.url)
    
    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      qq: `https://connect.qq.com/widget/shareqq/index.html?url=${encodedUrl}&title=${encodedTitle}&desc=${encodedText}`,
      weibo: `https://service.weibo.com/share/share.php?url=${encodedUrl}&title=${encodedText}`,
      wechat: `weixin://` // 微信分享需要特殊处理
    }
    
    return shareUrls[targetPlatform]
  }

  // 主分享函数
  const share = async (data: ShareData, options?: { 
    preferredMethod?: 'native' | 'copy' | 'platform'
    platformFallback?: string[]
  }) => {
    const { preferredMethod = 'native', platformFallback = [] } = options || {}

    let fallbackReason: 'native-unavailable' | 'native-failed' | null = null

    if (preferredMethod === 'native') {
      if (!canShare.value) {
        fallbackReason = 'native-unavailable'
        console.warn('[Share Debug] Native share unavailable, falling back', {
          platform: platform.value,
          browser: browser.value,
          isSecureContext: typeof window !== 'undefined' && window.isSecureContext
        })
      } else {
        try {
          const success = await nativeShare(data)
          if (success === false) {
            console.info('[Share Debug] Native share cancelled by user')
            return
          }
          toast.success('分享成功')
          return
        } catch (error) {
          fallbackReason = 'native-failed'
          console.warn('[Share Debug] Native share failed, attempting fallback', error)
        }
      }
    }

    if (preferredMethod === 'copy' || fallbackReason) {
      const shareText = `${data.title}
${data.text}
${data.url}`
      const copied = await copyToClipboard(shareText)
      if (copied) {
        toast.success(fallbackReason ? '系统分享不可用，链接已复制到剪贴板' : '链接已复制到剪贴板')
        return
      }
      console.warn('[Share Debug] Clipboard copy failed during fallback', { length: shareText.length })
    }

    if (platformFallback.length > 0) {
      const url = getPlatformShareUrl(data, platformFallback[0])
      if (url) {
        window.open(url, '_blank', 'width=600,height=400')
        return
      }
    }

    toast.error('分享失败，请手动复制链接')
  }

  const sharePost = async (post: any, options?: any) => {
    const baseUrl = window.location.origin
    const postUrl = `${baseUrl}/posts/${post.id}`
    const assetUrl = useAssetUrl()
    
    const shareData: ShareData = {
      title: `${post.author_name} 对 ${post.target_name} 的表白`,
      text: post.content.length > 100 ?
        `${post.content.substring(0, 100)}...` :
        post.content,
      url: postUrl,
      image: post.images?.[0] ? assetUrl(post.images[0]) : undefined
    }

    await share(shareData, options)
  }

  // 智能分享（根据平台自动选择最佳方式）
  const smartShare = async (data: ShareData) => {
    // 如果支持原生分享，优先使用原生分享
    if (canShare.value) {
      try {
        await share(data, { preferredMethod: 'native' })
        return
      } catch (error) {
        console.warn('原生分享失败，降级到复制链接:', error)
      }
    }

    // 如果原生分享失败，使用复制链接作为降级方案
    const platformFallbacks: Record<string, string[]> = {
      ios: ['telegram', 'twitter', 'facebook'],
      ipados: ['telegram', 'twitter', 'facebook'],
      android: ['telegram', 'whatsapp', 'twitter'],
      windows: ['twitter', 'facebook', 'linkedin'],
      macos: ['telegram', 'twitter', 'facebook'],
      linux: ['twitter', 'facebook', 'telegram'],
      other: ['twitter', 'facebook', 'telegram']
    }

    await share(data, {
      preferredMethod: 'copy',
      platformFallback: platformFallbacks[platform.value] || platformFallbacks.other
    })
  }

  // 获取平台分享能力信息
  const getShareCapabilities = () => {
    return {
      platform: platform.value,
      browser: browser.value,
      canShare: canShare.value,
      canShareFiles: canShareFiles(),
      hasWebShareAPI: typeof navigator !== 'undefined' && 'share' in navigator,
      hasCanShare:
        typeof navigator !== 'undefined' &&
        typeof (navigator as Navigator & { canShare?: unknown }).canShare === 'function',
      hasClipboardAPI: typeof navigator !== 'undefined' && 'clipboard' in navigator,
      isSecureContext: typeof window !== 'undefined' && window.isSecureContext
    }
  }

  return {
    canShare,
    canShareData,
    canShareFiles,
    platform,
    browser,
    share,
    nativeShare,
    sharePost,
    smartShare,
    shareWithPlatformOptimization,
    copyToClipboard,
    getPlatformShareUrl,
    getShareCapabilities,
    urlToFile
  }
}
