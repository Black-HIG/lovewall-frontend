/**
 * 设备检测组合函数
 * 检测设备类型、屏幕尺寸、触摸支持等
 */

export const useDevice = () => {
  // 简化的窗口尺寸检测，避免 SSR 问题
  const windowWidth = ref(1920)
  const windowHeight = ref(1080)
  
  // 仅在客户端更新窗口尺寸
  if (process.client) {
    windowWidth.value = window.innerWidth
    windowHeight.value = window.innerHeight
    
    // 监听窗口大小变化
    const updateSize = () => {
      windowWidth.value = window.innerWidth
      windowHeight.value = window.innerHeight
    }
    
    window.addEventListener('resize', updateSize)
    
    // 组件卸载时清理事件监听器
    onUnmounted(() => {
      window.removeEventListener('resize', updateSize)
    })
  }

  // 设备类型检测
  const deviceType = computed(() => {
    const width = windowWidth.value
    
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  })

  // 断点检测
  const breakpoints = computed(() => {
    const width = windowWidth.value
    
    return {
      xs: width >= 475,
      sm: width >= 640,
      md: width >= 768,
      lg: width >= 1024,
      xl: width >= 1280,
      '2xl': width >= 1536,
    }
  })

  // 移动端检测
  const isMobile = computed(() => deviceType.value === 'mobile')
  const isTablet = computed(() => deviceType.value === 'tablet')
  const isDesktop = computed(() => deviceType.value === 'desktop')

  // 触摸设备检测
  const isTouchDevice = computed(() => {
    if (typeof window === 'undefined') return false
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  })

  // 操作系统检测
  const platform = computed(() => {
    if (typeof navigator === 'undefined') return 'unknown'
    
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
      return 'ios'
    } else if (/android/.test(userAgent)) {
      return 'android'
    } else if (/windows/.test(userAgent)) {
      return 'windows'
    } else if (/macintosh|mac os x/.test(userAgent)) {
      return 'macos'
    } else if (/linux/.test(userAgent)) {
      return 'linux'
    }
    
    return 'other'
  })

  // 浏览器检测
  const browser = computed(() => {
    if (typeof navigator === 'undefined') return 'unknown'
    
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (/chrome/.test(userAgent) && !/edge/.test(userAgent)) {
      return 'chrome'
    } else if (/safari/.test(userAgent) && !/chrome/.test(userAgent)) {
      return 'safari'
    } else if (/firefox/.test(userAgent)) {
      return 'firefox'
    } else if (/edge/.test(userAgent)) {
      return 'edge'
    }
    
    return 'other'
  })

  // 网络状态检测
  const networkStatus = computed(() => {
    if (typeof navigator === 'undefined' || !('connection' in navigator)) {
      return { effectiveType: '4g', downlink: 10, rtt: 100 }
    }
    
    const connection = (navigator as any).connection
    return {
      effectiveType: connection.effectiveType || '4g',
      downlink: connection.downlink || 10,
      rtt: connection.rtt || 100,
    }
  })

  // 深色模式检测
  const prefersDark = computed(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // 减少动画检测
  const prefersReducedMotion = computed(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  // 响应式布局类型
  const layoutType = computed(() => {
    if (isMobile.value) return 'list'
    if (isTablet.value) return 'grid-2'
    return 'grid-3'
  })

  // 响应式列数
  const gridColumns = computed(() => {
    if (isMobile.value) return 1
    if (isTablet.value) return 2
    if (windowWidth.value < 1400) return 3
    return 4
  })

  // 响应式间距
  const spacing = computed(() => {
    if (isMobile.value) return 'compact'
    if (isTablet.value) return 'normal'
    return 'spacious'
  })

  return {
    // 基础信息
    windowWidth: readonly(windowWidth),
    windowHeight: readonly(windowHeight),
    deviceType,
    platform,
    browser,
    
    // 设备类型
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    
    // 断点
    breakpoints,
    
    // 偏好设置
    prefersDark,
    prefersReducedMotion,
    
    // 网络状态
    networkStatus,
    
    // 布局相关
    layoutType,
    gridColumns,
    spacing,
  }
}