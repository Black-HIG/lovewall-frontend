<template>
  <div class="content-container py-8 flex items-start justify-center overflow-auto relative z-30">
    <div class="w-full max-w-md">
      <div class="glass-card p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="flex justify-center mb-4">
            <div class="p-3 rounded-full bg-gradient-to-r from-brand-500 to-brand-600">
              <HeartIcon class="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">欢迎回来</h1>
          <p class="text-gray-600">登录您的 Love Wall 账户</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">用户名</label>
            <GlassInput
              id="username"
              v-model="form.username"
              type="text"
              placeholder="请输入用户名"
              :error="errors.username"
              required
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">密码</label>
            <GlassInput
              id="password"
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              :show-password-toggle="true"
              :error="errors.password"
              required
            />
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
            :disabled="!isFormValid || loading"
          >
            {{ loading ? '登录中...' : '登录' }}
          </GlassButton>
        </form>

        <!-- Footer -->
        <div class="mt-8 text-center space-y-4">
          <p class="text-sm text-gray-600">
            还没有账户？
            <NuxtLink 
              to="/auth/register" 
              class="text-brand-600 hover:text-brand-700 hover:underline ml-1 font-medium"
            >
              立即注册
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
import { HeartIcon, ArrowLeftIcon } from 'lucide-vue-next'
import GlassButton from '~/components/ui/GlassButton.vue'
import { z } from 'zod'
import GlassInput from '~/components/ui/GlassInput.vue'
import type { LoginForm } from '~/types'

// Form schema
const loginSchema = z.object({
  username: z.string().min(1, '请输入用户名').max(50, '用户名不能超过50个字符'),
  password: z.string().min(1, '请输入密码').min(6, '密码至少6个字符'),
})

// State
const form = reactive<LoginForm>({
  username: '',
  password: '',
})

const errors = reactive<Partial<Record<keyof LoginForm, string>>>({})
const loading = ref(false)
const error = ref('')

// Stores
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

// Computed
const isFormValid = computed(() => !!(form.username && form.password))

// Validate form
const validateForm = () => {
  try {
    loginSchema.parse(form)
    // Clear errors
    Object.keys(errors).forEach(key => delete errors[key as keyof LoginForm])
    error.value = ''
    return true
  } catch (err: any) {
    // Set field errors
    Object.keys(errors).forEach(key => delete errors[key as keyof LoginForm])
    if (err.errors) {
      err.errors.forEach((error: any) => {
        errors[error.path[0] as keyof LoginForm] = error.message
      })
    }
    return false
  }
}

// Handle form submission
const handleSubmit = async () => {
  if (!validateForm() || loading.value) return
  
  loading.value = true
  error.value = ''
  
  try {
    console.log('Attempting login with:', { username: form.username })
    await auth.login(form)
    console.log('Login successful, user:', auth.currentUser)
    
    // Redirect to intended destination or home
    const redirect = route.query.redirect as string
    console.log('Redirecting to:', redirect || '/')
    await router.push(redirect || '/')
  } catch (err: any) {
    console.error('Login error:', err)
    error.value = err.message || '登录失败，请检查用户名和密码'
    
    // Also show toast notification for login errors
    const toast = useToast()
    toast.error(err.message || '登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}

// Real-time validation
watch(form, () => {
  if (Object.keys(errors).length > 0 || error.value) {
    validateForm()
  }
})

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
  title: '登录 - Love Wall',
  description: '登录您的 Love Wall 账户',
  layout: false, // Use custom layout
})</script>
