<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">我的标签</h1>
      <p class="text-gray-600 mt-2">管理你拥有的标签和当前显示标签</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <GlassCard class="p-6 text-center">
        <div class="text-2xl font-bold text-purple-600 mb-1">{{ userTags.length }}</div>
        <div class="text-sm text-gray-600">拥有标签数</div>
      </GlassCard>
      
      <GlassCard class="p-6 text-center">
        <div class="flex items-center justify-center gap-2">
          <div class="text-lg font-semibold text-gray-700">当前标签:</div>
          <TagBadge
            v-if="activeTag"
            :title="activeTag.tag?.title || ''"
            :background="activeTag.tag?.background_color || '#6b7280'"
            :text="activeTag.tag?.text_color || '#ffffff'"
          />
          <span v-else class="text-gray-500">未设置</span>
        </div>
      </GlassCard>
    </div>

    <!-- Redeem Section -->
    <GlassCard class="p-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-gray-800">兑换新标签</h2>
          <p class="text-sm text-gray-600 mt-1">输入兑换码获取新的专属标签</p>
        </div>
        
        <div class="flex items-center gap-3 glass-button-secondary">
          <GlassButton
              @click="openRedeemModal"
              class="px-6 py-3"
              style="display:inline-flex;align-items:center;white-space:nowrap;"
          >
            <TagIcon class="w-5 h-5 mr-2" style="flex:0 0 auto;margin-right:0.5rem;" />
            <span style="display:inline-block;">兑换标签</span>
          </GlassButton>
        </div>
      </div>
      <!-- Redeem History (if any) -->
      <div v-if="recentlyRedeemed.length" class="mt-6 pt-4 border-t border-white/20">
        <h3 class="text-sm font-medium text-gray-700 mb-3">最近兑换的标签</h3>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="tag in recentlyRedeemed"
            :key="tag.user_tag_id"
            class="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg border border-white/10"
          >
            <TagBadge
              :title="tag.tag?.title || ''"
              :background="tag.tag?.background_color || '#6b7280'"
              :text="tag.tag?.text_color || '#ffffff'"
            />
            <span class="text-xs text-gray-500">
              {{ formatDate(tag.obtained_at) }}
            </span>
          </div>
        </div>
      </div>
    </GlassCard>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <LoadingSpinner size="lg" />
    </div>

    <!-- Empty State -->
    <div v-else-if="!userTags.length" class="text-center py-12">
      <GlassCard class="p-12">
        <div class="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <TagIcon class="w-8 h-8 text-white" />
        </div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">还没有任何标签</h3>
        <p class="text-gray-600 mb-6">通过兑换码获取你的第一个专属标签吧！</p>
      </GlassCard>
    </div>

    <!-- Tags List -->
    <div v-else class="space-y-4">
      <div class="border-b border-white/20 pb-2 mb-4">
        <h2 class="text-lg font-semibold text-gray-800">我的标签列表</h2>
      </div>

      <div class="grid gap-4">
        <div
          v-for="userTag in userTags"
          :key="userTag.user_tag_id"
          class="group"
        >
          <GlassCard class="p-6 hover:shadow-glow-lg transition-all">
            <div class="flex items-center justify-between">
              <!-- Tag Info -->
              <div class="flex items-center gap-4">
                <TagBadge
                  :title="userTag.tag?.title || ''"
                  :background="userTag.tag?.background_color || '#6b7280'"
                  :text="userTag.tag?.text_color || '#ffffff'"
                />
                
                <div>
                  <h3 class="font-semibold text-gray-800">
                    {{ userTag.tag?.title || `标签-${userTag.tag?.id?.slice(0, 8)}` }}
                  </h3>
                  <div class="text-sm text-gray-600 space-y-1">
                    <p>获得时间: {{ formatDate(userTag.obtained_at) }}</p>
                    <div class="flex items-center gap-2">
                      <span class="flex items-center gap-1">
                        <div
                          class="w-3 h-3 rounded-full"
                          :class="userTag.is_active ? 'bg-green-500' : 'bg-gray-400'"
                        />
                        {{ userTag.is_active ? '当前使用' : '未使用' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex gap-2">
                <GlassButton
                  v-if="!userTag.is_active"
                  @click="activateTag(userTag)"
                  :loading="activating === userTag.user_tag_id"
                  class="text-sm px-4 py-2 glass-button-secondary"
                >
                  设为当前标签
                </GlassButton>
                
                <div v-else class="flex items-center gap-2">
                  <div class="flex items-center gap-2 px-4 py-2 bg-green-100/50 text-green-800 rounded-lg text-sm">
                    <CheckCircleIcon class="w-4 h-4" />
                    当前使用中
                  </div>
                  <!-- <GlassButton
                    @click="deactivateTag(userTag)"
                    :loading="deactivating === userTag.user_tag_id"
                    class="text-sm px-3 py-2 glass-button-secondary"
                    title="取消激活，回到无标签状态"
                  >
                    取消
                  </GlassButton> -->
                </div>
              </div>
            </div>

            <!-- Tag Description (if available) -->
            <div v-if="getTagDescription(userTag)" class="mt-4 pt-4 border-t border-white/10">
              <p class="text-sm text-gray-600">{{ getTagDescription(userTag) }}</p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>

    <!-- Redeem Modal -->
    <GlassModal
      :is-open="redeemModal.show"
      title="兑换标签"
      max-width="max-w-md"
      @close="closeRedeemModal"
    >
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <TagIcon class="w-8 h-8 text-white" />
        </div>
        <p class="text-gray-600">输入兑换码获取专属标签</p>
      </div>
      
      <form @submit.prevent="redeemCode" class="space-y-6">
        <div>
          <label for="redeemCode" class="block text-sm font-medium text-gray-700 mb-2">兑换码 *</label>
          <input
            id="redeemCode"
            v-model="redeemForm.code"
            type="text"
            placeholder="请输入兑换码"
            class="glass-input w-full py-3 text-sm font-mono text-center tracking-wider"
            required
          />
          <div v-if="redeemErrors.code" class="mt-1 text-sm text-red-500">
            {{ redeemErrors.code }}
          </div>
          <p class="text-xs text-gray-500 mt-1 text-center">
            格式: XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX
          </p>
        </div>

      </form>

      <template #footer>
        <div class="flex gap-3 justify-end">
          <GlassButton
            @click="closeRedeemModal"
            class="glass-button-secondary"
          >
            取消
          </GlassButton>
          <GlassButton
            @click="redeemCode"
            :loading="redeeming"
            :disabled="!isValidRedeemCode"
            class="glass-button-secondary"
          >
            {{ redeeming ? '兑换中...' : '立即兑换' }}
          </GlassButton>
        </div>
      </template>
    </GlassModal>

    <!-- Success Modal -->
    <GlassModal
      :is-open="redeemSuccess.show"
      title="兑换成功！"
      max-width="max-w-md"
      @close="closeSuccessModal"
    >
      <div class="text-center">
        <div class="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircleIcon class="w-8 h-8 text-white" />
        </div>
        
        <p class="text-gray-600 mb-4">恭喜你获得了新标签并已自动激活：</p>
        
        <div v-if="redeemSuccess.tag" class="mb-6">
          <TagBadge
            :title="redeemSuccess.tag.tag?.title || ''"
            :background="redeemSuccess.tag.tag?.background_color || '#6b7280'"
            :text="redeemSuccess.tag.tag?.text_color || '#ffffff'"
            class="text-lg px-4 py-2"
          />
        </div>
        
        <p class="text-sm text-gray-500">
          新标签已自动设为当前标签，你可以在帖子和评论中看到它的显示效果。
        </p>
      </div>

      <template #footer>
        <div class="flex gap-3 justify-end">
          <GlassButton
            @click="closeSuccessModal"
            class="w-full"
          >
            好的
          </GlassButton>
        </div>
      </template>
    </GlassModal>
  </div>
</template>

<script setup lang="ts">
import { TagIcon, CheckCircleIcon } from 'lucide-vue-next'
import GlassModal from '~/components/ui/GlassModal.vue'
import TagBadge from '~/components/ui/TagBadge.vue'
import type { UserTagDto, RedeemForm, RedeemResponse } from '~/types'

definePageMeta({
  middleware: 'auth'
})

// Stores
const auth = useAuthStore()
const toast = useToast()

// State
const userTags = ref<UserTagDto[]>([])
const loading = ref(true)
const redeeming = ref(false)
const activating = ref<string | null>(null)
const deactivating = ref<string | null>(null)

const redeemForm = reactive<RedeemForm>({
  code: ''
})
const redeemErrors = ref<Partial<RedeemForm>>({})

const redeemModal = reactive({
  show: false
})

const redeemSuccess = reactive({
  show: false,
  tag: null as UserTagDto | null
})

// Computed
const activeTag = computed(() => {
  return userTags.value.find(tag => tag.is_active) || null
})

const recentlyRedeemed = computed(() => {
  return userTags.value
    .filter(tag => {
      const obtainedAt = new Date(tag.obtained_at)
      const now = new Date()
      const diffHours = (now.getTime() - obtainedAt.getTime()) / (1000 * 60 * 60)
      return diffHours <= 24 // Show tags obtained in last 24 hours
    })
    .sort((a, b) => new Date(b.obtained_at).getTime() - new Date(a.obtained_at).getTime())
    .slice(0, 3)
})

const isValidRedeemCode = computed(() => {
  const cleanCode = redeemForm.code.replace(/-/g, '')
  return cleanCode.length === 32 // Total length without dashes (8 groups * 4 characters)
})

// Methods
const openRedeemModal = () => {
  redeemModal.show = true
  redeemForm.code = ''
  redeemErrors.value = {}
}

const closeRedeemModal = () => {
  redeemModal.show = false
  redeemForm.code = ''
  redeemErrors.value = {}
}

const formatRedeemCode = () => {
  // Remove all non-alphanumeric characters and convert to uppercase
  let code = redeemForm.code.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
  
  // Limit to 32 characters (8 groups * 4 characters)
  code = code.slice(0, 32)
  
  // Format with dashes: XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX
  let formatted = ''
  for (let i = 0; i < code.length; i++) {
    if (i > 0 && i % 4 === 0) {
      formatted += '-'
    }
    formatted += code[i]
  }
  
  redeemForm.code = formatted
}

// Watch for code input changes and format automatically
watch(() => redeemForm.code, (newValue) => {
  if (newValue && typeof newValue === 'string') {
    // Only format if not already properly formatted
    const cleanCode = newValue.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
    if (cleanCode.length > 0) {
      // Format the clean code into 8 groups of 4 characters
      let formatted = ''
      for (let i = 0; i < Math.min(cleanCode.length, 32); i++) {
        if (i > 0 && i % 4 === 0) {
          formatted += '-'
        }
        formatted += cleanCode[i]
      }
      
      // Only update if the formatted version is different from current value
      if (formatted !== newValue) {
        nextTick(() => {
          redeemForm.code = formatted
        })
      }
    }
  }
})

const loadUserTags = async () => {
  loading.value = true
  try {
    const api = useApi()
    const response = await api.getMyTags(true) // 传入 all=true 获取所有标签
    userTags.value = response.items // 取出 items 数组
  } catch (error: any) {
    console.error('Load tags error:', error)
    toast.error('加载标签列表失败')
  } finally {
    loading.value = false
  }
}

const redeemCode = async () => {
  redeemErrors.value = {}
  
  if (!redeemForm.code.trim()) {
    redeemErrors.value.code = '请输入兑换码'
    return
  }
  
  // Basic format validation - 8 groups of 4 characters each
  const codePattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/
  if (!codePattern.test(redeemForm.code.toUpperCase())) {
    redeemErrors.value.code = '兑换码格式不正确'
    return
  }
  
  redeeming.value = true
  try {
    const api = useApi()
    const result: RedeemResponse = await api.redeem({ code: redeemForm.code.toUpperCase() })
    
    // Merge into list (update if exists, else add)
    const newUserTag = result.user_tag
    const existingIdx = userTags.value.findIndex(t => t.user_tag_id === newUserTag.user_tag_id)
    if (existingIdx >= 0) {
      userTags.value[existingIdx] = newUserTag
    } else {
      userTags.value.push(newUserTag)
    }
    // Auto-activate new tag locally; deactivate others
    userTags.value.forEach(t => { t.is_active = (t.user_tag_id === newUserTag.user_tag_id) })
    
    // Close redeem modal
    closeRedeemModal()
    
    // Show success modal
    redeemSuccess.tag = result.user_tag
    redeemSuccess.show = true
    
    toast.success('兑换成功！新标签已自动设为当前标签')
  } catch (error: any) {
    redeemErrors.value.code = error.message || '兑换失败'
  } finally {
    redeeming.value = false
  }
}

const activateTag = async (userTag: UserTagDto) => {
  activating.value = userTag.user_tag_id
  try {
    const api = useApi()
    await api.activateTag(userTag.tag?.id || '')
    
    // Update local state
    userTags.value.forEach(tag => {
      tag.is_active = tag.user_tag_id === userTag.user_tag_id
    })
    
    toast.success(`已设置 "${userTag.tag?.title}" 为当前标签`)
  } catch (error: any) {
    console.error('Activate tag failed:', error)
    toast.error('设置标签失败')
  } finally {
    activating.value = null
  }
}

const deactivateTag = async (userTag: UserTagDto) => {
  deactivating.value = userTag.user_tag_id
  try {
    const api = useApi()
    await api.deactivateTag(userTag.tag?.id || '')
    
    // Update local state - set all tags to inactive
    userTags.value.forEach(tag => {
      tag.is_active = false
    })
    
    toast.success('已取消当前标签，现在没有激活的标签')
  } catch (error: any) {
    toast.error('取消标签失败')
  } finally {
    deactivating.value = null
  }
}

const closeSuccessModal = () => {
  redeemSuccess.show = false
  redeemSuccess.tag = null
}

const showAllTags = async () => {
  try {
    const api = useApi()
    const allTags = await api.listTags({ active: true })
    
    // 跳转到标签浏览页面或显示模态框
    // 这里我们简单地显示一个提示，你可以根据需求实现标签浏览功能
    toast.info(`当前共有 ${allTags.items.length} 个可用标签，可以通过兑换码获取`)
  } catch (error: any) {
    toast.error('获取标签信息失败')
  }
}

const getTagDescription = (userTag: UserTagDto) => {
  // Since the API doesn't return tag description in userTag, we'll skip it for now
  return null
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// Initialize
onMounted(() => {
  loadUserTags()
})

// SEO
useHead({
  title: '我的标签 - Love Wall',
  meta: [
    { name: 'description', content: '管理你拥有的标签和当前显示标签' }
  ]
})
</script>
