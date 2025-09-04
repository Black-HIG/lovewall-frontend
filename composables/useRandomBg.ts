export const useRandomBg = () => {
  const config = useRuntimeConfig()
  const url = config.public.randomImageApiUrl as string
  
  const src = ref<string>('')
  const loading = ref(true)
  const error = ref<string | null>(null)

  const fetchImage = async (retries = 3): Promise<void> => {
    try {
      // Generate a unique URL to avoid caching
      const timestamp = Date.now()
      const imageUrl = `${url}${url.endsWith('/') ? '' : '/'}?t=${timestamp}`
      
      // Create a new image to test loading
      const img = new Image()
      
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = imageUrl
      })
      
      src.value = imageUrl
      loading.value = false
      error.value = null
    } catch (err) {
      if (retries > 0) {
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000))
        return fetchImage(retries - 1)
      }
      
      error.value = 'Failed to load background image'
      loading.value = false
      console.warn('Background image loading failed:', err)
    }
  }

  const refresh = () => {
    loading.value = true
    error.value = null
    fetchImage()
  }

  // Auto-fetch on mount
  onMounted(() => {
    fetchImage()
  })

  return {
    src: readonly(src),
    loading: readonly(loading),
    error: readonly(error),
    refresh,
  }
}