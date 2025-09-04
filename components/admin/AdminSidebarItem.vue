<template>
  <NuxtLink 
    :to="to"
    class="group flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-white/20 hover:shadow-glow-sm"
    :class="{ 'bg-white/15 shadow-glow-sm': isActive }"
    exact-active-class="bg-brand-500/20 text-brand-700 shadow-glow"
  >
    <!-- 图标 -->
    <div class="w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center group-hover:scale-110 transition-transform"
         :class="iconBgClass">
      <component :is="iconComponent" class="w-4 h-4 text-white" />
    </div>
    
    <!-- 内容 -->
    <div class="flex-1 min-w-0">
      <div class="font-medium text-gray-800 group-hover:text-brand-700 transition-colors">
        {{ title }}
      </div>
      <div class="text-xs text-gray-500 truncate">{{ description }}</div>
    </div>

    <!-- 活跃指示器 -->
    <div v-if="isActive" class="w-2 h-2 bg-brand-500 rounded-full"></div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { 
  LayoutDashboardIcon,
  FileTextIcon,
  UsersIcon,
  MessageSquareIcon,
  MegaphoneIcon,
  TagIcon,
  SettingsIcon
} from 'lucide-vue-next'

interface Props {
  to: string
  icon: string
  title: string
  description: string
}

const props = defineProps<Props>()
const route = useRoute()

const isActive = computed(() => {
  if (props.to === '/admin') {
    return route.path === '/admin'
  }
  return route.path.startsWith(props.to)
})

// 图标组件映射
const iconComponents = {
  LayoutDashboard: LayoutDashboardIcon,
  FileText: FileTextIcon,
  Users: UsersIcon,
  MessageSquare: MessageSquareIcon,
  Megaphone: MegaphoneIcon,
  Tag: TagIcon,
  Settings: SettingsIcon,
}

const iconComponent = computed(() => iconComponents[props.icon as keyof typeof iconComponents])

// 图标背景色
const iconBgClass = computed(() => {
  const classes = {
    LayoutDashboard: 'from-blue-400 to-blue-600',
    FileText: 'from-brand-400 to-brand-600', 
    Users: 'from-green-400 to-green-600',
    MessageSquare: 'from-purple-400 to-purple-600',
    Megaphone: 'from-yellow-400 to-yellow-600',
    Tag: 'from-indigo-400 to-indigo-600',
    Settings: 'from-gray-400 to-gray-600',
  }
  return classes[props.icon as keyof typeof classes] || 'from-gray-400 to-gray-600'
})
</script>