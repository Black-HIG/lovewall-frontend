export const useAssetUrl = () => {
  const config = useRuntimeConfig()

  // 获取后端基础地址（用于拼接静态资源）
  const getBackendBaseUrl = () => {
    const apiBase = config.public.apiBase as string
    if (process.client) {
      if (apiBase && /^https?:\/\//i.test(apiBase)) {
        try {
          const u = new URL(apiBase)
          return u.origin
        } catch {
          return 'http://127.0.0.1:8124'
        }
      } else {
        return 'http://127.0.0.1:8124'
      }
    } else {
      if (apiBase && /^https?:\/\//i.test(apiBase)) {
        try {
          const u = new URL(apiBase)
          return u.origin
        } catch {
          return 'http://127.0.0.1:8124'
        }
      }
      return 'http://127.0.0.1:8124'
    }
  }

  const assetUrl = (path?: string | null) => {
    if (!path) return ''
    // 已是完整地址或受支持的方案，原样返回
    if (/^(https?:)?\/\//i.test(path)) return path
    if (/^data:/i.test(path)) return path
    if (/^blob:/i.test(path)) return path

    // 规范化路径并拼接后端地址
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    const backendBase = getBackendBaseUrl()
    return `${backendBase}${normalizedPath}`
  }

  return assetUrl
}
