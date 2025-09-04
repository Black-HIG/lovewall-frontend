<template>
  <div class="w-full space-y-6">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">标签管理</h1>
      <p class="text-gray-600 mt-2">创建标签和生成兑换码</p>
    </div>

    <!-- Controls -->
    <GlassCard class="p-4">
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <!-- Filters -->
        <div class="flex flex-col sm:flex-row gap-3 flex-1">
          <select
            v-model="filters.active"
            @change="applyFilters"
            class="glass-input px-3 py-2"
          >
            <option value="">全部状态</option>
            <option value="true">已启用</option>
            <option value="false">已停用</option>
          </select>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 items-center">
          <GlassButton
            class="toolbar-button"
            @click="openTagModal"
          >
            <PlusIcon class="w-4 h-4 mr-2" />
            新建标签
          </GlassButton>
          
          <GlassButton
            @click="openCodesListModal"
            class="toolbar-button"
            variant="secondary"
          >
            <TicketIcon class="w-4 h-4 mr-2" />
            兑换码列表
          </GlassButton>
          
          <GlassButton
            @click="refresh"
            :loading="loading"
            variant="secondary"
            class="toolbar-button"
          >
            <RefreshCwIcon class="w-4 h-4 mr-2" />
            刷新
          </GlassButton>
        </div>
      </div>
    </GlassCard>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <GlassCard class="p-4 text-center">
        <div class="text-2xl font-bold text-purple-600 mb-1">{{ tagsData?.total || 0 }}</div>
        <div class="text-sm text-gray-600">总标签数</div>
      </GlassCard>
      
      <GlassCard class="p-4 text-center">
        <div class="text-2xl font-bold text-green-600 mb-1">{{ activeCount }}</div>
        <div class="text-sm text-gray-600">已启用</div>
      </GlassCard>
      
      <GlassCard class="p-4 text-center">
        <div class="text-2xl font-bold text-blue-600 mb-1">{{ totalCodes }}</div>
        <div class="text-sm text-gray-600">兑换码总数</div>
      </GlassCard>
      
      <GlassCard class="p-4 text-center">
        <div class="text-2xl font-bold text-orange-600 mb-1">{{ usedCodes }}</div>
        <div class="text-sm text-gray-600">已使用</div>
      </GlassCard>
    </div>

    <!-- Tags List -->
    <div class="space-y-4">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>

      <!-- Empty State -->
      <div v-else-if="!tags.length" class="text-center py-12">
        <GlassCard class="p-12">
          <div class="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <TagIcon class="w-8 h-8 text-white" />
          </div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">暂无标签</h3>
          <p class="text-gray-600">点击"新建标签"来创建第一个标签</p>
        </GlassCard>
      </div>

      <!-- Tags -->
      <div v-else>
        <div
          v-for="tag in tags"
          :key="tag.id"
          class="group"
        >
          <GlassCard class="p-6 hover:shadow-glow-lg transition-all">
            <div class="flex justify-between items-start">
              <div class="flex-1 pr-4">
                <div class="flex items-center gap-3 mb-3">
                  <TagBadge
                    :title="tag.title"
                    :background="tag.background_color"
                    :text="tag.text_color"
                  />
                  <code class="text-sm bg-gray-100 px-2 py-1 rounded">{{ tag.name }}</code>
                  <span
                    :class="{
                      'bg-green-100 text-green-800': tag.is_active,
                      'bg-gray-100 text-gray-800': !tag.is_active
                    }"
                    class="px-2 py-1 text-xs rounded-full"
                  >
                    {{ tag.is_active ? '已启用' : '已停用' }}
                  </span>
                </div>

                <p v-if="tag.description" class="text-gray-700 mb-4">{{ tag.description }}</p>

                <div class="flex items-center gap-4 text-sm text-gray-500">
                  <div class="flex items-center gap-1">
                    <CalendarIcon class="w-4 h-4" />
                    <span>创建：{{ formatDate(tag.created_at) }}</span>
                  </div>
                  <div v-if="tag.updated_at && tag.updated_at !== tag.created_at" class="flex items-center gap-1">
                    <EditIcon class="w-4 h-4" />
                    <span>更新：{{ formatDate(tag.updated_at) }}</span>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <GlassButton
                  @click="openCodesModal(tag)"
                  class="!p-2 glass-button-secondary"
                  title="生成兑换码"
                >
                  <TicketIcon class="w-4 h-4" />
                </GlassButton>
                
                <GlassButton
                  @click="editTag(tag)"
                  class="!p-2 glass-button-secondary"
                  title="编辑标签"
                >
                  <EditIcon class="w-4 h-4" />
                </GlassButton>
                
                <GlassButton
                  @click="toggleStatus(tag)"
                  class="!p-2 glass-button-secondary"
                  :title="tag.is_active ? '停用标签' : '启用标签'"
                >
                  <component :is="tag.is_active ? PauseIcon : PlayIcon" class="w-4 h-4" />
                </GlassButton>
                
                <GlassButton
                  @click="confirmDelete(tag)"
                  class="!p-2 glass-button-secondary !text-red-600 hover:!bg-red-50"
                  title="删除标签"
                >
                  <TrashIcon class="w-4 h-4" />
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        </div>

        <!-- Pagination -->
        <div
          v-if="tagsData && tagsData.total > tagsData.page_size"
          class="flex justify-center pt-6"
        >
          <div class="flex gap-2">
            <GlassButton
              @click="prevPage"
              :disabled="tagsData.page <= 1"
              variant="secondary"
              class="px-4 py-2 text-sm"
            >
              上一页
            </GlassButton>
            
            <div class="flex items-center px-4 py-2 text-sm text-gray-600">
              第 {{ tagsData.page }} 页，共 {{ Math.ceil(tagsData.total / tagsData.page_size) }} 页
            </div>
            
            <GlassButton
              @click="nextPage"
              :disabled="tagsData.page * tagsData.page_size >= tagsData.total"
              variant="secondary"
              class="px-4 py-2 text-sm"
            >
              下一页
            </GlassButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Tag Modal -->
    <GlassModal
      :is-open="tagModal.show"
      :title="tagModal.tag ? '编辑标签' : '新建标签'"
      max-width="max-w-md"
      @close="closeTagModal"
    >
      <form @submit.prevent="saveTag" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">标识名 *</label>
          <GlassInput
            v-model="tagForm.name"
            placeholder="英文标识名，如：vip"
            required
          />
          <p class="text-xs text-gray-500 mt-1">用于程序识别，只能包含字母、数字和下划线</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">显示名称 *</label>
          <GlassInput
            v-model="tagForm.title"
            placeholder="显示给用户的名称，如：VIP用户"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">描述</label>
          <GlassTextarea
            v-model="tagForm.description"
            placeholder="标签的描述信息..."
            :rows="3"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">背景色</label>
            <div class="flex items-center gap-2">
              <input
                type="color"
                v-model="tagForm.background_color"
                class="w-10 h-10 rounded border border-gray-300"
              />
              <GlassInput
                v-model="tagForm.background_color"
                placeholder="#FF5CA3"
                class="flex-1"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">文字色</label>
            <div class="flex items-center gap-2">
              <input
                type="color"
                v-model="tagForm.text_color"
                class="w-10 h-10 rounded border border-gray-300"
              />
              <GlassInput
                v-model="tagForm.text_color"
                placeholder="#FFFFFF"
                class="flex-1"
              />
            </div>
          </div>
        </div>

        <!-- Preview -->
        <div class="p-3 bg-gray-50 rounded-lg">
          <p class="text-sm text-gray-600 mb-2">预览：</p>
          <TagBadge
            :title="tagForm.title || '标签预览'"
            :background="tagForm.background_color"
            :text="tagForm.text_color"
          />
        </div>

        <div>
          <label class="flex items-center gap-2">
            <input
              type="checkbox"
              v-model="tagForm.is_active"
              class="rounded"
            />
            <span class="text-sm font-medium text-gray-700">启用标签</span>
          </label>
        </div>
      </form>

      <template #footer>
        <div class="flex gap-3 justify-end">
          <GlassButton
            type="button"
            @click="closeTagModal"
            variant="secondary"
          >
            取消
          </GlassButton>
          <GlassButton
            @click="saveTag"
            :loading="saving"
          >
            {{ tagModal.tag ? '保存' : '创建' }}
          </GlassButton>
        </div>
      </template>
    </GlassModal>

    <!-- Generate Codes Modal -->
    <GlassModal
      :is-open="codesModal.show"
      title="生成兑换码"
      max-width="max-w-md"
      @close="closeCodesModal"
    >
      <div v-if="codesModal.tag" class="mb-4 p-3 bg-gray-50 rounded-lg">
        <p class="text-sm text-gray-600 mb-2">为标签生成兑换码：</p>
        <TagBadge
          :title="codesModal.tag.title"
          :background="codesModal.tag.background_color"
          :text="codesModal.tag.text_color"
        />
      </div>
      
      <form @submit.prevent="generateCodes" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">生成数量 *</label>
          <GlassInput
            v-model="codesForm.count"
            type="number"
            placeholder="100"
            min="1"
            max="1000"
            required
          />
          <p class="text-xs text-gray-500 mt-1">最多一次生成1000个</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">过期时间</label>
          <GlassInput
            v-model="codesForm.expires_at"
            type="datetime-local"
            placeholder="留空表示永不过期"
          />
        </div>
      </form>

      <template #footer>
        <div class="flex gap-3 justify-end">
          <GlassButton
            type="button"
            @click="closeCodesModal"
            variant="secondary"
          >
            取消
          </GlassButton>
          <GlassButton
            @click="generateCodes"
            :loading="generating"
          >
            生成兑换码
          </GlassButton>
        </div>
      </template>
    </GlassModal>

    <!-- Generated Codes Modal -->
    <GlassModal
      :is-open="generatedModal.show"
      title="兑换码生成成功"
      max-width="max-w-4xl"
      @close="closeGeneratedModal"
    >
      <div class="flex items-center justify-between mb-4">
        <p class="text-gray-600">
          已为标签"{{ generatedModal.tag?.title }}"生成 {{ generatedModal.codes?.length }} 个兑换码
        </p>
        <GlassButton
          @click="downloadCodes"
          class="glass-button-secondary text-sm"
        >
          <DownloadIcon class="w-4 h-4 mr-1" />
          下载
        </GlassButton>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto bg-gray-50 p-4 rounded-lg">
        <code
          v-for="code in generatedModal.codes"
          :key="code.id"
          class="text-xs bg-white px-2 py-1 rounded border font-mono"
        >
          {{ code.code }}
        </code>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <GlassButton @click="closeGeneratedModal">
            关闭
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
        确定要删除标签"{{ deleteModal.tag?.title }}"吗？删除后无法恢复，相关的兑换码也会失效。
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
            @click="deleteTag"
            :loading="deleting"
            class="!bg-red-600 hover:!bg-red-700"
          >
            确认删除
          </GlassButton>
        </div>
      </template>
    </GlassModal>

    <!-- Codes List Modal -->
    <GlassModal
      :is-open="codesListModal.show"
      title="兑换码列表"
      max-width="max-w-6xl"
      @close="closeCodesListModal"
    >
      <!-- Filters -->
      <div class="mb-4 flex flex-col sm:flex-row gap-3">
        <GlassInput
          v-model="codesFilter.code"
          placeholder="搜索兑换码..."
          class="flex-1"
        />
        
        <select
          v-model="codesFilter.tag_id"
          class="glass-input px-3 py-2 min-w-32"
        >
          <option value="">全部标签</option>
          <option v-for="tag in tags" :key="tag.id" :value="tag.id">
            {{ tag.title }}
          </option>
        </select>
        
        <select
          v-model="codesFilter.used"
          class="glass-input px-3 py-2 min-w-24"
        >
          <option value="">全部状态</option>
          <option value="false">未使用</option>
          <option value="true">已使用</option>
        </select>
        
        <GlassButton
          @click="loadCodes(1)"
          :loading="loadingCodes"
          variant="secondary"
        >
          搜索
        </GlassButton>
      </div>

      <!-- Loading State -->
      <div v-if="loadingCodes" class="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>

      <!-- Empty State -->
      <div v-else-if="!codes.length" class="text-center py-12">
        <div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <TicketIcon class="w-8 h-8 text-white" />
        </div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">暂无兑换码</h3>
        <p class="text-gray-600">点击"生成兑换码"来创建第一个兑换码</p>
      </div>

      <!-- Codes Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">兑换码</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">标签</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">状态</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">使用者</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">过期时间</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">创建时间</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="code in codes" :key="code.id" class="hover:bg-gray-50">
              <td class="px-4 py-3">
                <code class="text-xs bg-gray-100 px-2 py-1 rounded font-mono">{{ code.code }}</code>
              </td>
              <td class="px-4 py-3">
                <TagBadge
                  v-if="code.tag"
                  :title="code.tag.title"
                  :background="code.tag.background_color"
                  :text="code.tag.text_color"
                />
              </td>
              <td class="px-4 py-3">
                <span
                  :class="{
                    'bg-green-100 text-green-800': !code.is_used,
                    'bg-gray-100 text-gray-800': code.is_used
                  }"
                  class="px-2 py-1 text-xs rounded-full"
                >
                  {{ code.is_used ? '已使用' : '未使用' }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600">
                {{ code.used_by ? `用户 ${code.used_by}` : '-' }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-600">
                {{ code.expires_at ? formatDate(code.expires_at) : '永不过期' }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-600">
                {{ formatDate(code.created_at) }}
              </td>
              <td class="px-4 py-3">
                <GlassButton
                  @click="viewCodeDetails(code)"
                  class="!p-1 text-xs"
                  variant="secondary"
                >
                  查看详情
                </GlassButton>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div
          v-if="codesData && codesData.total > codesData.page_size"
          class="flex justify-center pt-6"
        >
          <div class="flex gap-2">
            <GlassButton
              @click="prevCodesPage"
              :disabled="codesData.page <= 1"
              variant="secondary"
              class="px-4 py-2 text-sm"
            >
              上一页
            </GlassButton>
            
            <div class="flex items-center px-4 py-2 text-sm text-gray-600">
              第 {{ codesData.page }} 页，共 {{ Math.ceil(codesData.total / codesData.page_size) }} 页
            </div>
            
            <GlassButton
              @click="nextCodesPage"
              :disabled="codesData.page * codesData.page_size >= codesData.total"
              variant="secondary"
              class="px-4 py-2 text-sm"
            >
              下一页
            </GlassButton>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <GlassButton @click="closeCodesListModal">
            关闭
          </GlassButton>
        </div>
      </template>
    </GlassModal>

    <!-- Code Details Modal -->
    <GlassModal
      :is-open="codeDetailsModal.show"
      title="兑换码详情"
      max-width="max-w-md"
      @close="closeCodeDetailsModal"
    >
      <div v-if="codeDetailsModal.code" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">兑换码</label>
          <code class="block text-sm bg-gray-100 px-3 py-2 rounded font-mono">{{ codeDetailsModal.code.code }}</code>
        </div>
        
        <div v-if="codeDetailsModal.code.tag">
          <label class="block text-sm font-medium text-gray-700 mb-1">关联标签</label>
          <TagBadge
            :title="codeDetailsModal.code.tag.title"
            :background="codeDetailsModal.code.tag.background_color"
            :text="codeDetailsModal.code.tag.text_color"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
          <span
            :class="{
              'bg-green-100 text-green-800': !codeDetailsModal.code.is_used,
              'bg-gray-100 text-gray-800': codeDetailsModal.code.is_used
            }"
            class="px-2 py-1 text-xs rounded-full"
          >
            {{ codeDetailsModal.code.is_used ? '已使用' : '未使用' }}
          </span>
        </div>
        
        <div v-if="codeDetailsModal.code.used_by">
          <label class="block text-sm font-medium text-gray-700 mb-1">使用者</label>
          <p class="text-sm text-gray-600">用户 {{ codeDetailsModal.code.used_by }}</p>
        </div>
        
        <div v-if="codeDetailsModal.code.used_at">
          <label class="block text-sm font-medium text-gray-700 mb-1">使用时间</label>
          <p class="text-sm text-gray-600">{{ formatDate(codeDetailsModal.code.used_at) }}</p>
        </div>
        
        <div v-if="codeDetailsModal.code.expires_at">
          <label class="block text-sm font-medium text-gray-700 mb-1">过期时间</label>
          <p class="text-sm text-gray-600">{{ formatDate(codeDetailsModal.code.expires_at) }}</p>
        </div>
        
        <div v-if="codeDetailsModal.code.batch_id">
          <label class="block text-sm font-medium text-gray-700 mb-1">批次ID</label>
          <code class="text-xs bg-gray-100 px-2 py-1 rounded">{{ codeDetailsModal.code.batch_id }}</code>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">创建时间</label>
          <p class="text-sm text-gray-600">{{ formatDate(codeDetailsModal.code.created_at) }}</p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <GlassButton @click="closeCodeDetailsModal">
            关闭
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
  TagIcon,
  EditIcon,
  CalendarIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
  TicketIcon,
  DownloadIcon
} from 'lucide-vue-next'
import GlassModal from '~/components/ui/GlassModal.vue'
import GlassInput from '~/components/ui/GlassInput.vue'
import GlassTextarea from '~/components/ui/GlassTextarea.vue'
import type { TagDto, RedemptionCodeDto, Pagination } from '~/types'

definePageMeta({
  middleware: ['admin', 'require-perms'],
  requiredPerms: ['MANAGE_TAGS']
})

// Stores
const auth = useAuthStore()
const toast = useToast()

// State
const tags = ref<TagDto[]>([])
const tagsData = ref<Pagination<TagDto> | null>(null)
const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const generating = ref(false)

const filters = reactive({
  active: ''
})

const tagModal = reactive({
  show: false,
  tag: null as TagDto | null
})

const codesModal = reactive({
  show: false,
  tag: null as TagDto | null
})

const generatedModal = reactive({
  show: false,
  tag: null as TagDto | null,
  codes: null as RedemptionCodeDto[] | null
})

const deleteModal = reactive({
  show: false,
  tag: null as TagDto | null
})

const codesListModal = reactive({
  show: false
})

const codeDetailsModal = reactive({
  show: false,
  code: null as RedemptionCodeDto | null
})

// Codes related state
const codes = ref<RedemptionCodeDto[]>([])
const codesData = ref<Pagination<RedemptionCodeDto> | null>(null)
const loadingCodes = ref(false)

const codesFilter = reactive({
  code: '',
  tag_id: '',
  used: ''
})

const tagForm = reactive({
  name: '',
  title: '',
  description: '',
  background_color: '#FF5CA3',
  text_color: '#FFFFFF',
  is_active: true
})

const codesForm = reactive({
  count: 100,
  expires_at: ''
})

// Mock data for stats (these would come from API)
const totalCodes = ref(0)
const usedCodes = ref(0)

// Computed
const activeCount = computed(() => {
  return tags.value.filter(tag => tag.is_active).length
})

// Methods
const loadTags = async (page = 1) => {
  loading.value = true
  try {
    const api = useApi()
    const params: any = {
      page,
      page_size: 20
    }
    
    if (filters.active) {
      params.active = filters.active === 'true'
    }
    
    const data = await api.listTags(params)
    tags.value = data.items
    tagsData.value = data
  } catch (error: any) {
    toast.error('加载标签列表失败')
  } finally {
    loading.value = false
  }
}

const refresh = () => {
  loadTags(1)
}

const applyFilters = () => {
  loadTags(1)
}

const prevPage = () => {
  if (tagsData.value && tagsData.value.page > 1) {
    loadTags(tagsData.value.page - 1)
  }
}

const nextPage = () => {
  if (tagsData.value && tagsData.value.page * tagsData.value.page_size < tagsData.value.total) {
    loadTags(tagsData.value.page + 1)
  }
}

const openTagModal = () => {
  tagForm.name = ''
  tagForm.title = ''
  tagForm.description = ''
  tagForm.background_color = '#FF5CA3'
  tagForm.text_color = '#FFFFFF'
  tagForm.is_active = true
  tagModal.tag = null
  tagModal.show = true
}

const editTag = (tag: TagDto) => {
  tagForm.name = tag.name
  tagForm.title = tag.title
  tagForm.description = tag.description || ''
  tagForm.background_color = tag.background_color
  tagForm.text_color = tag.text_color
  tagForm.is_active = tag.is_active
  tagModal.tag = tag
  tagModal.show = true
}

const closeTagModal = () => {
  tagModal.show = false
  tagModal.tag = null
}

const saveTag = async () => {
  saving.value = true
  try {
    const api = useApi()
    
    if (tagModal.tag) {
      // Update existing
      await api.updateTag(tagModal.tag.id, {
        name: tagForm.name,
        title: tagForm.title,
        description: tagForm.description,
        background_color: tagForm.background_color,
        text_color: tagForm.text_color,
        is_active: tagForm.is_active
      })
      
      // Update local state
      Object.assign(tagModal.tag, {
        name: tagForm.name,
        title: tagForm.title,
        description: tagForm.description,
        background_color: tagForm.background_color,
        text_color: tagForm.text_color,
        is_active: tagForm.is_active,
        updated_at: new Date().toISOString()
      })
      
      toast.success('标签已更新')
    } else {
      // Create new
      const newTag = await api.createTag({
        name: tagForm.name,
        title: tagForm.title,
        description: tagForm.description,
        background_color: tagForm.background_color,
        text_color: tagForm.text_color,
        is_active: tagForm.is_active
      })
      
      tags.value.unshift(newTag)
      if (tagsData.value) {
        tagsData.value.total += 1
      }
      
      toast.success('标签已创建')
    }
    
    closeTagModal()
  } catch (error: any) {
    toast.error('保存标签失败')
  } finally {
    saving.value = false
  }
}

const toggleStatus = async (tag: TagDto) => {
  try {
    const api = useApi()
    await api.updateTag(tag.id, {
      is_active: !tag.is_active
    })
    
    tag.is_active = !tag.is_active
    tag.updated_at = new Date().toISOString()
    
    toast.success(tag.is_active ? '标签已启用' : '标签已停用')
  } catch (error) {
    toast.error('操作失败')
  }
}

const openCodesModal = (tag: TagDto) => {
  codesModal.tag = tag
  codesForm.count = 100
  codesForm.expires_at = ''
  codesModal.show = true
}

const closeCodesModal = () => {
  codesModal.show = false
  codesModal.tag = null
}

const generateCodes = async () => {
  if (!codesModal.tag) return
  
  generating.value = true
  try {
    const api = useApi()
    const params: any = {
      tag_id: codesModal.tag.id,
      count: parseInt(codesForm.count.toString())
    }
    
    if (codesForm.expires_at) {
      params.expires_at = new Date(codesForm.expires_at).toISOString()
    }
    
    const result = await api.generateCodes(params)
    
    generatedModal.tag = codesModal.tag
    generatedModal.codes = result.codes
    generatedModal.show = true
    
    closeCodesModal()
    toast.success(`成功生成 ${result.count} 个兑换码`)
  } catch (error: any) {
    toast.error('生成兑换码失败')
  } finally {
    generating.value = false
  }
}

const closeGeneratedModal = () => {
  generatedModal.show = false
  generatedModal.tag = null
  generatedModal.codes = null
}

const downloadCodes = () => {
  if (!generatedModal.codes) return
  
  const content = generatedModal.codes.map(code => code.code).join('\n')
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `兑换码_${generatedModal.tag?.name}_${new Date().toISOString().split('T')[0]}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const confirmDelete = (tag: TagDto) => {
  deleteModal.tag = tag
  deleteModal.show = true
}

const deleteTag = async () => {
  if (!deleteModal.tag) return
  
  deleting.value = true
  try {
    const api = useApi()
    await api.deleteTag(deleteModal.tag.id)
    
    // Remove from local list
    tags.value = tags.value.filter(t => t.id !== deleteModal.tag!.id)
    if (tagsData.value) {
      tagsData.value.total -= 1
    }
    
    toast.success('标签已删除')
    deleteModal.show = false
    deleteModal.tag = null
  } catch (error) {
    toast.error('删除失败')
  } finally {
    deleting.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// Codes methods
const openCodesListModal = async () => {
  codesListModal.show = true
  await loadCodes(1)
}

const closeCodesListModal = () => {
  codesListModal.show = false
  codes.value = []
  codesData.value = null
  codesFilter.code = ''
  codesFilter.tag_id = ''
  codesFilter.used = ''
}

const loadCodes = async (page = 1) => {
  loadingCodes.value = true
  try {
    const api = useApi()
    const params: any = {
      page,
      page_size: 20
    }
    
    if (codesFilter.code) {
      params.code = codesFilter.code
    }
    if (codesFilter.tag_id) {
      params.tag_id = codesFilter.tag_id
    }
    if (codesFilter.used) {
      params.used = codesFilter.used === 'true'
    }
    
    const data = await api.listCodes(params)
    codes.value = data.items
    codesData.value = data
    
    // 更新统计数据
    totalCodes.value = data.total
    usedCodes.value = data.items.filter(code => code.is_used).length
  } catch (error: any) {
    toast.error('加载兑换码列表失败')
  } finally {
    loadingCodes.value = false
  }
}

const prevCodesPage = () => {
  if (codesData.value && codesData.value.page > 1) {
    loadCodes(codesData.value.page - 1)
  }
}

const nextCodesPage = () => {
  if (codesData.value && codesData.value.page * codesData.value.page_size < codesData.value.total) {
    loadCodes(codesData.value.page + 1)
  }
}

const viewCodeDetails = async (code: RedemptionCodeDto) => {
  try {
    const api = useApi()
    // 获取完整的兑换码详情
    const detailCode = await api.getCodeByCode(code.code)
    codeDetailsModal.code = detailCode
    codeDetailsModal.show = true
  } catch (error: any) {
    toast.error('获取兑换码详情失败')
  }
}

const closeCodeDetailsModal = () => {
  codeDetailsModal.show = false
  codeDetailsModal.code = null
}

// Initialize
onMounted(() => {
  loadTags()
})

// SEO
useHead({
  title: '标签管理 - Love Wall',
  meta: [
    { name: 'description', content: '创建标签和生成兑换码' }
  ]
})
</script>
