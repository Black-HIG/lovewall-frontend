<template>
  <div v-if="announcements.length > 0" class="bg-gradient-to-r from-brand-500 to-purple-600 text-white">
    <div class="content-container">
      <div class="py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <MegaphoneIcon class="w-5 h-5 flex-shrink-0" />
            <div class="min-w-0 flex-1">
              <!-- Single announcement -->
              <div v-if="announcements.length === 1" class="text-sm">
                <span class="font-medium">{{ announcements[0].title }}</span>
                <span v-if="announcements[0].content" class="ml-2">
                  {{ announcements[0].content }}
                </span>
              </div>

              <!-- Multiple announcements carousel -->
              <div v-else class="relative overflow-hidden h-5">
                <div
                  class="flex transition-transform duration-500 ease-in-out"
                  :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
                >
                  <div
                    v-for="(announcement, index) in announcements"
                    :key="announcement.id"
                    class="w-full flex-shrink-0 text-sm"
                  >
                    <span class="font-medium">{{ announcement.title }}</span>
                    <span v-if="announcement.content" class="ml-2">
                      {{ announcement.content }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Close button -->
          <button
            class="flex-shrink-0 ml-4 text-white/80 hover:text-white transition-colors"
            @click="dismissed = true"
          >
            <XIcon class="w-4 h-4" />
          </button>
        </div>

        <!-- Pagination dots for multiple announcements -->
        <div
          v-if="announcements.length > 1"
          class="flex justify-center gap-1 mt-2"
        >
          <button
            v-for="(_, index) in announcements"
            :key="index"
            :class="[
              'w-1.5 h-1.5 rounded-full transition-all',
              index === currentIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/70'
            ]"
            @click="currentIndex = index"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MegaphoneIcon, XIcon } from 'lucide-vue-next'
import type { AnnouncementDto } from '~/types'

interface Props {
  announcements: AnnouncementDto[]
}

const props = defineProps<Props>()

const currentIndex = ref(0)
const dismissed = ref(false)

// Auto-rotate through announcements
let rotationInterval: NodeJS.Timeout | null = null

onMounted(() => {
  if (props.announcements.length > 1) {
    rotationInterval = setInterval(() => {
      currentIndex.value = (currentIndex.value + 1) % props.announcements.length
    }, 4000) // Change every 4 seconds
  }
})

onUnmounted(() => {
  if (rotationInterval) {
    clearInterval(rotationInterval)
  }
})

// Filter out dismissed announcements
const announcements = computed(() => {
  return dismissed.value ? [] : props.announcements
})
</script>
