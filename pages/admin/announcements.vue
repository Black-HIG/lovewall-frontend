<template>
  <div class="w-full space-y-6">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">公告管理</h1>
      <p class="text-gray-600 mt-2">创建、编辑和管理系统公告</p>
    </div>

    <!-- Controls -->
    <GlassCard class="p-4">
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <!-- Filters -->
        <div class="flex flex-col sm:flex-row gap-3 flex-1">
          <select
            v-model="filters.is_active"
            @change="applyFilters"
            class="glass-input px-3 py-2"
          >
            <option value="">全部状态</option>
            <option value="true">已启用</option>
            <option value="false">已停用</option>
          </select>
        </div>

        <!-- Actions -->
        <div class="flex gap-3">
          <GlassButton
            @click="openCreateModal"
          >
            <PlusIcon class="w-4 h-4 mr-2" />
            新建公告
          </GlassButton>
          
          <GlassButton
            @click="refresh"
            :loading="loading"
            variant="secondary"
          >
            <RefreshCwIcon class="w-4 h-4 mr-2" />
            刷新
          </GlassButton>
        </div>
      </div>
    </GlassCard>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <GlassCard class="p-4 text-center">
        <div class="text-2xl font-bold text-blue-600 mb-1">{{ announcements.length }}</div>
        <div class="text-sm text-gray-600">总公告数</div>
      </GlassCard>
      
      <GlassCard class="p-4 text-center">
        <div class="text-2xl font-bold text-green-600 mb-1">{{ activeCount }}</div>
        <div class="text-sm text-gray-600">已启用</div>
      </GlassCard>
      
      <GlassCard class="p-4 text-center">
        <div class="text-2xl font-bold text-gray-600 mb-1">{{ inactiveCount }}</div>
        <div class="text-sm text-gray-600">已停用</div>
      </GlassCard>
    </div>

    <!-- Announcements List -->
    <div class="space-y-4">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>

      <!-- Empty State -->
      <div v-else-if="!announcements.length" class="text-center py-12">
        <GlassCard class="p-12">
          <div class="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <MegaphoneIcon class="w-8 h-8 text-white" />
          </div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">暂无公告</h3>
          <p class="text-gray-600">点击"新建公告"来创建第一条公告</p>
        </GlassCard>
      </div>

      <!-- Announcements -->
      <div v-else>
        <div
          v-for="announcement in announcements"
          :key="announcement.id"
          class="group"
        >
          <GlassCard class="p-6 hover:shadow-glow-lg transition-all">
            <div class="flex justify-between items-start">
              <div class="flex-1 pr-4">
                <div class="flex items-center gap-3 mb-3">
                  <h3 class="text-lg font-semibold text-gray-800">{{ announcement.title }}</h3>
                  <span
                    :class="{
                      'bg-green-100 text-green-800': announcement.is_active,
                      'bg-gray-100 text-gray-800': !announcement.is_active
                    }"
                    class="px-2 py-1 text-xs rounded-full"
                  >
                    {{ announcement.is_active ? '已启用' : '已停用' }}
                  </span>
                </div>

                <p class="text-gray-700 mb-4 line-clamp-3">{{ announcement.content }}</p>

                <div class="flex items-center gap-4 text-sm text-gray-500">
                  <div class="flex items-center gap-1">
                    <CalendarIcon class="w-4 h-4" />
                    <span>创建：{{ formatDate(announcement.created_at) }}</span>
                  </div>
                  <div v-if="announcement.updated_at && announcement.updated_at !== announcement.created_at" class="flex items-center gap-1">
                    <EditIcon class="w-4 h-4" />
                    <span>更新：{{ formatDate(announcement.updated_at) }}</span>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <GlassButton
                  @click="editAnnouncement(announcement)"
                  variant="secondary"
                  class="!p-2"
                  title="编辑公告"
                >
                  <EditIcon class="w-4 h-4" />
                </GlassButton>
                
                <GlassButton
                  @click="toggleStatus(announcement)"
                  variant="secondary"
                  class="!p-2"
                  :title="announcement.is_active ? '停用公告' : '启用公告'"
                >
                  <component :is="announcement.is_active ? PauseIcon : PlayIcon" class="w-4 h-4" />
                </GlassButton>
                
                <GlassButton
                  @click="confirmDelete(announcement)"
                  variant="secondary"
                  class="!p-2 !text-red-600 hover:!bg-red-50"
                  title="删除公告"
                >
                  <TrashIcon class="w-4 h-4" />
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <Transition name="dialog-fade">
        <div
          v-if="editModal.show"
          class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        >
          <div class="absolute inset-0 bg-black/20 backdrop-blur-sm" @click="closeEditModal" />
          <div
            class="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-dialog-in"
            @click.stop
          >
            <div class="relative p-6 pb-4 pr-12">
              <h3 class="text-xl font-semibold text-gray-900">
                {{ editModal.announcement ? '编辑公告' : '新建公告' }}
              </h3>
              <button
                type="button"
                class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                @click="closeEditModal"
              >
                <XIcon class="w-5 h-5" />
              </button>
            </div>

            <div class="px-6 pb-6 space-y-6 overflow-y-auto">
              <form id="announcement-form" @submit.prevent="saveAnnouncement" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">标题</label>
                  <input
                    v-model="form.title"
                    placeholder="输入公告标题..."
                    required
                    class="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">内容</label>
                  <textarea
                    v-model="form.content"
                    placeholder="输入公告内容..."
                    :rows="6"
                    required
                    class="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent resize-none"
                  ></textarea>
                </div>

                <div>
                  <label class="flex items-center gap-2">
                    <input
                      type="checkbox"
                      v-model="form.is_active"
                      class="rounded"
                    >
                    <span class="text-sm font-medium text-gray-700">启用公告</span>
                  </label>
                </div>
              </form>
            </div>

            <div class="flex gap-3 justify-end px-6 pb-6">
              <button
                type="button"
                class="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                @click="closeEditModal"
              >
                取消
              </button>
              <button
                type="submit"
                form="announcement-form"
                class="px-5 py-2.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                :disabled="saving"
              >
                <span v-if="saving" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                <span>{{ editModal.announcement ? '保存' : '创建' }}</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import {
  PlusIcon,
  RefreshCwIcon,
  MegaphoneIcon,
  EditIcon,
  CalendarIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
  XIcon
} from 'lucide-vue-next'
import type { AnnouncementDto } from '~/types'

console.log('[AnnouncementsAdmin] === SCRIPT ENTRY ===')

try {
  definePageMeta({
    middleware: ['admin', 'require-perms'],
    requiredPerms: ['MANAGE_ANNOUNCEMENTS']
  })
  console.log('[AnnouncementsAdmin] definePageMeta succeeded')
} catch (e) {
  console.error('[AnnouncementsAdmin] definePageMeta FAILED:', e)
}

console.log('[AnnouncementsAdmin] Initializing stores...')
let auth: ReturnType<typeof useAuthStore>
let toast: ReturnType<typeof useToast>
try {
  auth = useAuthStore()
  toast = useToast()
  console.log('[AnnouncementsAdmin] Stores initialized', { auth: !!auth, toast: !!toast })
} catch (e) {
  console.error('[AnnouncementsAdmin] Store initialization FAILED:', e)
  throw e
}
console.log('[AnnouncementsAdmin] Auth store snapshot ready', { hasUser: Boolean(auth?.user) })

// State
const announcements = ref<AnnouncementDto[]>([])
const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)

const filters = reactive({
  is_active: ''
})

const editModal = reactive({
  show: false,
  announcement: null as AnnouncementDto | null
})

const form = reactive({
  title: '',
  content: '',
  is_active: true
})

// Computed
const activeCount = computed(() => {
  return announcements.value.filter(a => a.is_active).length
})

const inactiveCount = computed(() => {
  return announcements.value.filter(a => !a.is_active).length
})

// Methods
const loadAnnouncements = async () => {
  console.log('开始加载公告列表', { filters: { ...filters } })
  loading.value = true
  try {
    const api = useApi()
    const apiMethodNames = Object.keys(api || {})
    console.log('[DEBUG] API methods available:', apiMethodNames)
    console.log('[DEBUG] Has listAnnouncementsAdmin?', typeof api?.listAnnouncementsAdmin)
    if (typeof api?.listAnnouncementsAdmin !== 'function') {
      console.error('[FATAL] listAnnouncementsAdmin not found! Available methods:', apiMethodNames)
      throw new Error('API method missing')
    }
    let data: AnnouncementDto[]

    try {
      console.log('调用管理员公告列表接口')
      // 优先使用管理员接口,可以获取所有公告(包括停用的)
      data = await api.listAnnouncementsAdmin()
      console.log('管理员公告列表接口返回', { total: data.length })
    } catch (adminError: any) {
      console.warn('管理员公告列表接口调用失败,改用普通接口', adminError)
      console.log('调用公共公告列表接口')
      data = await api.listAnnouncements()
      console.log('公共公告列表接口返回', { total: data.length })
    }

    announcements.value = data

    // 应用前端过滤
    if (filters.is_active === 'true') {
      announcements.value = announcements.value.filter(a => a.is_active)
      console.log('应用过滤条件: 仅显示启用公告')
    } else if (filters.is_active === 'false') {
      announcements.value = announcements.value.filter(a => !a.is_active)
      console.log('应用过滤条件: 仅显示停用公告')
    }

    console.log('公告列表加载完成', { total: announcements.value.length, filters: { ...filters } })
  } catch (error: any) {
    console.error('加载公告列表失败:', error)
    if (error?.response) {
      console.error('公告列表接口响应错误:', {
        status: error.response.status,
        data: error.response.data
      })
    }
    toast.error(`加载公告列表失败: ${error.message || '未知错误'}`)
  } finally {
    loading.value = false
    console.log('公告列表加载流程结束')
  }
}

const refresh = () => {
  loadAnnouncements()
}

const applyFilters = () => {
  loadAnnouncements()
}

const openCreateModal = () => {
  form.title = ''
  form.content = ''
  form.is_active = true
  editModal.announcement = null
  editModal.show = true
}

const editAnnouncement = (announcement: AnnouncementDto) => {
  form.title = announcement.title
  form.content = announcement.content
  form.is_active = announcement.is_active
  editModal.announcement = announcement
  editModal.show = true
}

const closeEditModal = () => {
  editModal.show = false
  editModal.announcement = null
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && editModal.show) {
    closeEditModal()
  }
}

watch(() => editModal.show, (open) => {
  if (typeof window !== 'undefined') {
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) {
      window.addEventListener('keydown', handleEscape)
    } else {
      window.removeEventListener('keydown', handleEscape)
    }
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    document.body.style.overflow = ''
    window.removeEventListener('keydown', handleEscape)
  }
})

const saveAnnouncement = async () => {
  saving.value = true
  try {
    const api = useApi()
    
    if (editModal.announcement) {
      // Update existing
      await api.updateAnnouncement(editModal.announcement.id, {
        title: form.title,
        content: form.content,
        is_active: form.is_active
      })
      
      // Update local state
      Object.assign(editModal.announcement, {
        title: form.title,
        content: form.content,
        is_active: form.is_active,
        updated_at: new Date().toISOString()
      })
      
      toast.success('公告已更新')
    } else {
      // Create new
      const newAnnouncement = await api.createAnnouncement({
        title: form.title,
        content: form.content,
        is_active: form.is_active
      })
      
      announcements.value.unshift(newAnnouncement)
      toast.success('公告已创建')
    }
    
    closeEditModal()
  } catch (error: any) {
    toast.error('保存公告失败')
  } finally {
    saving.value = false
  }
}

const toggleStatus = async (announcement: AnnouncementDto) => {
  const { confirm } = useAdminDialog()
  const nextState = !announcement.is_active
  const confirmed = await confirm({
    title: nextState ? '确认启用' : '确认停用',
    message: `确定要${nextState ? '启用' : '停用'}公告"${announcement.title}"吗?`,
    confirmText: nextState ? '确认启用' : '确认停用',
    cancelText: '取消'
  })

  if (!confirmed) return

  try {
    const api = useApi()
    await api.updateAnnouncement(announcement.id, {
      title: announcement.title,
      content: announcement.content,
      is_active: nextState
    })

    // 刷新列表以正确应用筛选
    await loadAnnouncements()

    toast.success(nextState ? '公告已启用' : '公告已停用')
  } catch (error) {
    toast.error('操作失败')
  }
}

const confirmDelete = async (announcement: AnnouncementDto) => {
  const { confirm } = useAdminDialog()
  const confirmed = await confirm({
    title: '确认删除',
    message: `确定要删除公告"${announcement.title}"吗？删除后无法恢复。`,
    confirmText: '确认删除',
    cancelText: '取消'
  })

  if (!confirmed) return

  deleting.value = true
  try {
    const api = useApi()
    await api.deleteAnnouncement(announcement.id)

    // Remove from local list
    announcements.value = announcements.value.filter(a => a.id !== announcement.id)

    toast.success('公告已删除')
  } catch (error) {
    toast.error('删除失败')
  } finally {
    deleting.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// Initialize
onMounted(() => {
  console.log('[AnnouncementsAdmin] onMounted hook triggered')
  loadAnnouncements()
})

// SEO
useHead({
  title: '公告管理 - Love Wall',
  meta: [
    { name: 'description', content: '创建、编辑和管理系统公告' }
  ]
})
</script>

<style scoped>
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

@keyframes dialog-in {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-dialog-in {
  animation: dialog-in 0.2s ease-out;
}
</style>



