import DOMPurify from 'dompurify'

declare module '#app' {
  interface NuxtApp {
    $dompurify: typeof DOMPurify
  }
}

export default defineNuxtPlugin(() => {
  return {
    provide: {
      dompurify: DOMPurify,
    },
  }
})
