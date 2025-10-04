export default defineNuxtPlugin(() => {
  if (typeof window === 'undefined') return
  const url = 'https://static.geetest.com/v4/gt4.js'
  // Add preload to warm-up request
  if (!document.querySelector(`link[rel="preload"][href="${url}"]`)) {
    const l = document.createElement('link')
    l.rel = 'preload'
    l.as = 'script'
    l.href = url
    document.head.appendChild(l)
  }
  // Preconnect safeguard if not in head yet
  if (!document.querySelector('link[rel="preconnect"][href="https://static.geetest.com"]')) {
    const p = document.createElement('link')
    p.rel = 'preconnect'
    p.href = 'https://static.geetest.com'
    document.head.appendChild(p)
  }
})

