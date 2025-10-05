<template>
  <div class="w-full">
    <div class="max-w-4xl mx-auto">
      <GlassCard class="p-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="page-title">发布表白</h1>
          <p class="text-gray-600 text-center">
            {{ form.card_type === 'communication' ? '分享你的联系方式，寻找志同道合的同学' : '发布你的表白信息' }}
          </p>
        </div>

        <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Card Type Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">
            卡片类型 *
          </label>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label
              :class="[
                'flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all',
                form.card_type === 'confession'
                  ? 'border-brand-500 bg-brand-50/30'
                  : 'border-white/20 hover:border-brand-300'
              ]"
            >
              <input
                type="radio"
                v-model="form.card_type"
                value="confession"
                class="w-5 h-5 text-brand-600"
              />
              <div>
                <div class="font-medium text-gray-900">表白卡</div>
                <div class="text-sm text-gray-500">表达你对TA的心意</div>
              </div>
            </label>

            <label
              :class="[
                'flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all',
                form.card_type === 'communication'
                  ? 'border-brand-500 bg-brand-50/30'
                  : 'border-white/20 hover:border-brand-300'
              ]"
            >
              <input
                type="radio"
                v-model="form.card_type"
                value="communication"
                class="w-5 h-5 text-brand-600"
              />
              <div>
                <div class="font-medium text-gray-900">交流卡</div>
                <div class="text-sm text-gray-500">分享联系方式,寻找同好</div>
              </div>
            </label>
          </div>
        </div>

        <!-- Confessor Mode Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">
            {{ form.card_type === 'communication' ? '交流者身份选择 *' : '表白者身份选择 *' }}
          </label>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label
              :class="[
                'flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all',
                form.confessor_mode === 'self' 
                  ? 'border-brand-500 bg-brand-50/30' 
                  : 'border-white/20 hover:border-brand-300'
              ]"
            >
              <input
                type="radio"
                v-model="form.confessor_mode"
                value="self"
                class="w-5 h-5 text-brand-600"
              />
              <div>
                <div class="font-medium text-gray-900">使用我的昵称</div>
                <div class="text-sm text-gray-500">
                  {{ auth.userDisplayName || auth.currentUser?.username || '用户' }}
                </div>
              </div>
            </label>
            
            <label
              :class="[
                'flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all',
                form.confessor_mode === 'custom' 
                  ? 'border-brand-500 bg-brand-50/30' 
                  : 'border-white/20 hover:border-brand-300'
              ]"
            >
              <input
                type="radio"
                v-model="form.confessor_mode"
                value="custom"
                class="w-5 h-5 text-brand-600"
              />
              <div>
                <div class="font-medium text-gray-900">自定义昵称</div>
                <div class="text-sm text-gray-500">匿名或使用其他名称</div>
              </div>
            </label>
          </div>
        </div>

        <!-- Author Name (only show when custom mode) -->
        <div v-show="form.confessor_mode === 'custom'">
          <label for="authorName" class="block text-sm font-medium text-gray-700 mb-2">
            {{ form.card_type === 'communication' ? '交流者昵称 *' : '表白者昵称 *' }}
          </label>
          <GlassInput
            id="authorName"
            v-model="form.author_name"
            type="text"
            :placeholder="form.card_type === 'communication' ? '请输入您的昵称（可以是真名或匿名）' : '请输入您的昵称（可以是真名或匿名）'"
            :error="errors.author_name"
            :required="form.confessor_mode === 'custom'"
          />
        </div>

        <!-- Target Name (only show for confession card) -->
        <div v-show="form.card_type === 'confession'">
          <label for="targetName" class="block text-sm font-medium text-gray-700 mb-2">
            表白对象 *
          </label>
          <GlassInput
            id="targetName"
            v-model="form.target_name"
            type="text"
            placeholder="请输入TA的昵称"
            :error="errors.target_name"
            :required="form.card_type === 'confession'"
          />
        </div>

        <!-- Content -->
        <div>
          <label for="content" class="block text-sm font-medium text-gray-700 mb-2">
            {{ form.card_type === 'communication' ? '交流内容 *' : '表白内容 *' }}
          </label>
          <GlassTextarea
            id="content"
            v-model="form.content"
            :rows="8"
            :max-length="2000"
            :placeholder="form.card_type === 'communication' ? '分享你的兴趣爱好、联系方式等...' : '写下你想对TA说的话...'"
            :error="errors.content"
            required
          />
        </div>

        <!-- Image Upload -->
        <div>
          <label for="image" class="block text-sm font-medium text-gray-700 mb-2">
            上传图片（可选）
          </label>
          
          <!-- Upload Area -->
          <div
            :class="[
              'relative border-2 border-dashed rounded-xl p-6 transition-all',
              dragover ? 'border-brand-500 bg-brand-50/50' : 'border-white/30 hover:border-brand-300'
            ]"
            @drop.prevent="handleDrop"
            @dragover.prevent="dragover = true"
            @dragleave.prevent="dragover = false"
          >
            <!-- Preview Grid -->
            <div v-if="imagePreviews.length" class="space-y-4">
              <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div
                  v-for="(preview, index) in imagePreviews"
                  :key="`preview-${index}`"
                  class="relative group"
                >
                  <img
                    :src="preview"
                    alt="预览图片"
                    class="w-full h-40 object-cover rounded-lg border border-white/20"
                  />
                  <button
                    type="button"
                    @click="removeImage(index)"
                    class="absolute -top-2 -right-2 p-1 bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <XIcon class="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div class="text-sm text-gray-600 text-center space-y-1">
                <button
                  type="button"
                  @click="fileInput?.click()"
                  class="text-brand-600 hover:text-brand-700 hover:underline font-medium"
                >
                  继续添加图片
                </button>
                <p class="text-xs text-gray-500">已选择 {{ form.images.length }} / 9 张</p>
              </div>
            </div>

            <!-- Upload Prompt -->
            <div v-else class="space-y-2 text-center">
              <ImageIcon class="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <p class="text-sm text-gray-600">
                  拖拽图片到此处，或
                  <button
                    type="button"
                    @click="fileInput?.click()"
                    class="text-brand-600 hover:text-brand-700 hover:underline font-medium ml-1"
                  >
                    点击选择
                  </button>
                </p>
                <p class="text-xs text-gray-500 mt-1">
                  支持 JPG、PNG、WebP、GIF 格式，最多 9 张，单张 ≤ 5MB
                </p>
              </div>
            </div>

            <!-- Hidden File Input -->
            <input
              ref="fileInput"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              class="hidden"
              multiple
              @change="handleFileSelect"
            />
          </div>
          
          <p v-if="errors.images" class="mt-1 text-sm text-red-500">
            {{ errors.images }}
          </p>
        </div>

        <!-- Submit Buttons -->
        <div class="flex gap-4 pt-4">
          <GlassButton
            type="button"
            variant="secondary"
            class="flex-1 h-11 text-base rounded-full inline-flex items-center justify-center gap-2 glass-button-secondary"
            @click="$router.back()"
          >
            取消
          </GlassButton>
          
          <GlassButton
            type="submit"
            variant="secondary"
            class="flex-1 h-11 text-base font-semibold rounded-full inline-flex items-center justify-center gap-2 glass-button-secondary"
            :disabled="!isFormValid || loading"
            @click="handleSubmit"
          >
            <PlusIcon class="w-5 h-5" />
            {{ loading ? '发布中...' : (form.card_type === 'communication' ? '发布交流' : '发布表白') }}
          </GlassButton>
        </div>
      </form>
    </GlassCard>
    </div>

    <!-- Tips Card -->
    <div class="max-w-4xl mx-auto">
      <GlassCard class="mt-6 p-6">
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <LightbulbIcon class="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div>
            <h3 class="font-medium text-gray-900 mb-2">发布小贴士</h3>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• 请使用真诚的语言，让表白更加感人</li>
              <li>• 可以上传一张特别的照片来增加表白的意义</li>
              <li>• 发布后的内容会公开显示，请注意隐私保护</li>
              <li>• 不当内容可能会被管理员隐藏或删除</li>
            </ul>
          </div>
        </div>
      </GlassCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ImageIcon, XIcon, LightbulbIcon, PlusIcon } from 'lucide-vue-next'
import { z } from 'zod'
import GlassInput from '~/components/ui/GlassInput.vue'
import GlassTextarea from '~/components/ui/GlassTextarea.vue'
import type { PostForm } from '~/types'
// DOM refs
const fileInput = ref<HTMLInputElement | null>(null)

// Form schema
const postSchema = z.object({
  author_name: z.string().optional(),
  target_name: z.string().optional(),
  content: z.string().min(1, '内容不能为空').max(2000, '内容不能超过2000个字符'),
  card_type: z.enum(['confession', 'communication']).optional(),
  confessor_mode: z.enum(['self', 'custom']).default('custom'),
}).superRefine((data, ctx) => {
  // 当模式为 custom 时，author_name 是必需的
  if (data.confessor_mode === 'custom' && (!data.author_name || data.author_name.trim().length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '请输入发布者昵称',
      path: ['author_name']
    })
  }
  // 验证长度
  if (data.confessor_mode === 'custom' && data.author_name && data.author_name.length > 50) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '昵称不能超过50个字符',
      path: ['author_name']
    })
  }
  // 表白卡必须有表白对象
  if (data.card_type === 'confession' && (!data.target_name || data.target_name.trim().length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '目标昵称不能为空',
      path: ['target_name']
    })
  }
  // 验证表白对象长度
  if (data.card_type === 'confession' && data.target_name && data.target_name.length > 50) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '昵称不能超过50个字符',
      path: ['target_name']
    })
  }
})

// State
const cookies = useSessionCookies()
const form = reactive<PostForm & { confessor_mode: 'self' | 'custom' }>({
  author_name: '',
  target_name: '',
  content: '',
  card_type: 'confession', // 默认为表白卡
  images: [],
  confessor_mode: 'custom', // 默认为自定义模式
})

const errors = reactive<Partial<Record<keyof PostForm, string>>>({})
const loading = ref(false)
const dragover = ref(false)
const imagePreviews = ref<string[]>([])

// Stores
const auth = useAuthStore()
const api = useApi()
const toast = useToast()
const router = useRouter()

const showImageError = (message: string) => {
  errors.images = message
  toast.error(message)
  if (typeof window !== 'undefined') {
    window.setTimeout(() => {
      if (errors.images === message) {
        delete errors.images
      }
    }, 3000)
  }
}

// Computed
const isFormValid = computed(() => {
  const blockingErrors = Object.entries(errors)
    .filter(([key, value]) => key !== 'images' && !!value)

  // 基础验证：内容不能为空
  let baseValid = form.content && blockingErrors.length === 0

  // 表白卡需要表白对象
  if (form.card_type === 'confession') {
    baseValid = baseValid && !!form.target_name
  }

  // 自定义模式需要昵称
  if (form.confessor_mode === 'custom') {
    return baseValid && !!form.author_name
  }

  return baseValid
})

// Validate form
const validateForm = () => {
  try {
    postSchema.parse(form)
    // Clear errors
    Object.keys(errors).forEach(key => delete errors[key as keyof PostForm])
    return true
  } catch (err: any) {
    // Set field errors
    Object.keys(errors).forEach(key => delete errors[key as keyof PostForm])
    if (err.errors) {
      err.errors.forEach((error: any) => {
        errors[error.path[0] as keyof PostForm] = error.message
      })
    }
    return false
  }
}

// Handle file selection
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const maxFileSize = 5 * 1024 * 1024
const maxImages = 9

const resetFileInput = () => {
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files?.length) {
    await processFiles(files)
  }
  resetFileInput()
}

// Handle drag and drop
const handleDrop = async (event: DragEvent) => {
  dragover.value = false
  const files = event.dataTransfer?.files
  if (files?.length) {
    await processFiles(files)
  }
}

const processFiles = async (files: FileList | File[]) => {
  const incoming = Array.from(files)

  if (form.images.length >= maxImages) {
    showImageError(`最多只能上传 ${maxImages} 张图片`)
    return
  }

  const availableSlots = maxImages - form.images.length
  const filesToProcess = incoming.slice(0, availableSlots)

  for (const file of filesToProcess) {
    if (!allowedTypes.includes(file.type)) {
      showImageError('不支持的图片格式，请选择 JPG、PNG、WebP 或 GIF 格式')
      continue
    }
    if (file.size > maxFileSize) {
      showImageError('单张图片大小不能超过 5MB')
      continue
    }

    form.images.push(file)
    delete errors.images
    imagePreviews.value.push(await fileToDataUrl(file))
  }

  if (incoming.length > filesToProcess.length) {
    showImageError(`最多只能上传 ${maxImages} 张图片`)
  }
}

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = () => reject(new Error('图片预览生成失败'))
    reader.readAsDataURL(file)
  })
}

// Remove image
const removeImage = (index: number) => {
  form.images.splice(index, 1)
  imagePreviews.value.splice(index, 1)
  if (form.images.length === 0) {
    delete errors.images
  }
}

// Handle form submission
const handleSubmit = async () => {
  if (!validateForm() || loading.value) return
  
  loading.value = true
  
  try {
    // Create FormData
    const formData = new FormData()
    
    // 根据模式处理 author_name
    if (form.confessor_mode === 'custom') {
      formData.append('author_name', form.author_name)
    }

    // 只有表白卡才需要表白对象
    if (form.card_type === 'confession' && form.target_name) {
      formData.append('target_name', form.target_name)
    }

    formData.append('content', form.content)
    formData.append('confessor_mode', form.confessor_mode)

    // 添加卡片类型
    if (form.card_type) {
      formData.append('card_type', form.card_type)
    }

    form.images.forEach(image => {
      formData.append('images', image)
    })

    // Submit post
    const newPost = await api.createPost(formData)

    toast.success('帖子已发布，等待审核')

    // Redirect to home page
    await router.push('/')
  } catch (err: any) {
    console.error('Failed to create post:', err)
    toast.error(err.message || '发布失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// Real-time validation
watch(form, () => {
  if (Object.keys(errors).length > 0) {
    validateForm()
  }
})

// Page meta
definePageMeta({
  title: '发布信息 - 郑州四中表白墙',
  description: '发布您的表白内容',
  middleware: ['auth'],
})

useHead({
  title: '发布信息 - 郑州四中表白墙'
})
</script>




