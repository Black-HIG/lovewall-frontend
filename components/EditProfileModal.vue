<template>
  <GlassModal
    :is-open="isOpen"
    title="编辑个人资料"
    max-width="max-w-2xl"
    @close="closeModal"
  >
    <!-- Form -->
    <form @submit.prevent="handleSubmit">
      <div class="space-y-6">
          <!-- Avatar -->
          <div class="flex flex-col items-center space-y-4">
            <div class="relative">
              <div class="w-24 h-24 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                <img
                  v-if="avatarPreview || user?.avatar_url"
                  :src="avatarPreview || user?.avatar_url"
                  :alt="user?.display_name || user?.username"
                  class="w-24 h-24 object-cover"
                >
                <span v-else>
                  {{ (user?.display_name || user?.username || '').slice(0, 2) }}
                </span>
              </div>
              
              <!-- Camera Icon Overlay -->
              <label
                for="avatar-upload"
                class="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
              >
                <CameraIcon class="w-6 h-6 text-white" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleAvatarChange"
              >
            </div>
            <p class="text-sm text-gray-600">点击头像可更换</p>
          </div>

          <!-- Display Name -->
          <div>
            <label for="display_name" class="block text-sm font-medium text-gray-700 mb-2">
              显示名称
            </label>
            <GlassInput
              id="display_name"
              v-model="form.display_name"
              placeholder="请输入显示名称（可选）"
              :error="errors.display_name"
            />
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              邮箱
            </label>
            <GlassInput
              id="email"
              v-model="form.email"
              type="email"
              placeholder="请输入邮箱地址（可选）"
              :error="errors.email"
            />
          </div>

          <!-- Phone -->
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
              手机号
            </label>
            <GlassInput
              id="phone"
              v-model="form.phone"
              placeholder="请输入手机号（可选）"
              :error="errors.phone"
            />
          </div>

          <!-- Bio -->
          <div>
            <label for="bio" class="block text-sm font-medium text-gray-700 mb-2">
              个人简介
            </label>
            <GlassTextarea
              id="bio"
              v-model="form.bio"
              placeholder="介绍一下你自己吧（可选）"
              rows="4"
              :max-length="500"
              :error="errors.bio"
            />
            <p class="mt-1 text-sm text-gray-500">{{ form.bio?.length || 0 }} / 500</p>
          </div>
      </div>
    </form>

    <template #footer>
      <div class="flex justify-end gap-3">
        <button
          type="button"
          class="glass-button-secondary"
          @click="closeModal"
        >
          取消
        </button>
        <button
          type="submit"
          class="glass-button"
          :disabled="loading"
          @click="handleSubmit"
        >
          <LoadingSpinner v-if="loading" size="sm" class="mr-2" />
          保存
        </button>
      </div>
    </template>
  </GlassModal>
</template>

<script setup lang="ts">
import { CameraIcon } from 'lucide-vue-next'
import GlassModal from '~/components/ui/GlassModal.vue'
import GlassInput from '~/components/ui/GlassInput.vue'
import GlassTextarea from '~/components/ui/GlassTextarea.vue'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import type { User, UpdateProfileForm } from '~/types'

interface Props {
  isOpen: boolean
  user: User | null
}

interface Emits {
  (e: 'close'): void
  (e: 'updated', user: User): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const loading = ref(false)
const avatarPreview = ref<string | null>(null)
const form = reactive<UpdateProfileForm & { display_name: string; email: string; phone: string; bio: string }>({
  display_name: '',
  email: '',
  phone: '',
  bio: '',
  avatar: null
})

const errors = reactive({
  display_name: '',
  email: '',
  phone: '',
  bio: ''
})

// Methods
const resetForm = () => {
  if (props.user) {
    form.display_name = props.user.display_name || ''
    form.email = props.user.email || ''
    form.phone = props.user.phone || ''
    form.bio = props.user.bio || ''
  }
  form.avatar = null
  avatarPreview.value = null
  Object.keys(errors).forEach(key => {
    (errors as any)[key] = ''
  })
}

const closeModal = () => {
  resetForm()
  emit('close')
}

const validateForm = () => {
  // Reset errors
  Object.keys(errors).forEach(key => {
    (errors as any)[key] = ''
  })

  let isValid = true

  // Validate email
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = '请输入有效的邮箱地址'
    isValid = false
  }

  // Validate phone
  if (form.phone && !/^1[3-9]\d{9}$/.test(form.phone)) {
    errors.phone = '请输入有效的手机号'
    isValid = false
  }

  // Validate bio length
  if (form.bio && form.bio.length > 500) {
    errors.bio = '个人简介不能超过500字'
    isValid = false
  }

  return isValid
}

const handleAvatarChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return

  // Validate file type
  if (!file.type.startsWith('image/')) {
    useToast().error('请选择图片文件')
    return
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    useToast().error('图片文件不能超过5MB')
    return
  }

  form.avatar = file

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    avatarPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true
  
  try {
    const api = useApi()
    const auth = useAuthStore()
    
    // Prepare update data
    const updateData: UpdateProfileForm = {}
    
    // Only include fields that have changed
    if (form.display_name !== (props.user?.display_name || '')) {
      updateData.display_name = form.display_name || null
    }
    if (form.email !== (props.user?.email || '')) {
      updateData.email = form.email || null
    }
    if (form.phone !== (props.user?.phone || '')) {
      updateData.phone = form.phone || null
    }
    if (form.bio !== (props.user?.bio || '')) {
      updateData.bio = form.bio || null
    }
    if (form.avatar) {
      updateData.avatar = form.avatar
    }

    // If no changes, just close
    if (Object.keys(updateData).length === 0) {
      closeModal()
      return
    }

    const updatedUser = await api.updateProfile(updateData)
    
    // Update auth store
    auth.setCurrentUser(updatedUser)
    
    useToast().success('个人资料更新成功')
    emit('updated', updatedUser)
    closeModal()
  } catch (error: any) {
    console.error('Update profile error:', error)
    useToast().error('更新失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// Watch for modal open to reset form
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    resetForm()
  }
}, { immediate: true })
</script>