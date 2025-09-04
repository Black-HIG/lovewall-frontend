import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import type { 
  ApiResp, 
  User, 
  UserProfile, 
  AuthResponse, 
  PostDto, 
  CommentDto, 
  AnnouncementDto, 
  TagDto, 
  UserTagDto,
  RedemptionCodeDto,
  Pagination,
  LoginForm,
  RegisterForm,
  PostForm,
  CommentForm,
  AnnouncementForm,
  TagForm,
  GenerateCodesForm,
  RedeemForm,
  RedeemResponse,
  UpdateProfileForm,
  ChangePasswordForm,
  AdminChangePasswordForm,
  AdminUpdateUserForm,
  LogEntry,
  LogFilters
} from '~/types'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase as string
  
  // Decide whether to send credentials based on same-origin
  let withCreds = true
  try {
    if (/^https?:\/\//i.test(baseURL) && typeof window !== 'undefined') {
      const u = new URL(baseURL)
      withCreds = (u.origin === window.location.origin)
    }
  } catch {}

  // Normalize base: ensure single trailing slash so that 'posts' -> '/api/posts'
  const normBase = (() => {
    if (!baseURL) return ''
    return baseURL.endsWith('/') ? baseURL : baseURL + '/'
  })()

  // Create axios instance
  const instance: AxiosInstance = axios.create({
    baseURL: normBase,
    withCredentials: withCreds,
    timeout: 30000,
  })

  // Request interceptor
  instance.interceptors.request.use((config) => {
    // Add auth token if available
    const authStore = useAuthStore()
    const cookies = useSessionCookies()
    const token = authStore.accessToken || cookies.token.value
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // Ensure endpoint doesn't start with '/'
    if (typeof config.url === 'string') {
      config.url = config.url.replace(/^\/+/, '')
    }
    return config
  })

  // Response interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse<ApiResp<any>>) => {
      return response
    },
    (error) => {
      const trace = error?.response?.data?.trace_id
      const code = error?.response?.data?.error?.code
      let message = error?.response?.data?.error?.message || 'Request failed'
      
      // Handle network errors
      if (!error.response) {
        message = '网络连接失败，请检查您的网络连接'
      } else if (error.response.status === 500) {
        message = '服务器内部错误，请稍后重试'
      } else if (error.response.status === 503) {
        message = '服务暂时不可用，请稍后重试'
      }
      
      // Don't show toast for 404 errors on active tag endpoints - these are normal
      const isActiveTagNotFound = error.response?.status === 404 && 
        (error.config?.url?.includes('active-tag') || message === 'active tag not found')
      
      // Show toast notification for errors (except active tag not found)
      if (!isActiveTagNotFound) {
        const toast = useToast()
        toast.error(`${message}${trace ? ` · ${trace}` : ''}`)
      }
      
      return Promise.reject({ 
        ...error, 
        code, 
        trace,
        message 
      })
    }
  )

  // API methods
  const api = {
    // Authentication
    async register(data: RegisterForm): Promise<AuthResponse> {
      const response = await instance.post<ApiResp<AuthResponse>>('/register', data)
      return response.data.data
    },

    async login(data: LoginForm): Promise<AuthResponse> {
      const response = await instance.post<ApiResp<AuthResponse>>('/login', data)
      return response.data.data
    },

    async logout(): Promise<{ ok: boolean }> {
      const response = await instance.post<ApiResp<{ ok: boolean }>>('/logout')
      return response.data.data
    },

    async getProfile(): Promise<UserProfile> {
      const response = await instance.get<ApiResp<UserProfile>>('/profile')
      return response.data.data
    },

    async getOnlineStatus(): Promise<{ online: boolean; expires_at?: string }> {
      const response = await instance.get<ApiResp<{ online: boolean; expires_at?: string }>>('/users/me/online')
      return response.data.data
    },

    async updateProfile(data: any): Promise<User> {
      const requestData: any = {}
      
      // 只包含有变化的字段
      if (data.display_name !== undefined) {
        requestData.display_name = data.display_name || null
      }
      if (data.email !== undefined) {
        requestData.email = data.email || null
      }
      if (data.phone !== undefined) {
        requestData.phone = data.phone || null
      }
      if (data.bio !== undefined) {
        requestData.bio = data.bio || null
      }
      if (data.avatar) {
        // 转换为base64格式
        requestData.avatar_base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(data.avatar)
        })
      }
      
      const response = await instance.patch<ApiResp<User>>('/profile', requestData)
      return response.data.data
    },

    async changePassword(data: ChangePasswordForm): Promise<void> {
      const response = await instance.post<ApiResp<void>>('/change-password', {
        old_password: data.old_password,
        new_password: data.new_password
      })
      return response.data.data
    },

    async getUser(id: string): Promise<User> {
      const response = await instance.get<ApiResp<User>>(`/users/${id}`)
      return response.data.data
    },

    async getUserByUsername(username: string): Promise<User> {
      const response = await instance.get<ApiResp<User>>(`/users/by-username/${username}`)
      return response.data.data
    },

    async getUserPosts(userId: string, params: { page?: number; page_size?: number } = {}): Promise<Pagination<PostDto>> {
      // TODO: 后端应该实现 GET /api/users/{userId}/posts
      // 暂时使用普通帖子列表并前端过滤
      const response = await instance.get<ApiResp<Pagination<PostDto>>>('/posts', { params })
      const data = response.data.data
      const filteredPosts = data.items.filter(post => post.author_id === userId)
      return {
        ...data,
        items: filteredPosts
      }
    },

    // Posts
    async listPosts(params: {
      page?: number
      page_size?: number
      featured?: boolean
      pinned?: boolean
    } = {}): Promise<Pagination<PostDto>> {
      const response = await instance.get<ApiResp<Pagination<PostDto>>>('/posts', { params })
      return response.data.data
    },

    async getPost(id: string): Promise<PostDto> {
      const response = await instance.get<ApiResp<PostDto>>(`/posts/${id}`)
      return response.data.data
    },

    async createPost(formData: FormData): Promise<PostDto> {
      const response = await instance.post<ApiResp<PostDto>>('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data.data
    },

    async updatePost(id: string, data: Partial<PostDto>): Promise<PostDto> {
      const response = await instance.put<ApiResp<PostDto>>(`/posts/${id}`, data)
      return response.data.data
    },

    async deletePost(id: string): Promise<void> {
      await instance.delete(`/posts/${id}`)
    },
    
    // Moderation: list posts with all statuses (admin)
    async moderationPosts(params: {
      status?: 0 | 1 | 2
      author_id?: string
      featured?: boolean
      pinned?: boolean
      page?: number
      page_size?: number
    } = {}): Promise<Pagination<PostDto>> {
      const response = await instance.get<ApiResp<Pagination<PostDto>>>('/posts/moderation', { params })
      return response.data.data
    },
    
    // Moderation: restore post from deleted -> public
    async restorePost(id: string): Promise<{ id: string; status: number }> {
      const response = await instance.post<ApiResp<{ id: string; status: number }>>(`/posts/${id}/restore`)
      return response.data.data
    },

    async pinPost(id: string, pin: boolean): Promise<{ id: string; is_pinned: boolean }> {
      const response = await instance.post<ApiResp<{ id: string; is_pinned: boolean }>>(`/posts/${id}/pin`, { pin })
      return response.data.data
    },

    async featurePost(id: string, feature: boolean): Promise<{ id: string; is_featured: boolean }> {
      const response = await instance.post<ApiResp<{ id: string; is_featured: boolean }>>(`/posts/${id}/feature`, { feature })
      return response.data.data
    },

    async hidePost(id: string, hide: boolean): Promise<{ id: string; status: number }> {
      const response = await instance.post<ApiResp<{ id: string; status: number }>>(`/posts/${id}/hide`, { hide })
      return response.data.data
    },

    // Comments
    async listComments(postId: string, params: {
      page?: number
      page_size?: number
    } = {}): Promise<Pagination<CommentDto>> {
      const response = await instance.get<ApiResp<Pagination<CommentDto>>>(`/posts/${postId}/comments`, { params })
      return response.data.data
    },

    async createComment(postId: string, data: CommentForm): Promise<CommentDto> {
      const response = await instance.post<ApiResp<CommentDto>>(`/posts/${postId}/comments`, data)
      return response.data.data
    },

    async updateComment(id: string, data: CommentForm): Promise<CommentDto> {
      const response = await instance.put<ApiResp<CommentDto>>(`/comments/${id}`, data)
      return response.data.data
    },

    async deleteComment(id: string): Promise<void> {
      await instance.delete(`/comments/${id}`)
    },

    async hideComment(id: string, hide: boolean): Promise<{ id: string; status: number }> {
      const response = await instance.post<ApiResp<{ id: string; status: number }>>(`/comments/${id}/hide`, { hide })
      return response.data.data
    },

    async getMyComments(params: {
      page?: number
      page_size?: number
    } = {}): Promise<Pagination<CommentDto>> {
      const response = await instance.get<ApiResp<Pagination<CommentDto>>>('/my/comments', { params })
      return response.data.data
    },

    async adminComments(params: {
      post_id?: string
      user_id?: string
      status?: 0 | 1
      page?: number
      page_size?: number
    } = {}): Promise<Pagination<CommentDto>> {
      const response = await instance.get<ApiResp<Pagination<CommentDto>>>('/comments', { params })
      return response.data.data
    },

    // Announcements
    async listAnnouncements(): Promise<AnnouncementDto[]> {
      const response = await instance.get<ApiResp<AnnouncementDto[]>>('/announcements')
      return response.data.data
    },

    async createAnnouncement(data: AnnouncementForm): Promise<AnnouncementDto> {
      const response = await instance.post<ApiResp<AnnouncementDto>>('/announcements', data)
      return response.data.data
    },

    async updateAnnouncement(id: string, data: Partial<AnnouncementForm>): Promise<AnnouncementDto> {
      const response = await instance.put<ApiResp<AnnouncementDto>>(`/announcements/${id}`, data)
      return response.data.data
    },

    async deleteAnnouncement(id: string): Promise<void> {
      await instance.delete(`/announcements/${id}`)
    },

    // Users & Permissions (Admin)
    async listUsers(params: {
      q?: string
      status?: number
      page?: number
      page_size?: number
    } = {}): Promise<Pagination<User>> {
      const response = await instance.get<ApiResp<Pagination<User>>>('/users', { params })
      return response.data.data
    },

    async setUserPerms(id: string, data: { permissions: string[] }): Promise<void> {
      await instance.post(`/users/${id}/permissions`, data)
    },

    async updateUser(id: string, data: AdminUpdateUserForm): Promise<User> {
      const requestData: any = {}
      
      // 只包含有变化的字段
      if (data.username !== undefined) requestData.username = data.username
      if (data.display_name !== undefined) requestData.display_name = data.display_name || null
      if (data.email !== undefined) requestData.email = data.email || null
      if (data.phone !== undefined) requestData.phone = data.phone || null
      if (data.bio !== undefined) requestData.bio = data.bio || null
      if (data.avatar_base64 !== undefined) requestData.avatar_base64 = data.avatar_base64
      if (data.password !== undefined) requestData.password = data.password
      if (data.old_password !== undefined) requestData.old_password = data.old_password
      
      const response = await instance.put<ApiResp<User>>(`/users/${id}`, requestData)
      return response.data.data
    },

    async adminChangePassword(userId: string, data: AdminChangePasswordForm): Promise<void> {
      const response = await instance.post<ApiResp<void>>(`/users/${userId}/change-password`, {
        new_password: data.new_password
      })
      return response.data.data
    },

    // User ban/unban methods
    async banUser(userId: string, data: { reason: string }): Promise<{ id: string; is_banned: boolean; ban_reason: string }> {
      const response = await instance.post<ApiResp<{ id: string; is_banned: boolean; ban_reason: string }>>(`/admin/users/${userId}/ban`, data)
      return response.data.data
    },

    async unbanUser(userId: string): Promise<{ id: string; is_banned: boolean }> {
      const response = await instance.post<ApiResp<{ id: string; is_banned: boolean }>>(`/admin/users/${userId}/unban`)
      return response.data.data
    },

    // Tags
    async listTags(params: {
      active?: boolean
      page?: number
      page_size?: number
    } = {}): Promise<Pagination<TagDto>> {
      const response = await instance.get<ApiResp<Pagination<TagDto>>>('/tags', { params })
      return response.data.data
    },

    async getTag(id: string): Promise<TagDto> {
      const response = await instance.get<ApiResp<TagDto>>(`/tags/${id}`)
      return response.data.data
    },

    async createTag(data: TagForm): Promise<TagDto> {
      const response = await instance.post<ApiResp<TagDto>>('/tags', data)
      return response.data.data
    },

    async updateTag(id: string, data: Partial<TagForm>): Promise<TagDto> {
      const response = await instance.put<ApiResp<TagDto>>(`/tags/${id}`, data)
      return response.data.data
    },

    async deleteTag(id: string): Promise<void> {
      await instance.delete(`/tags/${id}`)
    },

    // Redemption Codes
    async generateCodes(data: GenerateCodesForm): Promise<{
      batch_id: string
      tag: TagDto
      count: number
      codes: RedemptionCodeDto[]
    }> {
      const response = await instance.post<ApiResp<{
        batch_id: string
        tag: TagDto
        count: number
        codes: RedemptionCodeDto[]
      }>>('/tags/generate-codes', data)
      return response.data.data
    },

    async listCodes(params: {
      tag_id?: string
      batch_id?: string
      used?: boolean
      page?: number
      page_size?: number
    } = {}): Promise<Pagination<RedemptionCodeDto>> {
      const response = await instance.get<ApiResp<Pagination<RedemptionCodeDto>>>('/redemption-codes', { params })
      return response.data.data
    },

    async redeem(data: RedeemForm): Promise<RedeemResponse> {
      const response = await instance.post<ApiResp<RedeemResponse>>('/redeem', data)
      return response.data.data
    },

    // User Tags
    async getMyTags(all?: boolean): Promise<Pagination<UserTagDto>> {
      const params = all ? { all: true } : {}
      const response = await instance.get<ApiResp<Pagination<UserTagDto>>>('/my/tags', { params })
      return response.data.data
    },

    async activateTag(tagId: string): Promise<void> {
      await instance.post(`/my/tags/${tagId}/activate`)
    },

    async deactivateTag(tagId: string): Promise<void> {
      await instance.post(`/my/tags/${tagId}/deactivate`)
    },

    // Get active tag by user ID or username
    async getUserActiveTag(userId: string): Promise<{ name: string; title: string; background_color: string; text_color: string } | null> {
      try {
        const response = await instance.get<ApiResp<{ name: string; title: string; background_color: string; text_color: string }>>(`/users/${userId}/active-tag`)
        return response.data.data
      } catch (error: any) {
        if (error.response?.status === 404) {
          return null
        }
        throw error
      }
    },

    async getUserActiveTagByUsername(username: string): Promise<{ name: string; title: string; background_color: string; text_color: string } | null> {
      try {
        const response = await instance.get<ApiResp<{ name: string; title: string; background_color: string; text_color: string }>>(`/users/by-username/${username}/active-tag`)
        return response.data.data
      } catch (error: any) {
        if (error.response?.status === 404) {
          return null
        }
        throw error
      }
    },

    // Admin user tag management
    async adminAssignUserTag(userId: string, tagId: string, data?: { active?: boolean }): Promise<void> {
      await instance.post(`/admin/users/${userId}/tags/${tagId}`, data || {})
    },

    async adminRemoveUserTag(userId: string, tagId: string): Promise<void> {
      await instance.delete(`/admin/users/${userId}/tags/${tagId}`)
    },

    async adminGetUserTags(userId: string): Promise<Pagination<UserTagDto>> {
      const response = await instance.get<ApiResp<Pagination<UserTagDto>>>(`/admin/users/${userId}/tags`)
      return response.data.data
    },

    // Redemption codes - get by code
    async getCodeByCode(code: string): Promise<RedemptionCodeDto> {
      const response = await instance.get<ApiResp<RedemptionCodeDto>>(`/redemption-codes/by-code/${code}`)
      return response.data.data
    },

    // Admin metrics
    async getAdminMetrics(): Promise<{ total_comments: number; today_comments: number; today_new_users: number; since: string }> {
      const response = await instance.get<ApiResp<{ total_comments: number; today_comments: number; today_new_users: number; since: string }>>('/admin/metrics/overview')
      return response.data.data
    },

    // Admin logs (only for superadmin)
    async getSubmissionLogs(filters: LogFilters = {}): Promise<Pagination<LogEntry>> {
      const response = await instance.get<ApiResp<Pagination<LogEntry>>>('/admin/logs/submissions', { params: filters })
      return response.data.data
    },

    async getOperationLogs(filters: LogFilters = {}): Promise<Pagination<LogEntry>> {
      const response = await instance.get<ApiResp<Pagination<LogEntry>>>('/admin/logs/operations', { params: filters })
      return response.data.data
    },
  }

  return {
    provide: {
      api
    }
  }
})
