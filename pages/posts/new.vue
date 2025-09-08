<template>
  <div class="w-full">
    <div class="max-w-4xl mx-auto">
      <GlassCard class="p-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="page-title">发布表白</h1>
          <p class="text-gray-600 text-center">
            勇敢地说出你的心声，让爱传递出去 💕
          </p>
        </div>

        <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Confessor Mode Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">
            表白者身份选择 *
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
            表白者昵称 *
          </label>
          <GlassInput
            id="authorName"
            v-model="form.author_name"
            type="text"
            placeholder="请输入您的昵称（可以是真名或匿名）"
            :error="errors.author_name"
            :required="form.confessor_mode === 'custom'"
          />
        </div>

        <!-- Target Name -->
        <div>
          <label for="targetName" class="block text-sm font-medium text-gray-700 mb-2">
            表白对象 *
          </label>
          <GlassInput
            id="targetName"
            v-model="form.target_name"
            type="text"
            placeholder="请输入TA的昵称"
            :error="errors.target_name"
            required
          />
        </div>

        <!-- Content -->
        <div>
          <label for="content" class="block text-sm font-medium text-gray-700 mb-2">
            表白内容 *
          </label>
          <GlassTextarea
            id="content"
            v-model="form.content"
            :rows="8"
            :max-length="1000"
            placeholder="写下你想对TA说的话..."
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
              'relative border-2 border-dashed rounded-xl p-6 text-center transition-all',
              dragover ? 'border-brand-500 bg-brand-50/50' : 'border-white/30 hover:border-brand-300'
            ]"
            @drop.prevent="handleDrop"
            @dragover.prevent="dragover = true"
            @dragleave.prevent="dragover = false"
          >
            <!-- Preview Image -->
            <div v-if="imagePreview" class="relative inline-block">
              <img
                :src="imagePreview"
                alt="预览图片"
                class="max-w-full max-h-64 rounded-lg"
              />
              <button
                type="button"
                @click="removeImage"
                class="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <XIcon class="w-4 h-4" />
              </button>
            </div>

            <!-- Upload Prompt -->
            <div v-else class="space-y-2">
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
                  支持 JPG、PNG、WebP、GIF 格式，最大 10MB
                </p>
              </div>
            </div>

            <!-- Hidden File Input -->
            <input
              ref="fileInput"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              class="hidden"
              @change="handleFileSelect"
            />
          </div>
          
          <p v-if="errors.image" class="mt-1 text-sm text-red-500">
            {{ errors.image }}
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
            {{ loading ? '发布中...' : '发布表白' }}
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
  target_name: z.string().min(1, '请输入表白对象').max(50, '昵称不能超过50个字符'),
  content: z.string().min(1, '请输入表白内容').max(1000, '表白内容不能超过1000个字符'),
  confessor_mode: z.enum(['self', 'custom']).default('custom'),
}).superRefine((data, ctx) => {
  // 当模式为 custom 时，author_name 是必需的
  if (data.confessor_mode === 'custom' && (!data.author_name || data.author_name.trim().length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '请输入表白者昵称',
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
})

// State
const cookies = useSessionCookies()
const form = reactive<PostForm & { confessor_mode: 'self' | 'custom' }>({
  author_name: '',
  target_name: '',
  content: '',
  image: null,
  confessor_mode: 'custom', // 默认为自定义模式
})

const errors = reactive<Partial<Record<keyof PostForm, string>>>({})
const loading = ref(false)
const dragover = ref(false)
const imagePreview = ref<string>('')

// Stores
const auth = useAuthStore()
const api = useApi()
const toast = useToast()
const router = useRouter()

// Computed
const isFormValid = computed(() => {
  const baseValid = form.target_name && form.content && Object.keys(errors).length === 0
  if (form.confessor_mode === 'custom') {
    return baseValid && form.author_name
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
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processImage(file)
  }
}

// Handle drag and drop
const handleDrop = (event: DragEvent) => {
  dragover.value = false
  const file = event.dataTransfer?.files[0]
  if (file) {
    processImage(file)
  }
}

// Process selected image
const processImage = (file: File) => {
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    errors.image = '不支持的图片格式，请选择 JPG、PNG、WebP 或 GIF 格式'
    const toast = useToast()
    toast.error('不支持的图片格式，请选择 JPG、PNG、WebP 或 GIF 格式')
    return
  }

  // Validate file size (10MB)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    errors.image = '图片大小不能超过 10MB'
    const toast = useToast()
    toast.error('图片大小不能超过 10MB')
    return
  }

  // Clear previous error
  delete errors.image

  // Set file and create preview
  form.image = file
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

// Remove image
const removeImage = () => {
  form.image = null
  imagePreview.value = ''
  delete errors.image
  if (fileInput.value) {
    fileInput.value.value = ''
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
    
    formData.append('target_name', form.target_name)
    formData.append('content', form.content)
    formData.append('confessor_mode', form.confessor_mode)
    
    if (form.image) {
      formData.append('image', form.image)
    }

    // Submit post
    const newPost = await api.createPost(formData)
    
    toast.success('表白发布成功！')
    
    // Redirect to post detail or home
    await router.push(`/posts/${newPost.id}`)
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
  title: '发布表白 - Love Wall',
  description: '发布您的表白内容',
  middleware: ['auth'],
})
</script>
