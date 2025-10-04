<template>
  <div v-if="images?.length" class="space-y-3">
    <div :class="gridWrapperClass" ref="galleryRef">
      <a
        v-for="(image, index) in images"
        :key="`${image}-${index}`"
        :href="resolveOriginalImage(image)"
        :data-pswp-width="2400"
        :data-pswp-height="2400"
        target="_blank"
        rel="noreferrer"
        @click.prevent.stop="openGallery(index)"
      >
        <img
          :src="resolveThumbnail(image)"
          :alt="`${altPrefix} ${index + 1}`"
          :class="imageClass"
          loading="lazy"
        />
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import PhotoSwipeLightbox from 'photoswipe/lightbox'
import 'photoswipe/style.css'

interface Props {
  images: string[]
  altPrefix?: string
}

const props = withDefaults(defineProps<Props>(), {
  altPrefix: '图片'
})

const assetUrl = useAssetUrl()
const galleryRef = ref<HTMLElement>()
let lightbox: PhotoSwipeLightbox | null = null

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
  // 所有图片统一使用正方形宽高比 (aspect-square)
  return `${base} aspect-square object-cover`
})

// 统一使用assetUrl处理图片
const resolveImage = (image: string) => {
  if (!image) return ''
  return image.startsWith('http') ? image : assetUrl(image)
}

// 缩略图和原图使用相同URL（后端应该已经优化过）
const resolveThumbnail = resolveImage
const resolveOriginalImage = resolveImage

const openGallery = (index: number) => {
  if (lightbox) {
    lightbox.loadAndOpen(index)
  }
}

onMounted(() => {
  if (!galleryRef.value) return

  lightbox = new PhotoSwipeLightbox({
    gallery: galleryRef.value,
    children: 'a',
    pswpModule: () => import('photoswipe'),

    // 图片加载和显示
    preload: [1, 2], // 预加载前后各1-2张图片

    // 缩放配置
    zoom: true,
    maxZoomLevel: 4, // 最大放大4倍
    initialZoomLevel: 'fit', // 初始适应屏幕
    secondaryZoomLevel: 2, // 双击放大到2倍

    // 关闭手势
    pinchToClose: true,
    closeOnVerticalDrag: true,

    // 视觉效果
    bgOpacity: 0.98,
    showHideAnimationType: 'zoom',

    // 间距和布局
    padding: {
      top: 60,
      bottom: 60,
      left: 20,
      right: 20
    },

    // 鼠标滚轮缩放
    wheelToZoom: true,

    // 图片适配
    imageClickAction: 'zoom-or-close',
    tapAction: 'toggle-controls',
    doubleTapAction: 'zoom',

    // 启用计数器和控制栏
    counter: true,
    arrowKeys: true,

    // 历史记录和URL更新
    history: false,
  })

  lightbox.init()
})

onUnmounted(() => {
  if (lightbox) {
    lightbox.destroy()
    lightbox = null
  }
})
</script>

<style>
/* PhotoSwipe 自定义样式 */
.pswp {
  --pswp-bg: rgba(0, 0, 0, 0.98);
  --pswp-icon-color: #fff;
  --pswp-icon-color-secondary: #4a90e2;
  --pswp-placeholder-bg: rgba(79, 79, 79, 0.4);
  z-index: 9999;
}

/* 按钮样式 */
.pswp__button {
  background-color: rgba(0, 0, 0, 0.6) !important;
  border-radius: 50% !important;
  transition: all 0.2s ease;
  width: 44px !important;
  height: 44px !important;
}

.pswp__button:hover {
  background-color: rgba(0, 0, 0, 0.8) !important;
  transform: scale(1.1);
}

/* 图片样式 */
.pswp__img {
  border-radius: 4px;
  object-fit: contain;
}

/* 顶部工具栏 */
.pswp__top-bar {
  background: linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%);
  padding: 16px 20px !important;
}

/* 计数器 */
.pswp__counter {
  font-size: 14px;
  font-weight: 500;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

/* 缩放指示器 */
.pswp__zoom-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 加载动画 */
.pswp__preloader {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.pswp__preloader__icn {
  width: 40px;
  height: 40px;
  opacity: 0.6;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .pswp__button {
    width: 40px !important;
    height: 40px !important;
  }

  .pswp__top-bar {
    padding: 12px 16px !important;
  }

  .pswp {
    --pswp-bg: rgba(0, 0, 0, 1); /* 移动端全黑背景 */
  }
}

/* 平滑的淡入淡出 */
.pswp--open {
  animation: pswpFadeIn 0.3s ease-in-out;
}

@keyframes pswpFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
