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

            <div
              class="text-gray-700 leading-relaxed space-y-2 notification-html"
              :ref="el => registerNotificationContainer(n.id, el)"
              v-html="processedContent[n.id] || fallbackNotificationContent(n)"
            />

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
import { nextTick } from 'vue'
import GlassButton from '~/components/ui/GlassButton.vue'
import GlassCard from '~/components/ui/GlassCard.vue'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import type { Pagination } from '~/types'
import type { NotificationDto } from '~/types/extra'

definePageMeta({ middleware: ['auth'] })

const api = useApi()
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
    if (page === 1) {
      items.value = res.items
      notificationContainers.clear()
    } else {
      items.value.push(...res.items)
    }
    data.value = res
    await rebuildNotificationContent()
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

const nuxtApp = useNuxtApp()
const processedContent = ref<Record<string, string>>({})
const notificationContainers = new Map<string, HTMLElement>()

const DEFAULT_ACTION_LABELS: Record<string, string> = {
  'view-post': '查看帖子',
  appeal: '去申诉',
  'request-review': '申请人工复核',
  'admin-accept': '接受',
  'admin-reject': '拒绝'
}

const registerNotificationContainer = (id: string, el: HTMLElement | null) => {
  if (!process.client) return
  if (el) {
    notificationContainers.set(id, el)
    const notification = items.value.find(item => item.id === id)
    if (notification) {
      attachHandlers(notification)
    }
  } else {
    notificationContainers.delete(id)
  }
}

const rebuildNotificationContent = async () => {
  const dompurify = nuxtApp.$dompurify
  const map: Record<string, string> = {}
  if (process.client && dompurify) {
    for (const notification of items.value) {
      map[notification.id] = transformNotificationContent(notification, dompurify)
    }
  } else {
    for (const notification of items.value) {
      map[notification.id] = fallbackNotificationContent(notification)
    }
  }
  processedContent.value = map

  if (process.client) {
    await nextTick()
    items.value.forEach(attachHandlers)
  }
}

const fallbackNotificationContent = (notification: NotificationDto) => {
  const safe = escapeHtml(notification.content || '')
  return safe.replace(/\n/g, '<br>')
}

const escapeHtml = (value: string) => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const transformNotificationContent = (notification: NotificationDto, dompurify: any): string => {
  if (!process.client) return fallbackNotificationContent(notification)

  const parser = new DOMParser()
  const doc = parser.parseFromString(notification.content || '', 'text/html')
  const root = doc.body
  const meta = parseMeta(notification)

  const applyLinkPlaceholder = (token: string, url?: string) => {
    const placeholder = `{{${token}}}`
    const anchors = Array.from(root.querySelectorAll(`[href*="${placeholder}"]`))
    anchors.forEach((anchor) => {
      const el = anchor as HTMLAnchorElement
      if (url) {
        const safe = sanitizeUrl(url)
        if (safe) {
          el.setAttribute('href', safe)
          if (/^https?:/i.test(safe) && !safe.startsWith(window.location.origin)) {
            el.setAttribute('target', '_blank')
            el.setAttribute('rel', 'noopener')
          }
        } else {
          el.removeAttribute('href')
        }
      } else {
        el.removeAttribute('href')
      }
    })

    const elements = Array.from(root.querySelectorAll(`[data-url*="${placeholder}"]`))
    elements.forEach((el) => {
      if (url) {
        const safe = sanitizeUrl(url)
        if (safe) {
          el.setAttribute('data-url', safe)
        }
      }
    })

    const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    while (walker.nextNode()) {
      const current = walker.currentNode as Text
      if (current.nodeValue && current.nodeValue.includes(placeholder)) {
        current.nodeValue = current.nodeValue.replaceAll(placeholder, url || '')
      }
    }
  }

  applyLinkPlaceholder('acceptLink', resolveMetaLink(meta, ['acceptLink', 'accept_link']))
  applyLinkPlaceholder('rejectLink', resolveMetaLink(meta, ['rejectLink', 'reject_link']))

  const placeholders = Array.from(root.querySelectorAll('[data-role="replace-action"]'))
  placeholders.forEach((placeholder) => {
    const actionType = placeholder.getAttribute('data-action') || 'view-post'
    const customLabel = placeholder.getAttribute('data-label')
    const className = placeholder.getAttribute('data-class') || placeholder.getAttribute('class') || 'inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-sm text-brand-600 transition-colors'
    const urlKey = placeholder.getAttribute('data-url-key') || ''
    const explicitUrl = placeholder.getAttribute('data-url') || placeholder.getAttribute('href') || undefined
    const postId = placeholder.getAttribute('data-post-id') || meta?.post_id

    const label = (customLabel || placeholder.textContent || DEFAULT_ACTION_LABELS[actionType] || '查看详情').trim()

    const replaceWithButton = (notificationAction: string) => {
      const button = doc.createElement('button')
      button.type = 'button'
      button.textContent = label
      button.className = className
      button.setAttribute('data-notification-action', notificationAction)
      button.setAttribute('data-notification-id', notification.id)
      if (postId) {
        button.setAttribute('data-post-id', String(postId))
      }
      placeholder.replaceWith(button)
    }

    if (actionType === 'request-review') {
      replaceWithButton('REQUEST_REVIEW')
      return
    }

    if (actionType === 'admin-accept') {
      replaceWithButton('ADMIN_APPROVE')
      return
    }

    if (actionType === 'admin-reject') {
      replaceWithButton('ADMIN_REJECT')
      return
    }

    let resolvedUrl = explicitUrl || resolveMetaLink(meta, [urlKey, actionType])
    if (!resolvedUrl && actionType === 'view-post' && postId) {
      resolvedUrl = `/posts/${postId}`
    }
    if (!resolvedUrl && actionType === 'appeal') {
      resolvedUrl = resolveMetaLink(meta, ['appealLink', 'appeal_link'])
    }

    const safeUrl = sanitizeUrl(resolvedUrl)
    const anchor = doc.createElement('a')
    anchor.textContent = label
    anchor.className = className
    if (safeUrl) {
      anchor.setAttribute('href', safeUrl)
      if (/^https?:/i.test(safeUrl) && !safeUrl.startsWith(window.location.origin)) {
        anchor.setAttribute('target', '_blank')
        anchor.setAttribute('rel', 'noopener')
      }
    }
    placeholder.replaceWith(anchor)
  })

  return dompurify.sanitize(root.innerHTML, {
    ADD_ATTR: ['target', 'rel', 'data-notification-action', 'data-post-id', 'data-notification-id', 'type', 'role']
  })
}

const attachHandlers = (notification: NotificationDto) => {
  if (!process.client) return
  const container = notificationContainers.get(notification.id)
  if (!container) return

  const actionable = container.querySelectorAll<HTMLElement>('[data-notification-action]')
  actionable.forEach((el) => {
    if (el.dataset.bound === 'true') return
    const action = el.dataset.notificationAction
    if (!action) return

    if (action === 'REQUEST_REVIEW') {
      const postId = el.dataset.postId || parseMeta(notification)?.post_id
      if (!postId) return
      el.addEventListener('click', (event) => {
        event.preventDefault()
        requestReview(postId)
      })
      el.dataset.bound = 'true'
      return
    }

    if (action === 'ADMIN_APPROVE' || action === 'ADMIN_REJECT') {
      if (!permissions.hasPostModerationPermission.value) {
        el.setAttribute('disabled', 'true')
        el.classList.add('opacity-60', 'cursor-not-allowed')
        return
      }
      el.addEventListener('click', (event) => {
        event.preventDefault()
        handleModerationAction(notification, action === 'ADMIN_APPROVE' ? 'approve' : 'reject')
      })
      el.dataset.bound = 'true'
    }
  })
}

const resolveMetaLink = (meta: any, keys: string[]): string | undefined => {
  if (!meta) return undefined
  for (const key of keys) {
    if (!key) continue
    for (const variant of createKeyVariants(key)) {
      const value = meta?.[variant] ?? meta?.links?.[variant] ?? meta?.actions?.[variant]
      if (typeof value === 'string' && value.trim()) {
        return value.trim()
      }
    }
  }
  return undefined
}

const createKeyVariants = (key: string): string[] => {
  const variants = new Set<string>()
  variants.add(key)
  variants.add(key.replace(/[-_](\w)/g, (_, c: string) => c.toUpperCase()))
  variants.add(key.replace(/[A-Z]/g, (letter: string) => `_${letter.toLowerCase()}`))
  return Array.from(variants)
}

const sanitizeUrl = (value?: string | null): string | undefined => {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  try {
    const url = new URL(trimmed, window.location.origin)
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return url.toString()
    }
  } catch {
    if (trimmed.startsWith('/')) {
      return trimmed
    }
  }
  return undefined
}

// 处理管理员审核操作
const handleModerationAction = async (notification: NotificationDto, action: 'approve' | 'reject') => {
  if (!permissions.hasPostModerationPermission.value) {
    toast.error('没有权限执行此操作')
    return
  }
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


