<template>
  <div class="content-container py-8 flex items-start justify-center overflow-auto relative z-30">
    <div class="w-full max-w-md">
      <div class="glass-card p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="flex justify-center mb-4">
            <div class="p-3 rounded-full bg-gradient-to-r from-brand-500 to-brand-600">
              <UserPlusIcon class="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">加入郑州四中表白墙</h1>
          <p class="text-gray-600">创建您的账户，开始记录美好的表白时刻</p>
        </div>

        <!-- Registration Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">用户名 *</label>
            <GlassInput
              id="username"
              v-model="form.username"
              type="text"
              placeholder="请输入用户名"
              :error="errors.username"
              required
            />
            <p class="mt-1 text-xs text-gray-500">3-20个字符，只能包含字母、数字和下划线</p>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">密码 *</label>
            <GlassInput
              id="password"
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              :show-password-toggle="true"
              :error="errors.password"
              required
            />
            <p class="mt-1 text-xs text-gray-500">至少6个字符</p>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">确认密码 *</label>
            <GlassInput
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              :show-password-toggle="true"
              :error="errors.confirmPassword"
              required
            />
          </div>

          <!-- Terms -->
          <div class="flex items-start gap-3">
            <input
              id="acceptTerms"
              type="checkbox"
              v-model="acceptTerms"
              class="mt-1 w-4 h-4 text-brand-600 bg-white/30 border border-white/20 rounded focus:ring-brand-500 focus:ring-2"
            />
            <label for="acceptTerms" class="text-sm text-gray-600">
              我已阅读并同意
              <a href="#" class="text-brand-600 hover:text-brand-700">服务条款</a>
              和
              <a href="#" class="text-brand-600 hover:text-brand-700">隐私政策</a>
            </label>
          </div>

          <!-- Geetest Captcha -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">安全验证</label>
            <GeetestV4 ref="captchaRef" @verified="onCaptchaVerified" @error="onCaptchaError" />
          </div>

          <!-- Error Message -->
          <div v-if="error" class="p-3 rounded-lg bg-red-50/50 border border-red-200">
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>

          <!-- Submit Button (outlined) -->
          <GlassButton
            type="submit"
            variant="secondary"
            class="w-full"
            @click="handleSubmit"
            :disabled="!isFormValid || !captchaOk || loading"
          >
            {{ loading ? '注册中...' : '创建账户' }}
          </GlassButton>
        </form>

        <!-- Footer -->
        <div class="mt-8 text-center space-y-4">
          <p class="text-sm text-gray-600">
            已有账户？
            <NuxtLink 
              to="/auth/login" 
              class="text-brand-600 hover:text-brand-700 hover:underline ml-1 font-medium"
            >
              立即登录
            </NuxtLink>
          </p>
          
          <NuxtLink
            to="/"
            class="glass-button-secondary text-sm px-3 py-1 inline-flex items-center gap-1"
          >
            <ArrowLeftIcon class="w-4 h-4" />
            返回首页
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UserPlusIcon, ArrowLeftIcon } from 'lucide-vue-next'
import { z } from 'zod'
import GlassInput from '~/components/ui/GlassInput.vue'
import GlassButton from '~/components/ui/GlassButton.vue'
import type { RegisterForm } from '~/types'
import type GeetestV4Type from '~/components/security/GeetestV4.vue'
import GeetestV4 from '~/components/security/GeetestV4.vue'

// Form schema
const registerSchema = z.object({
  username: z.string()
    .min(3, '用户名至少3个字符')
    .max(20, '用户名不能超过20个字符')
    .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),
  password: z.string()
    .min(6, '密码至少6个字符')
    .max(128, '密码不能超过128个字符'),
})

// State
const form = reactive<RegisterForm>({
  username: '',
  password: '',
})

const confirmPassword = ref('')
const acceptTerms = ref(false)
const errors = reactive<Partial<Record<keyof RegisterForm | 'confirmPassword', string>>>({})
const loading = ref(false)
const error = ref('')
const captchaOk = ref(false)
const captchaTokens = ref<any | null>(null)
const captchaRef = ref<InstanceType<typeof GeetestV4Type> | null>(null)

// Stores
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

// Computed（放宽启用条件，避免按钮不可点）
// 仅在必填项非空且已勾选条款时启用按钮；
// 具体格式校验放在 handleSubmit -> validateForm 中进行
const isFormValid = computed(() => !!(
  form.username &&
  form.password &&
  confirmPassword.value &&
  acceptTerms.value
))

// Validate form
const validateForm = () => {
  try {
    // Clear previous errors
    Object.keys(errors).forEach(key => delete errors[key as keyof typeof errors])
    error.value = ''
    
    // Validate basic fields
    registerSchema.parse(form)
    
    // Validate password confirmation
    if (form.password !== confirmPassword.value) {
      errors.confirmPassword = '两次输入的密码不匹配'
      return false
    }
    
    return true
  } catch (err: any) {
    // Set field errors
    if (err.errors) {
      err.errors.forEach((error: any) => {
        errors[error.path[0] as keyof RegisterForm] = error.message
      })
    }
    return false
  }
}

// Handle form submission
const handleSubmit = async () => {
  console.log('[Register] submit clicked')
  if (!validateForm() || loading.value) return
  
  if (!acceptTerms.value) {
    error.value = '请先同意服务条款和隐私政策'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    // Verify Geetest first
    if (!captchaOk.value || !captchaTokens.value) {
      throw new Error('请先完成安全验证')
    }
    const verify = await $fetch<{ success: boolean; error?: string }>('/geetest/validate', {
      method: 'POST',
      body: captchaTokens.value,
    })
    if (!verify.success) {
      captchaOk.value = false
      captchaRef.value?.reset?.()
      throw new Error(verify.error || '安全验证失败')
    }
    console.log('[Register] sending register request', { username: form.username })
    await auth.register(form)
    
    // Redirect to intended destination or home
    const redirect = route.query.redirect as string
    await router.push(redirect || '/')
  } catch (err: any) {
    console.error('[Register] error', err)
    error.value = err.message || '注册失败，请稍后重试'
    
    // Also show toast notification for registration errors
    const toast = useToast()
    toast.error(err.message || '注册失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// Real-time validation
watch([() => form.username, () => form.password, confirmPassword], () => {
  if (Object.keys(errors).length > 0 || error.value) {
    validateForm()
  }
})

// Captcha handlers
const onCaptchaVerified = (tokens: any) => {
  captchaTokens.value = tokens
  captchaOk.value = true
}
const onCaptchaError = (msg: string) => {
  const toast = useToast()
  toast.error(msg || '验证码出错')
  captchaOk.value = false
}

// Redirect if already logged in
watch(
  () => auth.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      const redirect = route.query.redirect as string
      router.push(redirect || '/')
    }
  },
  { immediate: true }
)

// Page meta
definePageMeta({
  title: '注册 - 郑州四中表白墙',
  description: '创建您的郑州四中表白墙账户',
  layout: false, // Use custom layout
})
</script>
