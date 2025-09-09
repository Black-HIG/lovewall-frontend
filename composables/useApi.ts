import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import type {
  ApiResp,
  AuthResponse,
  UserProfile,
  PostDto,
  CommentDto,
  AnnouncementDto,
  TagDto,
  UserTagDto,
  RedemptionCodeDto,
  LogEntry,
  LogFilters,
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
  User,
  MyActiveTagStatusResponse,
  MyTagStatusResponse,
  DeleteRedemptionCodesRequest,
  DeleteRedemptionCodesResponse,
} from '~/types'

let fallbackApi: any | null = null

// 工具函数：将File转换为base64格式
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const useApi = () => {
  const nuxtApp: any = useNuxtApp()
  if (nuxtApp.$api) return nuxtApp.$api

  // Fallback: construct a local API client (in case plugin failed to register)
  if (fallbackApi) return fallbackApi

  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase as string | undefined

  let withCreds = true
  try {
    if (baseURL && /^https?:\/\//i.test(baseURL) && typeof window !== 'undefined') {
      const u = new URL(baseURL)
      withCreds = (u.origin === window.location.origin)
    }
  } catch {}

  const normBase = (() => {
    if (!baseURL) return ''
    return /\/$/.test(baseURL) ? baseURL : `${baseURL}/`
  })()

  const instance: AxiosInstance = axios.create({
    baseURL: normBase,
    withCredentials: withCreds,
    timeout: 30000,
  })

  instance.interceptors.request.use((config) => {
    // Attach token from auth store when available
    try {
      const auth = useAuthStore()
      const cookies = useSessionCookies()
      const token = auth.accessToken || cookies.token.value
      if (token) {
        config.headers = config.headers || {}
        ;(config.headers as any).Authorization = `Bearer ${token}`
      }
      if (typeof config.url === 'string') {
        config.url = config.url.replace(/^\/+/, '')
      }
    } catch {}
    return config
  })

  instance.interceptors.response.use(
    (response: AxiosResponse<ApiResp<any>>) => response,
    (error) => {
      try {
        const trace = error?.response?.data?.trace_id
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
        
        if (!isActiveTagNotFound) {
          const toast = useToast()
          toast.error(`${message}${trace ? ` · ${trace}` : ''}`)
        }
      } catch {}
      return Promise.reject(error)
    }
  )

  const unwrap = <T>(res: AxiosResponse<ApiResp<T>>): T => {
    const body = res.data as ApiResp<T>
    if ((body as any)?.success) return (body as any).data as T
    const msg = (body as any)?.error?.message || '请求失败'
    throw new Error(msg)
  }

  const api = {
    // Auth
    async register(data: RegisterForm): Promise<AuthResponse> {
      const res = await instance.post<ApiResp<AuthResponse>>('/register', data)
      return unwrap(res)
    },
    async login(data: LoginForm): Promise<AuthResponse> {
      const res = await instance.post<ApiResp<AuthResponse>>('/login', data)
      return unwrap(res)
    },
    async logout(): Promise<{ ok: boolean }> {
      const res = await instance.post<ApiResp<{ ok: boolean }>>('/logout')
      return unwrap(res)
    },
    async getProfile(): Promise<UserProfile> {
      const res = await instance.get<ApiResp<UserProfile>>('/profile')
      return unwrap(res)
    },
    async getOnlineStatus(): Promise<{ online: boolean; expires_at?: string }> {
      const res = await instance.get<ApiResp<{ online: boolean; expires_at?: string }>>('/users/me/online')
      return unwrap(res)
    },
    async updateProfile(data: UpdateProfileForm): Promise<User> {
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
        requestData.avatar_base64 = await fileToBase64(data.avatar)
      }
      
      const res = await instance.patch<ApiResp<User>>('/profile', requestData)
      return unwrap(res)
    },
    async changePassword(data: ChangePasswordForm): Promise<void> {
      // 204 No Content on success
      await instance.put('/me/password', {
        old_password: data.old_password,
        new_password: data.new_password,
      })
    },

    // 获取用户信息
    async getUser(id: string): Promise<User> {
      const res = await instance.get<ApiResp<User>>(`/users/${id}`)
      return unwrap(res)
    },
    async getUserByUsername(username: string): Promise<User> {
      const res = await instance.get<ApiResp<User>>(`/users/by-username/${username}`)
      return unwrap(res)
    },
    async getUserPosts(userId: string, params: { page?: number; page_size?: number } = {}): Promise<Pagination<PostDto>> {
      // TODO: 这个接口需要后端实现，暂时使用普通帖子列表并过滤
      // 实际应该是：GET /api/users/{userId}/posts
      const res = await instance.get<ApiResp<Pagination<PostDto>>>('/posts', { params })
      const data = unwrap(res)
      // 前端临时过滤（实际应该由后端处理）
      const filteredPosts = data.items.filter((post: PostDto) => post.author_id === userId)
      return {
        ...data,
        items: filteredPosts
      }
    },

    // Posts
    async listPosts(params: { page?: number; page_size?: number; featured?: boolean; pinned?: boolean } = {}): Promise<Pagination<PostDto>> {
      const res = await instance.get<ApiResp<Pagination<PostDto>>>('/posts', { params })
      return unwrap(res)
    },
    async getPost(id: string): Promise<PostDto> {
      const res = await instance.get<ApiResp<PostDto>>(`/posts/${id}`)
      return unwrap(res)
    },
    async getPostStats(id: string): Promise<{ id: string; view_count: number; comment_count: number }> {
      const res = await instance.get<ApiResp<{ id: string; view_count: number; comment_count: number }>>(`/posts/${id}/stats`)
      return unwrap(res)
    },
    async createPost(formData: FormData): Promise<PostDto> {
      const res = await instance.post<ApiResp<PostDto>>('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      return unwrap(res)
    },
    async updatePost(id: string, data: Partial<PostDto>): Promise<PostDto> {
      const res = await instance.put<ApiResp<PostDto>>(`/posts/${id}`, data)
      return unwrap(res)
    },
    async deletePost(id: string): Promise<void> {
      await instance.delete(`/posts/${id}`)
    },
    async moderationPosts(params: { status?: 0 | 1 | 2; author_id?: string; featured?: boolean; pinned?: boolean; page?: number; page_size?: number } = {}): Promise<Pagination<PostDto>> {
      const res = await instance.get<ApiResp<Pagination<PostDto>>>('/posts/moderation', { params })
      return unwrap(res)
    },
    async restorePost(id: string): Promise<{ id: string; status: number }> {
      const res = await instance.post<ApiResp<{ id: string; status: number }>>(`/posts/${id}/restore`)
      return unwrap(res)
    },
    async pinPost(id: string, pin: boolean): Promise<{ id: string; is_pinned: boolean }> {
      const res = await instance.post<ApiResp<{ id: string; is_pinned: boolean }>>(`/posts/${id}/pin`, { pin })
      return unwrap(res)
    },
    async featurePost(id: string, feature: boolean): Promise<{ id: string; is_featured: boolean }> {
      const res = await instance.post<ApiResp<{ id: string; is_featured: boolean }>>(`/posts/${id}/feature`, { feature })
      return unwrap(res)
    },
    async hidePost(id: string, hide: boolean): Promise<{ id: string; status: number }> {
      const res = await instance.post<ApiResp<{ id: string; status: number }>>(`/posts/${id}/hide`, { hide })
      return unwrap(res)
    },

    // Comments
    async listComments(postId: string, params: { page?: number; page_size?: number } = {}): Promise<Pagination<CommentDto>> {
      const res = await instance.get<ApiResp<Pagination<CommentDto>>>(`/posts/${postId}/comments`, { params })
      return unwrap(res)
    },
    async createComment(postId: string, data: CommentForm): Promise<CommentDto> {
      const res = await instance.post<ApiResp<CommentDto>>(`/posts/${postId}/comments`, data)
      return unwrap(res)
    },
    async deleteComment(id: string): Promise<void> {
      await instance.delete(`/comments/${id}`)
    },
    async hideComment(id: string, hide: boolean): Promise<{ id: string; status: number }> {
      const res = await instance.post<ApiResp<{ id: string; status: number }>>(`/comments/${id}/hide`, { hide })
      return unwrap(res)
    },
    async getMyComments(params: { page?: number; page_size?: number } = {}): Promise<Pagination<CommentDto>> {
      const res = await instance.get<ApiResp<Pagination<CommentDto>>>('/my/comments', { params })
      return unwrap(res)
    },
    async getAdminComments(params: { post_id?: string; user_id?: string; status?: number; page?: number; page_size?: number } = {}): Promise<Pagination<CommentDto>> {
      const res = await instance.get<ApiResp<Pagination<CommentDto>>>('/comments', { params })
      return unwrap(res)
    },

    // Announcements
    async listAnnouncements(): Promise<AnnouncementDto[]> {
      const res = await instance.get<ApiResp<AnnouncementDto[]>>('/announcements')
      return unwrap(res)
    },
    async createAnnouncement(data: AnnouncementForm): Promise<AnnouncementDto> {
      const res = await instance.post<ApiResp<AnnouncementDto>>('/announcements', data)
      return unwrap(res)
    },
    async updateAnnouncement(id: string, data: Partial<AnnouncementForm>): Promise<AnnouncementDto> {
      const res = await instance.put<ApiResp<AnnouncementDto>>(`/announcements/${id}`, data)
      return unwrap(res)
    },
    async deleteAnnouncement(id: string): Promise<void> {
      await instance.delete(`/announcements/${id}`)
    },

    // Users
    async listUsers(params: { q?: string; status?: number; page?: number; page_size?: number } = {}): Promise<Pagination<User>> {
      const res = await instance.get<ApiResp<Pagination<User>>>('/users', { params })
      return unwrap(res)
    },
    async adminDeleteUser(userId: string): Promise<void> {
      await instance.delete(`/admin/users/${userId}`)
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
      
      const res = await instance.put<ApiResp<User>>(`/users/${id}`, requestData)
      return unwrap(res)
    },
    async setUserPerms(id: string, data: { permissions: string[] }): Promise<void> {
      await instance.post(`/users/${id}/permissions`, data)
    },
    async adminChangePassword(userId: string, data: AdminChangePasswordForm): Promise<void> {
      // 204 No Content on success
      await instance.put(`/admin/users/${userId}/password`, {
        new_password: data.new_password,
      })
    },

    // Tags
    async listTags(params: { active?: boolean; page?: number; page_size?: number } = {}): Promise<Pagination<TagDto>> {
      const res = await instance.get<ApiResp<Pagination<TagDto>>>('/tags', { params })
      return unwrap(res)
    },
    async getTag(id: string): Promise<TagDto> {
      const res = await instance.get<ApiResp<TagDto>>(`/tags/${id}`)
      return unwrap(res)
    },
    async createTag(data: TagForm): Promise<TagDto> {
      const res = await instance.post<ApiResp<TagDto>>('/tags', data)
      return unwrap(res)
    },
    async updateTag(id: string, data: Partial<TagForm>): Promise<TagDto> {
      const res = await instance.put<ApiResp<TagDto>>(`/tags/${id}`, data)
      return unwrap(res)
    },
    async deleteTag(id: string): Promise<void> {
      await instance.delete(`/tags/${id}`)
    },

    // Redemption codes
    async generateCodes(data: GenerateCodesForm): Promise<{ batch_id: string; tag: TagDto; count: number; codes: RedemptionCodeDto[] }>{
      const res = await instance.post<ApiResp<{ batch_id: string; tag: TagDto; count: number; codes: RedemptionCodeDto[] }>>('/tags/generate-codes', data)
      return unwrap(res)
    },
    async listCodes(params: { tag_id?: string; batch_id?: string; code?: string; used?: boolean; page?: number; page_size?: number } = {}): Promise<Pagination<RedemptionCodeDto>>{
      const res = await instance.get<ApiResp<Pagination<RedemptionCodeDto>>>('/redemption-codes', { params })
      return unwrap(res)
    },
    async getCodeByCode(code: string): Promise<RedemptionCodeDto> {
      const res = await instance.get<ApiResp<RedemptionCodeDto>>(`/redemption-codes/by-code/${code}`)
      return unwrap(res)
    },
    async redeem(data: RedeemForm): Promise<RedeemResponse> {
      const res = await instance.post<ApiResp<RedeemResponse>>('/redeem', data)
      return unwrap(res)
    },

    // User tags
    async getMyTags(all?: boolean): Promise<Pagination<UserTagDto>> {
      const params = all ? { all: true } : {}
      const res = await instance.get<ApiResp<Pagination<UserTagDto>>>('/my/tags', { params })
      return unwrap(res)
    },
    async getMyActiveTagStatus(): Promise<MyActiveTagStatusResponse> {
      const res = await instance.get<ApiResp<MyActiveTagStatusResponse>>('/my/tags/current-status')
      return unwrap(res)
    },
    async getMyTagStatus(tagId: string): Promise<MyTagStatusResponse> {
      const res = await instance.get<ApiResp<MyTagStatusResponse>>(`/my/tags/${tagId}/status`)
      return unwrap(res)
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
        const res = await instance.get<ApiResp<{ name: string; title: string; background_color: string; text_color: string }>>(`/users/${userId}/active-tag`)
        return unwrap(res)
      } catch (error: any) {
        if (error.response?.status === 404) {
          return null // No active tag or user not found
        }
        throw error
      }
    },
    async getUserActiveTagByUsername(username: string): Promise<{ name: string; title: string; background_color: string; text_color: string } | null> {
      try {
        const res = await instance.get<ApiResp<{ name: string; title: string; background_color: string; text_color: string }>>(`/users/by-username/${username}/active-tag`)
        return unwrap(res)
      } catch (error: any) {
        if (error.response?.status === 404) {
          return null // No active tag or user not found
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

    // Admin metrics
    async getAdminMetrics(): Promise<{ since: string; total_users: number; total_posts: number; total_comments: number; today_new_users: number; today_new_posts: number; today_comments: number }> {
      const res = await instance.get<ApiResp<{ since: string; total_users: number; total_posts: number; total_comments: number; today_new_users: number; today_new_posts: number; today_comments: number }>>('/admin/metrics/overview')
      return unwrap(res)
    },

    // Admin logs (only for superadmin)
    async getSubmissionLogs(filters: LogFilters = {}): Promise<Pagination<LogEntry>> {
      const res = await instance.get<ApiResp<Pagination<LogEntry>>>('/admin/logs/submissions', { params: filters })
      return unwrap(res)
    },
    async getOperationLogs(filters: LogFilters = {}): Promise<Pagination<LogEntry>> {
      const res = await instance.get<ApiResp<Pagination<LogEntry>>>('/admin/logs/operations', { params: filters })
      return unwrap(res)
    },

    // Admin: delete redemption codes (unused only)
    async deleteRedemptionCodes(payload: DeleteRedemptionCodesRequest): Promise<DeleteRedemptionCodesResponse> {
      const res = await instance.delete<ApiResp<DeleteRedemptionCodesResponse>>('/redemption-codes', { data: payload })
      return unwrap(res)
    },
  }

  fallbackApi = api
  return api
}
