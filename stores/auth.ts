import { defineStore } from 'pinia'
import type { User, UserProfile, LoginForm, RegisterForm, AuthResponse, PermissionType } from '~/types'

interface AuthState {
  currentUser: User | null
  permissions: string[]
  accessToken: string | null
  isLoading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    currentUser: null,
    permissions: [],
    accessToken: null,
    isLoading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.currentUser,
    
    isSuperadmin: (state): boolean => state.currentUser?.is_superadmin || false,
    
    hasPerm: (state) => (permission: PermissionType): boolean => {
      return state.currentUser?.is_superadmin || state.permissions.includes(permission)
    },

    hasAnyPerm: (state) => (permissions: PermissionType[]): boolean => {
      if (state.currentUser?.is_superadmin) return true
      return permissions.some(perm => state.permissions.includes(perm))
    },

    hasAllPerms: (state) => (permissions: PermissionType[]): boolean => {
      if (state.currentUser?.is_superadmin) return true
      return permissions.every(perm => state.permissions.includes(perm))
    },

    userDisplayName: (state): string => {
      if (!state.currentUser) return ''
      return state.currentUser.display_name || state.currentUser.username
    },
  },

  actions: {
    async clearSession(options?: { toastMessage?: string; toastType?: 'success' | 'error' | 'warning' | 'info'; redirectTo?: string | null }) {
      this.currentUser = null
      this.permissions = []
      this.accessToken = null
      this.error = null

      if (process.client) {
        localStorage.removeItem('auth_token')
      }

      try {
        const cookies = useSessionCookies()
        cookies.clear()
      } catch {}

      const toastMessage = options?.toastMessage
      if (toastMessage) {
        const toast = useToast()
        const type = options?.toastType ?? 'info'
        const show = (toast as any)[type] || toast.info
        show.call(toast, toastMessage)
      }

      if (process.client) {
        const target = options?.redirectTo === null
          ? null
          : options?.redirectTo ?? '/auth/login'
        if (target) {
          await navigateTo(target)
        }
      }
    },

    async register(form: RegisterForm): Promise<void> {
      this.isLoading = true
      this.error = null
      
      try {
        const api = useApi()
        const response: AuthResponse = await api.register(form)
        
        this.currentUser = response.user
        this.accessToken = response.access_token
        this.permissions = [] // Will be loaded by fetchProfile
        
        // Store token in localStorage for persistence
        if (process.client) {
          localStorage.setItem('auth_token', response.access_token)
        }
        
        // Fetch full profile with permissions
        await this.fetchProfile()
        
        const toast = useToast()
        toast.success('注册成功!')
      } catch (error: any) {
        this.error = error.message || 'Registration failed'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async login(form: LoginForm): Promise<void> {
      this.isLoading = true
      this.error = null
      
      try {
        console.log('Auth store: Starting login process')
        const api = useApi()
        const response: AuthResponse = await api.login(form)
        console.log('Auth store: Login API successful, response:', response)
        
        this.currentUser = response.user
        this.accessToken = response.access_token
        this.permissions = [] // Will be loaded by fetchProfile
        
        // Store token in localStorage for persistence
        if (process.client) {
          localStorage.setItem('auth_token', response.access_token)
          console.log('Auth store: Token stored in localStorage')
        }
        // Also persist in cookie to avoid refresh loss / cross-tab UX
        try {
          const cookies = useSessionCookies()
          cookies.setToken(response.access_token)
        } catch {}
        
        // Fetch full profile with permissions
        console.log('Auth store: Fetching profile with permissions')
        await this.fetchProfile()
        console.log('Auth store: Profile fetched successfully, permissions:', this.permissions)
        
        const toast = useToast()
        toast.success(`欢迎回来, ${this.userDisplayName}!`)
      } catch (error: any) {
        console.error('Auth store: Login failed:', error)
        this.error = error.message || 'Login failed'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async logout(): Promise<void> {
      try {
        // 确保API调用时带上Authorization头，让token进入黑名单
        const api = useApi()
        await api.logout() // 这会自动在拦截器中添加Authorization头
      } catch (error) {
        // 即使API调用失败也要清理本地状态
        console.warn('Logout API call failed:', error)
      } finally {
        await this.clearSession({
          toastMessage: '已退出登录',
          toastType: 'success',
          redirectTo: '/'
        })
      }
    },

    async fetchProfile(): Promise<void> {
      if (!this.accessToken) return
      
      try {
        const api = useApi()
        const profile: UserProfile = await api.getProfile()
        
        this.currentUser = profile.user
        this.permissions = profile.permissions
        this.error = null // Clear any previous errors
        // Persist lightweight user data into cookies for UX
        try {
          const cookies = useSessionCookies()
          cookies.setUser({
            id: this.currentUser?.id || null,
            displayName: this.currentUser?.display_name || this.currentUser?.username || null,
          })
        } catch (e) {
          console.warn('Failed to set session cookies:', e)
        }
      } catch (error: any) {
        // If profile fetch fails, likely token is invalid
        console.warn('Profile fetch failed:', error)
        this.error = 'Failed to fetch profile'
        // Clear auth state
        this.currentUser = null
        this.permissions = []
        this.accessToken = null
        
        // Clear localStorage
        if (process.client) {
          localStorage.removeItem('auth_token')
        }
        
        throw error
      }
    },

    async initAuth(): Promise<void> {
      if (!process.client) return
      
      // Try to restore token from localStorage
      const token = localStorage.getItem('auth_token')
      const cookies = useSessionCookies()
      const cookieToken = cookies.token.value
      const effectiveToken = token || cookieToken || null
      if (effectiveToken) {
        this.accessToken = effectiveToken
        if (!token && cookieToken) {
          // keep localStorage in sync for legacy logic
          localStorage.setItem('auth_token', cookieToken)
        }
        try {
          await this.fetchProfile()
        } catch (error) {
          // Token is invalid, clear it but don't throw error
          console.warn('Auth initialization failed, clearing invalid token:', error)
          this.accessToken = null
          this.currentUser = null
          this.permissions = []
          localStorage.removeItem('auth_token')
          try { cookies.setToken(null) } catch {}
        }
      }
    },

    clearError(): void {
      this.error = null
    },

    setCurrentUser(user: User): void {
      this.currentUser = user
      // Update session cookies
      try {
        const cookies = useSessionCookies()
        cookies.setUser({
          id: user.id,
          displayName: user.display_name || user.username,
        })
      } catch (e) {
        console.warn('Failed to update session cookies:', e)
      }
    },
  },
})
