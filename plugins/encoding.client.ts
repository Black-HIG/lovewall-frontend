export default defineNuxtPlugin(() => {
  // 确保客户端使用正确的字符编码
  if (typeof window !== 'undefined') {
    // 设置文档编码
    const metaCharset = document.querySelector('meta[charset]')
    if (!metaCharset) {
      const meta = document.createElement('meta')
      meta.setAttribute('charset', 'UTF-8')
      document.head.insertBefore(meta, document.head.firstChild)
    }

    // 强制设置页面编码
    document.documentElement.lang = 'zh-CN'
    
    // 确保所有AJAX请求使用正确的编码
    const originalFetch = window.fetch
    window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
      const headers = new Headers(init?.headers)
      
      if (!headers.has('Accept-Charset')) {
        headers.set('Accept-Charset', 'UTF-8')
      }
      
      if (!headers.has('Content-Type') && init?.method !== 'GET') {
        headers.set('Content-Type', 'application/json; charset=UTF-8')
      }
      
      return originalFetch(input, {
        ...init,
        headers
      })
    }
  }
})