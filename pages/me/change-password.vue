<template>
  <div class="max-w-2xl mx-auto">
    <GlassCard class="p-8">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="page-title">修改密码</h1>
        <p class="text-gray-600 mt-2">
          为了保护您的账户安全，请定期更换密码
        </p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Current Password -->
        <div>
          <label for="oldPassword" class="block text-sm font-medium text-gray-700 mb-2">
            当前密码 *
          </label>
          <GlassInput
            id="oldPassword"
            v-model="form.old_password"
            type="password"
            placeholder="请输入当前密码"
            :error="errors.old_password"
            required
          />
        </div>

        <!-- New Password -->
        <div>
          <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-2">
            新密码 *
          </label>
          <GlassInput
            id="newPassword"
            v-model="form.new_password"
            type="password"
            placeholder="请输入新密码（至少6位）"
            :error="errors.new_password"
            required
          />
          <p class="text-xs text-gray-500 mt-1">
            密码长度至少6位，建议包含数字、字母和特殊字符
          </p>
        </div>

        <!-- Confirm Password -->
        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
            确认新密码 *
          </label>
          <GlassInput
            id="confirmPassword"
            v-model="form.confirm_password"
            type="password"
            placeholder="请再次输入新密码"
            :error="errors.confirm_password"
            required
          />
        </div>

        <!-- Submit Buttons -->
        <div class="flex gap-4 pt-6">
          <GlassButton
            type="button"
            class="glass-button-secondary flex-1"
            @click="$router.back()"
          >
            取消
          </GlassButton>
          
          <GlassButton
            type="submit"
            class="flex-1"
            :disabled="!isFormValid || loading"
            :loading="loading"
          >
            {{ loading ? '修改中...' : '修改密码' }}
          </GlassButton>
        </div>
      </form>
    </GlassCard>

    <!-- Security Tips -->
    <GlassCard class="mt-6 p-6">
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0">
          <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <ShieldIcon class="w-4 h-4 text-blue-600" />
          </div>
        </div>
        <div>
          <h3 class="font-medium text-gray-900 mb-2">密码安全建议</h3>
          <ul class="text-sm text-gray-600 space-y-1">
            <li>• 使用至少8位字符，包含大小写字母、数字和特殊字符</li>
            <li>• 不要使用与个人信息相关的密码</li>
            <li>• 定期更换密码，建议3-6个月更换一次</li>
            <li>• 不要在多个网站使用相同密码</li>
            <li>• 妥善保管密码，不要告诉他人</li>
          </ul>
        </div>
      </div>
    </GlassCard>
  </div>
</template>

<script setup lang="ts">
import { ShieldIcon } from 'lucide-vue-next'
import { z } from 'zod'
import GlassInput from '~/components/ui/GlassInput.vue'
import type { ChangePasswordForm } from '~/types'

definePageMeta({
  title: '修改密码 - Love Wall',
  middleware: ['auth']
})

// Form schema
const passwordSchema = z.object({
  old_password: z.string().min(1, '请输入当前密码'),
  new_password: z.string().min(6, '新密码至少需要6位字符'),
  confirm_password: z.string().min(1, '请确认新密码'),
}).superRefine((data, ctx) => {
  if (data.new_password !== data.confirm_password) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '两次输入的新密码不一致',
      path: ['confirm_password']
    })
  }
  if (data.old_password === data.new_password) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '新密码不能与当前密码相同',
      path: ['new_password']
    })
  }
})

// State
const form = reactive<ChangePasswordForm>({
  old_password: '',
  new_password: '',
  confirm_password: '',
})

const errors = reactive<Partial<Record<keyof ChangePasswordForm, string>>>({})
const loading = ref(false)

// Stores
const api = useApi()
const toast = useToast()
const router = useRouter()

// Computed
const isFormValid = computed(() => {
  return form.old_password.trim() && 
         form.new_password.trim() && 
         form.confirm_password.trim() && 
         form.new_password.length >= 6 && 
         form.new_password === form.confirm_password &&
         form.old_password !== form.new_password
})

// Validate form
const validateForm = () => {
  try {
    passwordSchema.parse(form)
    // Clear errors
    Object.keys(errors).forEach(key => delete errors[key as keyof ChangePasswordForm])
    return true
  } catch (err: any) {
    // Set field errors
    Object.keys(errors).forEach(key => delete errors[key as keyof ChangePasswordForm])
    if (err.errors) {
      err.errors.forEach((error: any) => {
        errors[error.path[0] as keyof ChangePasswordForm] = error.message
      })
    }
    return false
  }
}

// Handle form submission
const handleSubmit = async () => {
  if (!validateForm() || loading.value) return
  
  loading.value = true
  
  try {
    await api.changePassword(form)
    
    toast.success('密码修改成功！请重新登录')
    
    // 清空表单
    form.old_password = ''
    form.new_password = ''
    form.confirm_password = ''
    
    // 延迟跳转，让用户看到成功提示
    setTimeout(() => {
      router.push('/me')
    }, 2000)
    
  } catch (err: any) {
    console.error('Change password failed:', err)
    if (err.message?.includes('password')) {
      errors.old_password = '当前密码不正确'
    } else {
      toast.error(err.message || '密码修改失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

// Real-time validation
watch(form, () => {
  // 实时清除错误，让用户能够立即看到按钮状态变化
  if (Object.keys(errors).length > 0) {
    validateForm()
  }
}, { deep: true })

// SEO
useHead({
  title: '修改密码 - Love Wall',
  meta: [
    { name: 'description', content: '修改您的账户密码' }
  ]
})
</script>