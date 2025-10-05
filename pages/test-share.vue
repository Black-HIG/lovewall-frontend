<template>
  <div class="min-h-screen py-8">
    <div class="max-w-4xl mx-auto px-4">
      <GlassCard class="p-8">
        <h1 class="text-3xl font-bold text-center mb-8">系统级分享测试</h1>
        
        <!-- 平台信息 -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold mb-4">检测到的平台信息</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-white/10 rounded-lg p-4">
              <div class="text-sm text-gray-600 mb-1">操作系统</div>
              <div class="font-medium">{{ capabilities.platform }}</div>
            </div>
            <div class="bg-white/10 rounded-lg p-4">
              <div class="text-sm text-gray-600 mb-1">浏览器</div>
              <div class="font-medium">{{ capabilities.browser }}</div>
            </div>
            <div class="bg-white/10 rounded-lg p-4">
              <div class="text-sm text-gray-600 mb-1">原生分享支持</div>
              <div class="font-medium" :class="capabilities.canShare ? 'text-green-600' : 'text-red-600'">
                {{ capabilities.canShare ? '✅ 支持' : '❌ 不支持' }}
              </div>
            </div>
            <div class="bg-white/10 rounded-lg p-4">
              <div class="text-sm text-gray-600 mb-1">文件分享支持</div>
              <div class="font-medium" :class="capabilities.canShareFiles ? 'text-green-600' : 'text-red-600'">
                {{ capabilities.canShareFiles ? '✅ 支持' : '❌ 不支持' }}
              </div>
            </div>
            <div class="bg-white/10 rounded-lg p-4">
              <div class="text-sm text-gray-600 mb-1">Web Share API</div>
              <div class="font-medium" :class="capabilities.hasWebShareAPI ? 'text-green-600' : 'text-red-600'">
                {{ capabilities.hasWebShareAPI ? '✅ 可用' : '❌ 不可用' }}
              </div>
            </div>
            <div class="bg-white/10 rounded-lg p-4">
              <div class="text-sm text-gray-600 mb-1">剪贴板 API</div>
              <div class="font-medium" :class="capabilities.hasClipboardAPI ? 'text-green-600' : 'text-red-600'">
                {{ capabilities.hasClipboardAPI ? '✅ 可用' : '❌ 不可用' }}
              </div>
            </div>
          </div>
        </div>

        <!-- 分享测试区域 -->
        <div class="space-y-6">
          <h2 class="text-xl font-semibold">分享测试</h2>
          
          <!-- 测试数据配置 -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1">标题</label>
              <GlassInput v-model="testData.title" placeholder="测试分享标题" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">内容</label>
              <GlassTextarea v-model="testData.text" placeholder="这是一个测试分享的内容..." rows="3" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">链接</label>
              <GlassInput v-model="testData.url" placeholder="https://example.com" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">图片URL（可选）</label>
              <GlassInput v-model="testData.image" placeholder="https://example.com/image.jpg" />
            </div>
          </div>

          <!-- 分享按钮组 -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium">分享方式测试</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <!-- 智能分享 -->
              <GlassButton
                @click="testSmartShare"
                :disabled="shareLoading"
                class="flex items-center justify-center gap-2"
              >
                <ShareIcon class="w-4 h-4" />
                智能分享
              </GlassButton>

              <!-- 原生分享 -->
              <GlassButton
                @click="testNativeShare"
                :disabled="shareLoading || !capabilities.canShare"
                variant="secondary"
                class="flex items-center justify-center gap-2"
              >
                <SmartphoneIcon class="w-4 h-4" />
                原生分享
              </GlassButton>

              <!-- 复制链接 -->
              <GlassButton
                @click="testCopyShare"
                :disabled="shareLoading"
                variant="outline"
                class="flex items-center justify-center gap-2"
              >
                <CopyIcon class="w-4 h-4" />
                复制链接
              </GlassButton>

              <!-- 平台优化分享 -->
              <GlassButton
                @click="testPlatformShare"
                :disabled="shareLoading"
                variant="secondary"
                class="flex items-center justify-center gap-2"
              >
                <SettingsIcon class="w-4 h-4" />
                平台优化
              </GlassButton>

              <!-- Twitter 分享 -->
              <GlassButton
                @click="() => testPlatformSpecific('twitter')"
                :disabled="shareLoading"
                variant="outline"
                class="flex items-center justify-center gap-2"
              >
                <TwitterIcon class="w-4 h-4" />
                Twitter
              </GlassButton>

              <!-- Facebook 分享 -->
              <GlassButton
                @click="() => testPlatformSpecific('facebook')"
                :disabled="shareLoading"
                variant="outline"
                class="flex items-center justify-center gap-2"
              >
                <FacebookIcon class="w-4 h-4" />
                Facebook
              </GlassButton>
            </div>
          </div>

          <!-- 分享结果日志 -->
          <div v-if="shareResults.length > 0" class="mt-8">
            <h3 class="text-lg font-medium mb-4">分享测试结果</h3>
            <div class="space-y-2 max-h-60 overflow-y-auto">
              <div
                v-for="(result, index) in shareResults"
                :key="index"
                class="flex items-start gap-3 p-3 bg-white/5 rounded-lg text-sm"
              >
                <div 
                  class="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                  :class="result.success ? 'bg-green-500' : 'bg-red-500'"
                ></div>
                <div class="flex-1">
                  <div class="font-medium">{{ result.method }}</div>
                  <div class="text-gray-600 text-xs">{{ result.timestamp }}</div>
                  <div class="mt-1">{{ result.message }}</div>
                  <div v-if="result.error" class="text-red-400 text-xs mt-1">
                    错误: {{ result.error }}
                  </div>
                </div>
              </div>
            </div>
            <GlassButton
              @click="clearResults"
              variant="outline"
              size="sm"
              class="mt-4"
            >
              清空日志
            </GlassButton>
          </div>
        </div>
      </GlassCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  ShareIcon, 
  SmartphoneIcon, 
  CopyIcon, 
  SettingsIcon, 
  TwitterIcon, 
  FacebookIcon 
} from 'lucide-vue-next'

// 设置页面元信息
definePageMeta({
  title: '系统级分享测试',
  description: '测试各平台的系统级分享功能'
})

const { 
  smartShare, 
  nativeShare, 
  shareWithPlatformOptimization,
  copyToClipboard,
  getPlatformShareUrl,
  getShareCapabilities 
} = useShare()

// 获取平台能力信息
const capabilities = ref(getShareCapabilities())

// 测试数据
const testData = ref({
  title: '郑州四中表白墙 - 表白墙',
  text: '这是一个温暖的表白墙，记录每一个美好的告白时刻。快来看看这个表白吧！',
  url: window.location.origin + '/posts/test',
  image: ''
})

// 分享状态
const shareLoading = ref(false)
const shareResults = ref<Array<{
  method: string
  success: boolean
  message: string
  timestamp: string
  error?: string
}>>([])

// 添加分享结果
const addResult = (method: string, success: boolean, message: string, error?: string) => {
  shareResults.value.unshift({
    method,
    success,
    message,
    timestamp: new Date().toLocaleTimeString(),
    error
  })
  
  // 最多保留10条记录
  if (shareResults.value.length > 10) {
    shareResults.value = shareResults.value.slice(0, 10)
  }
}

// 测试智能分享
const testSmartShare = async () => {
  shareLoading.value = true
  try {
    await smartShare(testData.value)
    addResult('智能分享', true, '智能分享执行完成')
  } catch (error: any) {
    addResult('智能分享', false, '智能分享失败', error.message)
  } finally {
    shareLoading.value = false
  }
}

// 测试原生分享
const testNativeShare = async () => {
  shareLoading.value = true
  try {
    const success = await nativeShare(testData.value)
    addResult('原生分享', success, success ? '原生分享成功' : '用户取消分享')
  } catch (error: any) {
    addResult('原生分享', false, '原生分享失败', error.message)
  } finally {
    shareLoading.value = false
  }
}

// 测试复制分享
const testCopyShare = async () => {
  shareLoading.value = true
  try {
    const shareText = `${testData.value.title}\n${testData.value.text}\n${testData.value.url}`
    const success = await copyToClipboard(shareText)
    addResult('复制链接', success, success ? '链接已复制到剪贴板' : '复制失败')
  } catch (error: any) {
    addResult('复制链接', false, '复制失败', error.message)
  } finally {
    shareLoading.value = false
  }
}

// 测试平台优化分享
const testPlatformShare = async () => {
  shareLoading.value = true
  try {
    const success = await shareWithPlatformOptimization(testData.value)
    addResult('平台优化分享', success, success ? '平台优化分享成功' : '平台优化分享失败')
  } catch (error: any) {
    addResult('平台优化分享', false, '平台优化分享失败', error.message)
  } finally {
    shareLoading.value = false
  }
}

// 测试特定平台分享
const testPlatformSpecific = (platform: string) => {
  shareLoading.value = true
  try {
    const url = getPlatformShareUrl(testData.value, platform)
    if (url) {
      window.open(url, '_blank', 'width=600,height=400')
      addResult(`${platform} 分享`, true, `${platform} 分享窗口已打开`)
    } else {
      addResult(`${platform} 分享`, false, `${platform} 分享链接生成失败`)
    }
  } catch (error: any) {
    addResult(`${platform} 分享`, false, `${platform} 分享失败`, error.message)
  } finally {
    shareLoading.value = false
  }
}

// 清空结果
const clearResults = () => {
  shareResults.value = []
}

// 定期更新能力信息
onMounted(() => {
  const updateCapabilities = () => {
    capabilities.value = getShareCapabilities()
  }
  
  // 每5秒更新一次能力信息
  const interval = setInterval(updateCapabilities, 5000)
  
  onUnmounted(() => {
    clearInterval(interval)
  })
})
</script>