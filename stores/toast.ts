import { defineStore } from 'pinia'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  visible: boolean
}

interface ToastState {
  toasts: Toast[]
}

export const useToastStore = defineStore('toast', {
  state: (): ToastState => ({
    toasts: [],
  }),

  actions: {
    addToast(toast: Omit<Toast, 'id' | 'visible'>): string {
      const id = Math.random().toString(36).substring(2, 15)
      const newToast: Toast = {
        id,
        visible: true,
        duration: toast.duration ?? 3000,
        ...toast,
      }
      
      console.log('Adding toast:', newToast)
      
      // Keep only latest 3 toasts
      if (this.toasts.length >= 3) {
        this.toasts.shift()
      }
      
      this.toasts.push(newToast)
      console.log('Current toasts:', this.toasts)
      
      // Auto remove after duration
      if (newToast.duration && newToast.duration > 0) {
        console.log(`Setting timeout for toast ${id} with duration ${newToast.duration}ms`)
        setTimeout(() => {
          console.log(`Auto-removing toast ${id} after ${newToast.duration}ms`)
          this.removeToast(id)
        }, newToast.duration)
      }
      
      return id
    },

    removeToast(id: string): void {
      console.log('Removing toast:', id)
      const index = this.toasts.findIndex(t => t.id === id)
      if (index > -1) {
        this.toasts[index].visible = false
        // Remove from array after animation completes
        setTimeout(() => {
          const currentIndex = this.toasts.findIndex(t => t.id === id)
          if (currentIndex > -1) {
            this.toasts.splice(currentIndex, 1)
            console.log('Toast removed from array:', id)
          }
        }, 300)
      }
    },

    clearAll(): void {
      this.toasts = []
    },

    // Convenience methods
    success(message: string, title?: string, duration?: number): string {
      console.log('Toast success called:', message, title, duration)
      return this.addToast({ type: 'success', message, title, duration: duration ?? 3000 })
    },

    error(message: string, title?: string, duration?: number): string {
      console.log('Toast error called:', message, title, duration)
      return this.addToast({ type: 'error', message, title, duration: duration ?? 3000 })
    },

    warning(message: string, title?: string, duration?: number): string {
      console.log('Toast warning called:', message, title, duration)
      return this.addToast({ type: 'warning', message, title, duration: duration ?? 3000 })
    },

    info(message: string, title?: string, duration?: number): string {
      console.log('Toast info called:', message, title, duration)
      return this.addToast({ type: 'info', message, title, duration: duration ?? 3000 })
    },
  },
})