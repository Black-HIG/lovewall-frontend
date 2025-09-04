export const useAssetUrl = () => {
  const config = useRuntimeConfig()
  const apiBase = (config.public.apiBase as string) || ''

  // Derive the file host base from apiBase by stripping trailing `/api`
  // Examples:
  //  - 'https://example.com/api'  -> 'https://example.com'
  //  - 'https://example.com/api/' -> 'https://example.com'
  //  - '/api' or '/api/'          -> '' (use relative to current origin)
  let fileBase = ''
  try {
    if (/^https?:\/\//i.test(apiBase)) {
      const u = new URL(apiBase)
      u.pathname = u.pathname.replace(/\/?api\/?$/, '/')
      // Normalize to origin only (no trailing slash path)
      fileBase = `${u.origin}${u.pathname === '/' ? '' : u.pathname.replace(/\/$/, '')}`
    } else {
      // Relative dev proxy like '/api' -> serve assets with absolute path only
      fileBase = apiBase.replace(/\/?api\/?$/, '')
    }
  } catch {
    fileBase = apiBase.replace(/\/?api\/?$/, '')
  }

  const assetUrl = (path?: string | null) => {
    if (!path) return ''
    if (/^https?:\/\//i.test(path)) return path
    // Strip leading '/api' if present in returned path
    const cleaned = path.replace(/^\/api(?=\/|$)/, '')
    const normalized = cleaned.startsWith('/') ? cleaned : `/${cleaned}`
    // If fileBase is empty, return absolute path relative to current origin
    return `${fileBase}${normalized}`
  }

  return assetUrl
}
