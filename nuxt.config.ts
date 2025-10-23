// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  components: true,
  
  // SPA mode
  ssr: false,
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt'
  ],
  
  // 添加页面过渡效果
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
    head: {
      title: '郑州四中表白墙',
      htmlAttrs: {
        lang: 'zh-CN'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'description', content: '郑州市第四高级中学校园信息交流平台，分享校园生活、表达心声的正规社区' },
        { name: 'keywords', content: '郑州四中,郑州市第四高级中学,表白墙,校园社区,学生交流' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' },
        { 'http-equiv': 'Content-Type', content: 'text/html; charset=UTF-8' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/bandge.png' },
        { rel: 'preconnect', href: 'https://static.geetest.com' },
        { rel: 'dns-prefetch', href: 'https://static.geetest.com' }
      ]
    }
  },
  
  // 确保代理配置正确 - SPA 模式下用 vite.server.proxy
  vite: {
    define: {
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8124',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
        }
      }
    }
  },
  
  runtimeConfig: {
    // Private runtime config (server only)
    geetestKey: process.env.NUXT_GEETEST_KEY,
    public: {
      // API 基址：优先使用环境变量，其次回落到同域 `/api`
      // 在生产环境设置 NUXT_PUBLIC_API_BASE，例如：
      //   https://api.example.com/api  或  http://127.0.0.1:8124/api
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
      randomImageApiUrl: process.env.NUXT_PUBLIC_RANDOM_IMAGE_API_URL || 'https://pic.zz4th.space/',
      pageSize: process.env.NUXT_PUBLIC_PAGE_SIZE ? parseInt(process.env.NUXT_PUBLIC_PAGE_SIZE) : undefined,
      // Geetest 登录验证码ID (前端验证)
      geetestId: process.env.NUXT_PUBLIC_GEETEST_ID,
      // Geetest 注册验证码ID (后端验证)
      geetestRegisterId: process.env.NUXT_PUBLIC_GEETEST_REGISTER_ID,
      // Mainland-friendly jsDelivr origin (used when building CDN links)
      jsdelivrOrigin: process.env.NUXT_PUBLIC_JSDELIVR_ORIGIN || 'https://fastly.jsdelivr.net',
    }
  },
  
  css: ['~/assets/css/main.css'],
  
  tailwindcss: {
    configPath: '~/tailwind.config.js'
  },
  
  // 强制UTF-8编码
  build: {
    transpile: []
  },
    
  // Nitro 代理作为备用
  nitro: {
    devProxy: {
      '/api': {
        target: 'http://127.0.0.1:8124',
        changeOrigin: true,
        prependPath: true,
        ws: true
      }
    }
  }
})
