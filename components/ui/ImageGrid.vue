<template>
  <div v-if="images?.length" class="space-y-3">
    <div :class="gridWrapperClass">
      <div
        v-for="(image, index) in images"
        :key="`${image}-${index}`"
        class="relative"
      >
        <img
          :src="resolveImage(image)"
          :alt="`${altPrefix} ${index + 1}`"
          :class="imageClass"
          loading="lazy"
          @click.stop="openLightbox(index)"
        />
      </div>
    </div>

    <Teleport to="body">
      <transition name="fade">
        <div
          v-if="isLightboxOpen"
          class="fixed inset-0 z-[9000] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          @click="closeLightbox"
        >
          <div class="relative max-w-5xl max-h-[90vh] w-full px-4" @click.stop>
            <img
              :src="resolveImage(currentImage)"
              :alt="`${altPrefix} ${currentIndex + 1}`"
              class="max-w-full max-h-[90vh] mx-auto object-contain rounded-lg"
            />
            <button
              type="button"
              class="absolute top-4 right-4 p-2 text-white bg-black/60 rounded-full hover:bg-black/70 transition"
              @click="closeLightbox"
            >
              <XIcon class="w-5 h-5" />
            </button>

            <button
              v-if="images.length > 1"
              type="button"
              class="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white bg-black/60 rounded-full hover:bg-black/70 transition"
              @click="prevImage"
            >
              <ChevronLeftIcon class="w-6 h-6" />
            </button>
            <button
              v-if="images.length > 1"
              type="button"
              class="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white bg-black/60 rounded-full hover:bg-black/70 transition"
              @click="nextImage"
            >
              <ChevronRightIcon class="w-6 h-6" />
            </button>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from 'lucide-vue-next'

interface Props {
  images: string[]
  altPrefix?: string
}

const props = withDefaults(defineProps<Props>(), {
  altPrefix: '图片'
})

const assetUrl = useAssetUrl()
const isLightboxOpen = ref(false)
const currentIndex = ref(0)

const images = computed(() => props.images ?? [])

const gridWrapperClass = computed(() => {
  const count = images.value.length
  if (count <= 0) return ''
  if (count === 1) return 'grid gap-3 grid-cols-1'
  if (count <= 3) return `grid gap-3 grid-cols-${count}`
  if (count === 4) return 'grid gap-3 grid-cols-2'
  return 'grid gap-3 grid-cols-3'
})

const imageClass = computed(() => {
  const base = 'w-full border border-white/20 cursor-pointer hover:opacity-90 transition-opacity rounded-lg md:rounded-xl'
  if (images.value.length === 1) {
    return `${base} max-h-64 object-cover`
  }
  return `${base} h-48 object-cover`
})

const currentImage = computed(() => images.value[currentIndex.value] ?? '')

const resolveImage = (image: string) => {
  if (!image) return ''
  return image.startsWith('http') ? image : assetUrl(image)
}

const openLightbox = (index: number) => {
  currentIndex.value = index
  isLightboxOpen.value = true
}

const closeLightbox = () => {
  isLightboxOpen.value = false
}

const prevImage = () => {
  if (!images.value.length) return
  currentIndex.value = (currentIndex.value - 1 + images.value.length) % images.value.length
}

const nextImage = () => {
  if (!images.value.length) return
  currentIndex.value = (currentIndex.value + 1) % images.value.length
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
