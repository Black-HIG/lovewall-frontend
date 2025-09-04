import { useToastStore } from '~/stores/toast'

export const useToast = () => {
  const store = useToastStore()
  
  return {
    // Primary methods with message as first parameter
    success: (message: string, title?: string, duration?: number) => 
      store.success(message, title, duration),
      
    error: (message: string, title?: string, duration?: number) => 
      store.error(message, title, duration || 6000),
      
    warning: (message: string, title?: string, duration?: number) => 
      store.warning(message, title, duration),
      
    info: (message: string, title?: string, duration?: number) => 
      store.info(message, title, duration),
      
    // Direct store methods
    addToast: store.addToast,
    removeToast: (id: string) => store.removeToast(id),
    clearAll: () => store.clearAll(),
    
    // Legacy support (for backward compatibility)
    remove: (id: string) => store.removeToast(id),
    clear: () => store.clearAll(),
  }
}