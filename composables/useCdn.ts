export const useJsDelivr = () => {
  const config = useRuntimeConfig()
  const origin = (config.public as any).jsdelivrOrigin as string | undefined
  return {
    origin,
    rewrite(url: string) {
      if (!origin) return url
      return url.replace(/^https?:\/\/cdn\.jsdelivr\.net\//, `${origin}/`)
    }
  }
}

