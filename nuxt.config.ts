// https://nuxt.com/docs/api/configuration/nuxt-config
// Dev-time CORS handling: if NUXT_PUBLIC_API_BASE is an absolute URL,
// proxy its pathname to its origin so the browser sees same-origin requests.
const isDev = process.env.NODE_ENV !== 'production'
const rawApiBase = process.env.NUXT_PUBLIC_API_BASE

let publicApiBase = rawApiBase
let devProxy: Record<string, any> | undefined

if (isDev && rawApiBase) {
  try {
    const u = new URL(rawApiBase)
    const apiPath = u.pathname.endsWith('/') ? u.pathname : `${u.pathname}/`
    const apiOrigin = `${u.protocol}//${u.host}`
    // Only apply proxy when path is not root.
    // Guard against accidentally proxying '/' which would hijack all routes including '/_nuxt'.
    if (apiPath !== '/') {
      // In dev, make the browser call a relative path to avoid CORS,
      // while dev server proxies that path to the real backend.
      const pathNoSlash = apiPath.replace(/\/$/, '') || '/'
      publicApiBase = pathNoSlash
      devProxy = {
        [apiPath]: { 
          target: apiOrigin, 
          changeOrigin: true, 
          secure: false,
          cookieDomainRewrite: '',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Device-ID, X-Admin-View'
          }
        },
        [pathNoSlash]: { 
          target: apiOrigin, 
          changeOrigin: true, 
          secure: false,
          cookieDomainRewrite: '',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Device-ID, X-Admin-View'
          }
        },
      }
    }
  } catch {
    // rawApiBase is not an absolute URL; assume it's already a relative path
  }
}

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  // SPA mode for better performance
  ssr: false,
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt'
  ],
  
  runtimeConfig: {
    public: {
      // Do not provide defaults here per user requirement
      apiBase: publicApiBase,
      randomImageApiUrl: process.env.NUXT_PUBLIC_RANDOM_IMAGE_API_URL || 'https://pic.zz4th.space/',
      pageSize: process.env.NUXT_PUBLIC_PAGE_SIZE ? parseInt(process.env.NUXT_PUBLIC_PAGE_SIZE) : undefined,
    }
  },
  
  css: ['~/assets/css/main.css'],
  
  app: {
    head: {
      title: 'Love Wall - 表白墙',
      htmlAttrs: {
        lang: 'zh-CN'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'description', content: '一个温暖的表白墙，记录美好的告白时刻' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' },
        { 'http-equiv': 'Content-Type', content: 'text/html; charset=UTF-8' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
  
  tailwindcss: {
    configPath: '~/tailwind.config.js'
  },
  
  // 强制UTF-8编码
  build: {
    transpile: []
  },
  
  vite: {
    define: {
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
    },
    server: {
      proxy: isDev && devProxy
        ? Object.fromEntries(Object.entries(devProxy).map(([path, cfg]: any) => [path, { target: cfg.target, changeOrigin: true, secure: false }]))
        : undefined,
    },
  },
  
  nitro: {
    devProxy: isDev ? devProxy : undefined,
  }
})
