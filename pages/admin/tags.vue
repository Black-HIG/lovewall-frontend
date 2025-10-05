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
                  variant="secondary"
                  class="!p-2"
                  title="生成兑换码"
                >
                  <TicketIcon class="w-4 h-4" />
                </GlassButton>
                
                <GlassButton
                  @click="editTag(tag)"
                  variant="secondary"
                  class="!p-2"
                  title="编辑标签"
                >
                  <EditIcon class="w-4 h-4" />
                </GlassButton>
                
                <GlassButton
                  @click="toggleStatus(tag)"
                  variant="secondary"
                  class="!p-2"
                  :title="tag.is_active ? '停用标签' : '启用标签'"
                >
                  <component :is="tag.is_active ? PauseIcon : PlayIcon" class="w-4 h-4" />
                </GlassButton>
                
                <GlassButton
                  @click="confirmDelete(tag)"
                  variant="secondary"
                  class="!p-2 !text-red-600 hover:!bg-red-50"
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
    <Teleport to="body">
      <Transition name="dialog-fade">
        <div v-if="tagModal.show" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/20 backdrop-blur-sm" @click="closeTagModal" />
          <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col animate-dialog-in" @click.stop>
            <div class="relative p-6 pb-4 pr-12">
              <h3 class="text-xl font-semibold text-gray-900">{{ tagModal.tag ? '编辑标签' : '新建标签' }}</h3>
              <button type="button" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors" @click="closeTagModal">
                <XIcon class="w-5 h-5" />
              </button>
            </div>
            <div class="px-6 pb-6 flex-1 overflow-y-auto">
              <form id="tag-form" @submit.prevent="saveTag" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">标识名 *</label>
                  <input
                    v-model="tagForm.name"
                    type="text"
                    placeholder="英文标识名，如：vip"
                    required
                    class="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                  />
                  <p class="text-xs text-gray-500 mt-1">用于程序识别，只能包含字母、数字和下划线</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">显示名称 *</label>
                  <input
                    v-model="tagForm.title"
                    type="text"
                    placeholder="显示给用户的名称，如：VIP用户"
                    required
                    class="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">描述</label>
                  <textarea
                    v-model="tagForm.description"
                    placeholder="标签的描述信息..."
                    rows="3"
                    class="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent resize-none"
                  ></textarea>
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
                      <input
                        v-model="tagForm.background_color"
                        type="text"
                        placeholder="#FF5CA3"
                        class="flex-1 w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
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
                      <input
                        v-model="tagForm.text_color"
                        type="text"
                        placeholder="#FFFFFF"
                        class="flex-1 w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

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
            </div>
            <div class="flex gap-3 justify-end px-6 pb-6">
              <button type="button" class="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" @click="closeTagModal">取消</button>
              <button type="submit" form="tag-form" class="px-5 py-2.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed" :disabled="saving">
                <span v-if="saving" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                <span>{{ tagModal.tag ? '保存' : '创建' }}</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Generate Codes Modal -->
    <Teleport to="body">
      <Transition name="dialog-fade">
        <div v-if="codesModal.show" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/20 backdrop-blur-sm" @click="closeCodesModal" />
          <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col animate-dialog-in" @click.stop>
            <div class="relative p-6 pb-4 pr-12">
              <h3 class="text-xl font-semibold text-gray-900">生成兑换码</h3>
              <button type="button" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors" @click="closeCodesModal">
                <XIcon class="w-5 h-5" />
              </button>
            </div>
            <div class="px-6 pb-6 flex-1 overflow-y-auto">
              <div v-if="codesModal.tag" class="mb-4 p-3 bg-gray-50 rounded-lg">
                <p class="text-sm text-gray-600 mb-2">为标签生成兑换码：</p>
                <TagBadge
                  :title="codesModal.tag.title"
                  :background="codesModal.tag.background_color"
                  :text="codesModal.tag.text_color"
                />
              </div>

              <form id="codes-form" @submit.prevent="generateCodes" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">生成数量 *</label>
                  <input
                    v-model="codesForm.count"
                    type="number"
                    placeholder="100"
                    min="1"
                    max="1000"
                    required
                    class="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                  />
                  <p class="text-xs text-gray-500 mt-1">最多一次生成1000个</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">过期时间</label>
                  <input
                    v-model="codesForm.expires_at"
                    type="datetime-local"
                    placeholder="留空表示永不过期"
                    class="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                  />
                </div>
              </form>
            </div>
            <div class="flex gap-3 justify-end px-6 pb-6">
              <button type="button" class="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" @click="closeCodesModal">取消</button>
              <button type="submit" form="codes-form" class="px-5 py-2.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed" :disabled="generating">
                <span v-if="generating" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                <span>生成兑换码</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Generated Codes Modal -->
    <Teleport to="body">
      <Transition name="dialog-fade">
        <div v-if="generatedModal.show" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/20 backdrop-blur-sm" @click="closeGeneratedModal" />
          <div class="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-dialog-in" @click.stop>
            <div class="relative p-6 pb-4 pr-12">
              <h3 class="text-xl font-semibold text-gray-900">兑换码生成成功</h3>
              <button type="button" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors" @click="closeGeneratedModal">
                <XIcon class="w-5 h-5" />
              </button>
            </div>
            <div class="px-6 pb-6 flex-1 overflow-y-auto space-y-4">
              <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p class="text-gray-600">
                  已为标签"{{ generatedModal.tag?.title }}"生成 {{ generatedModal.codes?.length }} 个兑换码
                </p>
                <GlassButton
                  @click="downloadCodes"
                  variant="secondary"
                  class="text-sm"
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
            </div>
            <div class="flex gap-3 justify-end px-6 pb-6">
              <button type="button" class="px-5 py-2.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors shadow-sm" @click="closeGeneratedModal">
                关闭
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <Transition name="dialog-fade">
        <div v-if="deleteModal.show" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/20 backdrop-blur-sm" @click="closeDeleteModal" />
          <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col animate-dialog-in" @click.stop>
            <div class="relative p-6 pb-4 pr-12">
              <h3 class="text-xl font-semibold text-gray-900">确认删除</h3>
              <button type="button" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors" @click="closeDeleteModal">
                <XIcon class="w-5 h-5" />
              </button>
            </div>
            <div class="px-6 pb-6 flex-1 overflow-y-auto">
              <p class="text-gray-600">
                确定要删除标签"{{ deleteModal.tag?.title }}"吗？删除后无法恢复，相关的兑换码也会失效。
              </p>
            </div>
            <div class="flex gap-3 justify-end px-6 pb-6">
              <button type="button" class="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" @click="closeDeleteModal">取消</button>
              <button type="button" class="px-5 py-2.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed" :disabled="deleting" @click="deleteTag">
                <span v-if="deleting" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                <span>确认删除</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Codes List Modal -->
    <Teleport to="body">
      <Transition name="dialog-fade">
        <div v-if="codesListModal.show" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/20 backdrop-blur-sm" @click="closeCodesListModal" />
          <div class="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-dialog-in" @click.stop>
            <div class="relative p-6 pb-4 pr-12">
              <h3 class="text-xl font-semibold text-gray-900">兑换码列表</h3>
              <button type="button" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors" @click="closeCodesListModal">
                <XIcon class="w-5 h-5" />
              </button>
            </div>
            <div class="px-6 pb-6 flex-1 overflow-y-auto space-y-6">
              <div class="flex flex-col sm:flex-row sm:flex-nowrap gap-3 items-center">
                <input
                  v-model="codesFilter.code"
                  type="text"
                  placeholder="搜索兑换码..."
                  class="flex-1 w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
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
                  class="toolbar-button"
                >
                  搜索
                </GlassButton>

                <GlassButton
                  @click="bulkDeleteSelected"
                  :disabled="!selectedIds.length"
                  variant="secondary"
                  class="toolbar-button !text-red-600 hover:!bg-red-50"
                  title="批量删除未使用的兑换码（仅删除未使用，已使用会跳过）"
                >
                  批量删除
                </GlassButton>

                <div class="ml-auto flex items-center gap-2 text-sm text-gray-600">
                  <span>每页显示:</span>
                  <select
                    v-model.number="codesPageSize"
                    @change="changeCodesPageSize"
                    class="glass-input px-2 py-1 text-sm"
                  >
                    <option :value="20">20</option>
                    <option :value="50">50</option>
                    <option :value="100">100</option>
                    <option :value="500">500</option>
                  </select>
                  <span>条</span>
                </div>
              </div>

              <div v-if="loadingCodes" class="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>

              <div v-else-if="!codes.length" class="text-center py-12">
                <div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TicketIcon class="w-8 h-8 text-white" />
                </div>
                <h3 class="text-lg font-semibold text-gray-800 mb-2">暂无兑换码</h3>
                <p class="text-gray-600">点击"生成兑换码"来创建第一个兑换码</p>
              </div>

              <div v-else class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-3 text-left w-10">
                        <input
                          type="checkbox"
                          :checked="allSelectableSelected"
                          @change="toggleSelectAll($event)"
                        >
                      </th>
                      <th class="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">兑换码</th>
                      <th class="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">标签</th>
                      <th class="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">状态</th>
                      <th class="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">使用者</th>
                      <th class="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">过期时间</th>
                      <th class="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">创建时间</th>
                      <th class="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">操作</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                    <tr v-for="code in codes" :key="code.id" class="hover:bg-gray-50">
                      <td class="px-4 py-3">
                        <input type="checkbox" :value="code.id" v-model="selectedIds" :disabled="code.is_used">
                      </td>
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
                      <td class="px-4 py-3 whitespace-nowrap">
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
                        <span class="block truncate max-w-[220px]">{{ codeUserLabel(code) }}</span>
                      </td>
                      <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {{ code.expires_at ? formatDate(code.expires_at) : '永不过期' }}
                      </td>
                      <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
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
                        <GlassButton
                          v-if="!code.is_used"
                          @click="confirmDeleteCode(code)"
                          class="!p-1 text-xs !text-red-600 hover:!bg-red-50"
                          variant="secondary"
                        >
                          删除
                        </GlassButton>
                      </td>
                    </tr>
                  </tbody>
                </table>

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
            </div>
            <div class="flex gap-3 justify-end px-6 pb-6">
              <button type="button" class="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" @click="closeCodesListModal">关闭</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Code Details Modal -->
    <Teleport to="body">
      <Transition name="dialog-fade">
        <div v-if="codeDetailsModal.show" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/20 backdrop-blur-sm" @click="closeCodeDetailsModal" />
          <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col animate-dialog-in" @click.stop>
            <div class="relative p-6 pb-4 pr-12">
              <h3 class="text-xl font-semibold text-gray-900">兑换码详情</h3>
              <button type="button" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors" @click="closeCodeDetailsModal">
                <XIcon class="w-5 h-5" />
              </button>
            </div>
            <div class="px-6 pb-6 flex-1 overflow-y-auto">
              <div v-if="codeDetailsModal.code" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">兑换码</label>
                  <code class="block text-sm bg-gray-100 px-3 py-2 rounded font-mono">{{ codeDetailsModal.code.code }}</code>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">使用者</label>
                  <div class="text-sm text-gray-600">
                    <template v-if="codeDetailsModal.code.used_by">
                      <NuxtLink
                        :to="`/users/id/${codeDetailsModal.code.used_by}`"
                        class="text-brand-600 hover:text-brand-700 hover:underline"
                      >
                        {{ codeUserLabel(codeDetailsModal.code) }}
                      </NuxtLink>
                    </template>
                    <span v-else>-</span>
                  </div>
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
            </div>
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 pb-6">
              <button
                v-if="codeDetailsModal.code && !codeDetailsModal.code.is_used"
                type="button"
                class="px-5 py-2.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors shadow-sm"
                @click="confirmDeleteCode(codeDetailsModal.code)"
              >
                删除兑换码
              </button>
              <div class="sm:ml-auto">
                <button type="button" class="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" @click="closeCodeDetailsModal">
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
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
  DownloadIcon,
  XIcon
} from 'lucide-vue-next'
import TagBadge from '~/components/ui/TagBadge.vue'
import type { TagDto, RedemptionCodeDto, Pagination, User } from '~/types'

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

const isAnyModalOpen = computed(() =>
  tagModal.show ||
  codesModal.show ||
  generatedModal.show ||
  deleteModal.show ||
  codesListModal.show ||
  codeDetailsModal.show
)

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    if (tagModal.show) {
      closeTagModal()
    } else if (codesModal.show) {
      closeCodesModal()
    } else if (generatedModal.show) {
      closeGeneratedModal()
    } else if (deleteModal.show) {
      closeDeleteModal()
    } else if (codesListModal.show) {
      closeCodesListModal()
    } else if (codeDetailsModal.show) {
      closeCodeDetailsModal()
    }
  }
}

// Codes related state
const codes = ref<RedemptionCodeDto[]>([])
const codesData = ref<Pagination<RedemptionCodeDto> | null>(null)
const loadingCodes = ref(false)
// Cache user info by id for display
const userCache = ref<Record<string, User | null>>({})
// Selection for bulk delete
const selectedIds = ref<string[]>([])
// Page size for codes list
const codesPageSize = ref<number>(20)

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

// Refresh global codes stats (totals across all)
const refreshCodesStats = async () => {
  try {
    const api = useApi()
    const [allResp, usedResp] = await Promise.all([
      api.listCodes({ page: 1, page_size: 1 }),
      api.listCodes({ used: true as any, page: 1, page_size: 1 })
    ])
    totalCodes.value = allResp.total
    usedCodes.value = usedResp.total
  } catch {}
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
  const { confirm } = useAdminDialog()
  const nextState = !tag.is_active
  const confirmed = await confirm({
    title: nextState ? '确认启用' : '确认停用',
    message: `确定要${nextState ? '启用' : '停用'}标签"${tag.title}"吗?`,
    confirmText: nextState ? '确认启用' : '确认停用',
    cancelText: '取消'
  })

  if (!confirmed) return

  try {
    const api = useApi()
    await api.updateTag(tag.id, {
      name: tag.name,
      title: tag.title,
      description: tag.description,
      background_color: tag.background_color,
      text_color: tag.text_color,
      is_active: nextState
    })

    tag.is_active = nextState
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

const closeDeleteModal = () => {
  deleteModal.show = false
  deleteModal.tag = null
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
    closeDeleteModal()
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
  await Promise.all([loadCodes(1), refreshCodesStats()])
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
    // 公共过滤参数
    const base: any = {}
    if (codesFilter.code) base.code = codesFilter.code
    if (codesFilter.tag_id) base.tag_id = codesFilter.tag_id
    if (codesFilter.used) base.used = codesFilter.used === 'true'

    const desired = codesPageSize.value
    const serverMax = 100 // 后端单页上限（经验值）。超过则前端拼接多页

    let total = 0
    let pageItems: RedemptionCodeDto[] = []

    if (desired <= serverMax) {
      const data = await api.listCodes({ ...base, page, page_size: desired })
      total = data.total
      pageItems = data.items
      codesData.value = { ...data, page_size: desired }
    } else {
      // 聚合多页: 计算起始位置
      // 0-based
      const startIndex = (page - 1) * desired
      const startServerPage = Math.floor(startIndex / serverMax) + 1
      const offsetInFirst = startIndex % serverMax

      // 先查起始页，拿到总数
      const first = await api.listCodes({ ...base, page: startServerPage, page_size: serverMax })
      total = first.total
      let items = first.items.slice(offsetInFirst)

      // 继续拉取后续页直到够 desired 或没有更多
      let current = startServerPage + 1
      while (items.length < desired && (current - 1) * serverMax < total) {
        const next = await api.listCodes({ ...base, page: current, page_size: serverMax })
        if (!next.items.length) break
        items = items.concat(next.items)
        current++
      }
      pageItems = items.slice(0, desired)
      codesData.value = {
        total,
        items: pageItems,
        page,
        page_size: desired,
      }
    }

    // 合并标签并预加载用户
    const tagMap = new Map(tags.value.map((t: TagDto) => [t.id, t]))
    codes.value = pageItems.map((c: RedemptionCodeDto) => ({ ...c, tag: c.tag || tagMap.get(c.tag_id) }))
    await preloadUsersForCodes(codes.value)

    // 更新全局统计
    await refreshCodesStats()
  } catch (error: any) {
    toast.error('加载兑换码列表失败')
  } finally {
    loadingCodes.value = false
  }
}

// 预加载 codes 列表中出现的使用者用户名
const preloadUsersForCodes = async (list: RedemptionCodeDto[]) => {
  const ids = Array.from(new Set(list.map(c => c.used_by).filter(Boolean))) as string[]
  const remain = ids.filter(id => !(id in userCache.value))
  if (!remain.length) return
  const api = useApi()
  await Promise.all(remain.map(async (id) => {
    try {
      const u = await api.getUser(id)
      userCache.value[id] = u
    } catch {
      userCache.value[id] = null
    }
  }))
}

const codeUserLabel = (code: RedemptionCodeDto) => {
  if (!code.used_by) return '-'
  const u = userCache.value[code.used_by]
  if (u === undefined) return '加载中...'
  if (!u) return `用户 ${code.used_by.slice(0, 8)}`
  return u.display_name || u.username || `用户 ${u.id.slice(0, 8)}`
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

const changeCodesPageSize = () => {
  selectedIds.value = []
  loadCodes(1)
}

const allSelectableSelected = computed(() => {
  const selectable = codes.value.filter(c => !c.is_used).map(c => c.id)
  return selectable.length > 0 && selectable.every(id => selectedIds.value.includes(id))
})

const toggleSelectAll = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.checked) {
    const selectable = codes.value.filter(c => !c.is_used).map(c => c.id)
    // 合并去重，仅当前页
    const set = new Set(selectedIds.value)
    selectable.forEach(id => set.add(id))
    selectedIds.value = Array.from(set)
  } else {
    // 移除当前页的可选项
    const current = new Set(codes.value.filter(c => !c.is_used).map(c => c.id))
    selectedIds.value = selectedIds.value.filter(id => !current.has(id))
  }
}

const bulkDeleteSelected = async () => {
  if (!selectedIds.value.length) return
  const { confirm } = useAdminDialog()
  if (!await confirm({
    title: '确认删除',
    message: `确定删除选中的 ${selectedIds.value.length} 个兑换码？仅未使用的会被删除。`,
    confirmText: '确认删除',
    cancelText: '取消'
  })) return
  try {
    const api = useApi()
    const res = await api.deleteRedemptionCodes({ ids: selectedIds.value })
    if (res.deleted > 0) {
      toast.success(`已删除 ${res.deleted} 个兑换码`)
    } else {
      toast.info('没有可删除的兑换码（可能均已使用）')
    }
    selectedIds.value = []
    await Promise.all([loadCodes(codesData.value?.page || 1), refreshCodesStats()])
  } catch (e) {
    toast.error('批量删除失败')
  }
}

const viewCodeDetails = async (code: RedemptionCodeDto) => {
  try {
    const api = useApi()
    // 获取完整的兑换码详情
    const detailCode = await api.getCodeByCode(code.code)
    // 合并本地标签信息，启用 TagBadge 预览
    const tag = tags.value.find(t => t.id === detailCode.tag_id)
    codeDetailsModal.code = { ...detailCode, tag }
    // 预加载详情使用者
    if (detailCode.used_by && !(detailCode.used_by in userCache.value)) {
      try { userCache.value[detailCode.used_by] = await api.getUser(detailCode.used_by) } catch { userCache.value[detailCode.used_by] = null }
    }
    codeDetailsModal.show = true
  } catch (error: any) {
    toast.error('获取兑换码详情失败')
  }
}

const closeCodeDetailsModal = () => {
  codeDetailsModal.show = false
  codeDetailsModal.code = null
}

// Delete a single redemption code (unused only)
const confirmDeleteCode = async (code: RedemptionCodeDto) => {
  if (code.is_used) return
  const { confirm } = useAdminDialog()
  if (!await confirm({
    title: '确认删除',
    message: '确定要删除该兑换码吗？仅未使用的兑换码可删除',
    confirmText: '确认删除',
    cancelText: '取消'
  })) return
  try {
    const api = useApi()
    const res = await api.deleteRedemptionCodes({ ids: [code.id] })
    if (res.deleted > 0) {
      toast.success('兑换码已删除')
      await loadCodes(codesData.value?.page || 1)
    } else {
      toast.info('兑换码未删除（可能已被使用）')
    }
  } catch (e) {
    toast.error('删除兑换码失败')
  }
}

watch(isAnyModalOpen, (open) => {
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

// Initialize
onMounted(() => {
  loadTags()
  refreshCodesStats()
})

// SEO
useHead({
  title: '标签管理 - 郑州四中表白墙',
  meta: [
    { name: 'description', content: '创建标签和生成兑换码' }
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
