<template>
  <!-- 外观沿用输入框样式；容器可见且具备尺寸，方便 SDK 直接渲染 -->
  <div ref="wrapper">
    <div :id="containerId"></div>
  </div>
  
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, nextTick } from 'vue'

type Tokens = {
  lot_number: string
  captcha_output: string
  pass_token: string
  gen_time: string
}

declare global {
  interface Window {
    initGeetest4?: (
      opts: Record<string, any>,
      cb: (captchaObj: any) => void
    ) => void
  }
}

const emit = defineEmits<{
  (e: 'verified', tokens: Tokens): void
  (e: 'error', message: string): void
  (e: 'ready'): void
}>()

const props = defineProps<{
  product?: 'bind' | 'float' | 'popup'
  riskType?: string
  width?: string | number
  captchaId?: string // 支持自定义验证码ID
}>()

const ready = ref(false)
const verified = ref(false)
const containerId = `gt4_${Math.random().toString(36).slice(2)}`
let instance: any | null = null
const wrapper = ref<HTMLElement | null>(null)

const loadScript = (src: string) => new Promise<void>((resolve, reject) => {
  if (document.querySelector(`script[src="${src}"]`)) return resolve()
  const s = document.createElement('script')
  s.src = src
  s.async = true
  s.onload = () => resolve()
  s.onerror = () => reject(new Error('geetest script failed'))
  document.head.appendChild(s)
})

const waitForSize = async (el: HTMLElement) => {
  const start = performance.now()
  while (true) {
    const rect = el.getBoundingClientRect()
    if (rect.width > 0) return
    if (performance.now() - start > 3000) return
    await new Promise((r) => requestAnimationFrame(r))
  }
}

const init = async () => {
  const config = useRuntimeConfig()
  // 优先使用传入的captchaId,否则使用默认的geetestId
  const captchaId = props.captchaId || (config.public as any).geetestId as string | undefined
  if (!captchaId) {
    emit('error', '未配置 Geetest 验证ID')
    return
  }

  await loadScript('https://static.geetest.com/v4/gt4.js')

  if (!window.initGeetest4) {
    emit('error', 'Geetest 初始化函数不可用')
    return
  }

  await nextTick()
  if (wrapper.value) await waitForSize(wrapper.value)

  const product = props.product || 'popup'
  // 不设置 width，使用 Geetest 默认风格与自适应
  window.initGeetest4({
    captchaId,
    product,
    language: 'zh-CN',
    riskType: props.riskType || 'login',
  }, (captchaObj: any) => {
    instance = captchaObj
    // 绑定到可见容器（bind/float）。popup 不需要，但本组件默认 bind
    try { captchaObj.appendTo(`#${containerId}`) } catch {}

    captchaObj
      .onReady(() => { ready.value = true; emit('ready') })
      .onSuccess(() => {
        const result = captchaObj.getValidate?.()
        if (result?.lot_number && result?.captcha_output && result?.pass_token && result?.gen_time) {
          verified.value = true
          emit('verified', {
            lot_number: result.lot_number,
            captcha_output: result.captcha_output,
            pass_token: result.pass_token,
            gen_time: result.gen_time,
          })
        } else {
          emit('error', '获取验证码结果失败')
        }
      })
      .onError((e: any) => {
        emit('error', e?.message || '验证码加载失败')
      })
  })
}

onMounted(() => { void init() })
onBeforeUnmount(() => { instance?.destroy?.() })

defineExpose({
  reset: () => { verified.value = false; instance?.reset?.() },
  isReady: () => ready.value,
  isVerified: () => verified.value,
})
</script>

<style scoped>
</style>
