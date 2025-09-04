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
                  class="!p-2 glass-button-secondary"
                  title="编辑公告"
                >
                  <EditIcon class="w-4 h-4" />
                </GlassButton>
                
                <GlassButton
                  @click="toggleStatus(announcement)"
                  class="!p-2 glass-button-secondary"
                  :title="announcement.is_active ? '停用公告' : '启用公告'"
                >
                  <component :is="announcement.is_active ? PauseIcon : PlayIcon" class="w-4 h-4" />
                </GlassButton>
                
                <GlassButton
                  @click="confirmDelete(announcement)"
                  class="!p-2 glass-button-secondary !text-red-600 hover:!bg-red-50"
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
    <GlassModal
      :is-open="editModal.show"
      :title="editModal.announcement ? '编辑公告' : '新建公告'"
      max-width="max-w-2xl"
      @close="closeEditModal"
    >
      <form @submit.prevent="saveAnnouncement" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">标题</label>
          <GlassInput
            v-model="form.title"
            placeholder="输入公告标题..."
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">内容</label>
          <GlassTextarea
            v-model="form.content"
            placeholder="输入公告内容..."
            :rows="6"
            required
          />
        </div>

        <div>
          <label class="flex items-center gap-2">
            <input
              type="checkbox"
              v-model="form.is_active"
              class="rounded"
            />
            <span class="text-sm font-medium text-gray-700">启用公告</span>
          </label>
        </div>
      </form>

      <template #footer>
        <div class="flex gap-3 justify-end">
          <GlassButton
            type="button"
            @click="closeEditModal"
            variant="secondary"
          >
            取消
          </GlassButton>
          <GlassButton
            @click="saveAnnouncement"
            :loading="saving"
          >
            {{ editModal.announcement ? '保存' : '创建' }}
          </GlassButton>
        </div>
      </template>
    </GlassModal>

    <!-- Delete Confirmation Modal -->
    <GlassModal
      :is-open="deleteModal.show"
      title="确认删除"
      max-width="max-w-md"
      @close="deleteModal.show = false"
    >
      <p class="text-gray-600 mb-6">
        确定要删除公告"{{ deleteModal.announcement?.title }}"吗？删除后无法恢复。
      </p>

      <template #footer>
        <div class="flex gap-3 justify-end">
          <GlassButton
            @click="deleteModal.show = false"
            variant="secondary"
          >
            取消
          </GlassButton>
          <GlassButton
            @click="deleteAnnouncement"
            :loading="deleting"
            class="!bg-red-600 hover:!bg-red-700"
          >
            确认删除
          </GlassButton>
        </div>
      </template>
    </GlassModal>
  </div>
</template>

<script setup lang="ts">
import {
  PlusIcon,
  RefreshCwIcon,
  MegaphoneIcon,
  EditIcon,
  CalendarIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon
} from 'lucide-vue-next'
import GlassModal from '~/components/ui/GlassModal.vue'
import GlassInput from '~/components/ui/GlassInput.vue'
import GlassTextarea from '~/components/ui/GlassTextarea.vue'
import type { AnnouncementDto } from '~/types'

definePageMeta({
  middleware: ['admin', 'require-perms'],
  requiredPerms: ['MANAGE_ANNOUNCEMENTS']
})

// Stores
const auth = useAuthStore()
const toast = useToast()

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

const deleteModal = reactive({
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
  loading.value = true
  try {
    const api = useApi()
    // Note: This endpoint might need modification to support admin filtering
    const data = await api.listAnnouncements()
    announcements.value = data
  } catch (error: any) {
    toast.error('加载公告列表失败')
  } finally {
    loading.value = false
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
  try {
    const api = useApi()
    await api.updateAnnouncement(announcement.id, {
      is_active: !announcement.is_active
    })
    
    announcement.is_active = !announcement.is_active
    announcement.updated_at = new Date().toISOString()
    
    toast.success(announcement.is_active ? '公告已启用' : '公告已停用')
  } catch (error) {
    toast.error('操作失败')
  }
}

const confirmDelete = (announcement: AnnouncementDto) => {
  deleteModal.announcement = announcement
  deleteModal.show = true
}

const deleteAnnouncement = async () => {
  if (!deleteModal.announcement) return
  
  deleting.value = true
  try {
    const api = useApi()
    await api.deleteAnnouncement(deleteModal.announcement.id)
    
    // Remove from local list
    announcements.value = announcements.value.filter(a => a.id !== deleteModal.announcement!.id)
    
    toast.success('公告已删除')
    deleteModal.show = false
    deleteModal.announcement = null
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