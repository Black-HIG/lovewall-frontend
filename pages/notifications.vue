<template>
  <div class="w-full space-y-6">
    <div class="page-header">
      <h1 class="page-title">系统通知</h1>
      <p class="text-gray-600 mt-2">审核结果和管理员操作通知</p>
    </div>

    <GlassCard class="p-4">
      <div class="flex justify-between items-center">
        <div class="text-sm text-gray-600">共 {{ data?.total || 0 }} 条</div>
        <GlassButton variant="secondary" :loading="loading" @click="refresh">刷新</GlassButton>
      </div>
    </GlassCard>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <LoadingSpinner size="lg" />
    </div>

    <div v-else-if="!items.length" class="text-center py-12">
      <GlassCard class="p-12">
        <h3 class="text-lg font-semibold text-gray-800 mb-2">暂无通知</h3>
        <p class="text-gray-600">稍后再来看看。</p>
      </GlassCard>
    </div>

    <div v-else class="space-y-3">
      <GlassCard
        v-for="n in items"
        :key="n.id"
        class="p-4 border transition-colors"
        :class="n.is_read ? 'border-white/10' : 'border-brand-300/50'"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-medium text-gray-800">{{ n.title }}</h3>
              <span v-if="!n.is_read" class="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">未读</span>
            </div>

            <p class="text-gray-700 whitespace-pre-wrap">
              <template v-for="(part, idx) in contentParts(n)" :key="idx">
                <template v-if="part.type === 'text'">{{ part.value }}</template>
                <template v-else>
                  <!-- 管理员审核通知的接受/拒绝按钮 -->
                  <template v-if="isAdminModerationNotification(n) && permissions.hasPostModerationPermission">
                    <div class="flex gap-2 mt-2">
                      <button
                        v-if="part.action === 'accept'"
                        class="px-3 py-1 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded transition-colors"
                        @click="handleModerationAction(n, 'approve')"
                      >
                        接受
                      </button>
                      <button
                        v-if="part.action === 'reject'"
                        class="px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors"
                        @click="handleModerationAction(n, 'reject')"
                      >
                        拒绝
                      </button>
                    </div>
                  </template>
                  <!-- 普通用户申请人工复核按钮 -->
                  <template v-else>
                    <button
                      v-if="part.postId"
                      class="text-brand-600 hover:underline"
                      @click="requestReview(part.postId)"
                    >申请人工复核</button>
                    <NuxtLink v-else-if="part.linkTo" :to="part.linkTo" class="text-brand-600 hover:underline">申请人工复核</NuxtLink>
                  </template>
                </template>
              </template>
            </p>

            <div class="text-xs text-gray-500 mt-1">{{ formatDate(n.created_at) }}</div>
          </div>
          <div class="flex-shrink-0">
            <GlassButton v-if="!n.is_read" @click="markRead(n)" size="sm" variant="secondary">标为已读</GlassButton>
          </div>
        </div>
      </GlassCard>

      <div v-if="data && data.page * data.page_size < data.total" class="text-center pt-2">
        <GlassButton variant="secondary" :loading="loadingMore" @click="loadMore">加载更多</GlassButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import GlassButton from '~/components/ui/GlassButton.vue'
import GlassCard from '~/components/ui/GlassCard.vue'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import type { Pagination } from '~/types'
import type { NotificationDto } from '~/types/extra'

definePageMeta({ middleware: ['auth'] })

const api = useApi()
const router = useRouter()
const toast = useToast()
const permissions = usePermissions()

const loading = ref(true)
const loadingMore = ref(false)
const items = ref<NotificationDto[]>([])
const data = ref<Pagination<NotificationDto> | null>(null)

const load = async (page = 1) => {
  if (page === 1) loading.value = true
  else loadingMore.value = true
  try {
    const res = await api.listNotifications({ page, page_size: 20 })
    if (page === 1) items.value = res.items
    else items.value.push(...res.items)
    data.value = res
  } catch (e) {
    toast.error('加载通知失败')
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const refresh = () => load(1)
const loadMore = () => { if (data.value) load(data.value.page + 1) }

const markRead = async (n: NotificationDto) => {
  try {
    await api.markNotificationRead(n.id)
    n.is_read = true
  } catch { toast.error('标记失败') }
}

const formatDate = (s: string) => new Date(s).toLocaleString('zh-CN')

// 解析通知内容，处理占位符
const contentParts = (n: NotificationDto) => {
  const parts: Array<{ type: 'text' | 'link'; value?: string; linkTo?: string; postId?: string; action?: 'accept' | 'reject' }> = []
  const raw = n.content || ''
  const meta = parseMeta(n)
  
  // 处理管理员审核通知中的 {{acceptLink}} 和 {{rejectLink}}
  if (isAdminModerationNotification(n)) {
    let content = raw
    const acceptPlaceholder = '___ACCEPT_PLACEHOLDER___'
    const rejectPlaceholder = '___REJECT_PLACEHOLDER___'
    
    content = content.replace(/\{\{acceptLink\}\}/g, acceptPlaceholder)
    content = content.replace(/\{\{rejectLink\}\}/g, rejectPlaceholder)
    
    const segments = content.split(new RegExp(`(${acceptPlaceholder}|${rejectPlaceholder})`))
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      if (segment === acceptPlaceholder) {
        parts.push({ type: 'link', action: 'accept', postId: meta?.post_id })
      } else if (segment === rejectPlaceholder) {
        parts.push({ type: 'link', action: 'reject', postId: meta?.post_id })
      } else if (segment) {
        parts.push({ type: 'text', value: segment })
      }
    }
  } else if (raw.includes('{{link}}')) {
    // 处理普通的 {{link}} 占位符
    const segs = raw.split('{{link}}')
    for (let i = 0; i < segs.length; i++) {
      if (segs[i]) {
        parts.push({ type: 'text', value: segs[i] })
      }
      if (i < segs.length - 1) {
        if (meta?.post_id) {
          parts.push({ type: 'link', postId: meta.post_id })
        } else {
          parts.push({ type: 'link', linkTo: '/notifications' })
        }
      }
    }
  } else {
    // 没有任何占位符的普通文本通知
    parts.push({ type: 'text', value: raw })
  }
  
  return parts
}

// 判断是否为管理员审核通知
const isAdminModerationNotification = (n: NotificationDto): boolean => {
  const content = n.content || ''
  return content.includes('{{acceptLink}}') && content.includes('{{rejectLink}}')
}

// 处理管理员审核操作
const handleModerationAction = async (notification: NotificationDto, action: 'approve' | 'reject') => {
  const meta = parseMeta(notification)
  const postId = meta?.post_id
  
  if (!postId) {
    toast.error('无法获取帖子信息')
    return
  }
  
  try {
    if (action === 'approve') {
      await api.adminApprovePost(postId)
      toast.success('已通过审核')
    } else {
      await api.adminRejectPost(postId)
      toast.success('已拒绝审核')
    }
    
    // 标记通知为已读
    if (!notification.is_read) {
      await markRead(notification)
    }
    
    // 刷新通知列表
    refresh()
  } catch (e: any) {
    toast.error(e?.message || '操作失败')
  }
}

const parseMeta = (n: NotificationDto): any => {
  try {
    return typeof n.metadata === 'string' ? JSON.parse(n.metadata) : (n.metadata as any)
  } catch { return null }
}

const requestReview = async (postId: string) => {
  try {
    await api.requestPostReview(postId)
    toast.success('已申请人工复核')
  } catch (e: any) {
    toast.error(e?.message || '申请失败')
  }
}

onMounted(() => load(1))

useHead({ title: '系统通知 - Love Wall' })
</script>


