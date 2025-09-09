// API Response Types
export type ApiResp<T> = 
  | { success: true; data: T; trace_id: string }
  | { success: false; error: { code: string; message: string }; trace_id: string }

// User Types
export interface User {
  id: string
  username: string
  display_name?: string | null
  email?: string | null
  phone?: string | null
  avatar_url?: string | null
  bio?: string | null
  is_superadmin: boolean
  status: number
  is_banned: boolean
  ban_reason?: string | null
  banned_at?: string | null
  last_login_at?: string | null
  last_ip?: string | null
  metadata?: string | Record<string, unknown> | null
  permissions?: string[] // 仅在用户列表接口返回
  created_at: string
  updated_at: string
  isdeleted?: boolean
}

export interface UserProfile {
  user: User
  permissions: string[]
}

// Tag Types
export interface TagDto {
  id: string
  name: string
  title: string
  background_color: string
  text_color: string
  description?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserTagDto {
  user_tag_id: string // 新字段名
  is_active: boolean
  obtained_at: string
  status: string // 新字段
  tag?: {
    id: string
    name: string
    title: string
    background_color: string
    text_color: string
    is_active: boolean
  }
}

// Post Types
export interface PostDto {
  id: string
  author_id: string
  author_name: string
  target_name: string
  content: string
  image_path?: string | null
  status: 0 | 1 | 2 // 0=published, 1=hidden, 2=deleted
  is_pinned: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
  author_tag?: Pick<TagDto, 'name' | 'title' | 'background_color' | 'text_color'>
  // Optional stats fields when available from certain endpoints
  view_count?: number
  comment_count?: number
}

// Post stats (public)
export interface PostStats {
  id: string
  view_count: number
  comment_count: number
}

// Comment Types
export interface CommentDto {
  id: string
  post_id: string
  user_id: string
  // 新增的用户信息字段
  user_username: string
  user_display_name?: string | null
  user_avatar_url?: string | null
  content: string
  status: 0 | 1 // 0=normal, 1=hidden
  created_at: string
  updated_at?: string
  user_tag?: Pick<TagDto, 'name' | 'title' | 'background_color' | 'text_color'>
}

// Announcement Types
export interface AnnouncementDto {
  id: string
  title: string
  content: string
  is_active: boolean
  metadata?: string | null
  created_at: string
  updated_at: string
}

// Redemption Code Types
export interface RedemptionCodeDto {
  id: string
  code: string
  tag_id: string
  tag?: TagDto
  is_used: boolean
  used_by?: string | null
  used_at?: string | null
  expires_at?: string | null
  batch_id?: string | null
  created_at: string
  updated_at: string
}

// Pagination Types
export interface Pagination<T> {
  total: number
  items: T[]
  page: number
  page_size: number
}

// Form Types
export interface LoginForm {
  username: string
  password: string
}

export interface RegisterForm {
  username: string
  password: string
}

export interface PostForm {
  author_name: string
  target_name: string
  content: string
  image?: File | null
}

export interface CommentForm {
  content: string
}

export interface AnnouncementForm {
  title: string
  content: string
  is_active: boolean
  metadata?: string
}

export interface TagForm {
  name: string
  title: string
  background_color: string
  text_color: string
  description?: string
  is_active?: boolean
}

export interface GenerateCodesForm {
  tag_id: string
  count: number
  expires_at?: string
}

export interface RedeemForm {
  code: string
}

export interface UpdateProfileForm {
  display_name?: string | null
  email?: string | null
  phone?: string | null
  bio?: string | null
  avatar?: File | null
}

// Password Change Forms
export interface ChangePasswordForm {
  old_password: string
  new_password: string
  confirm_password: string
}

// Admin Update User Form
export interface AdminUpdateUserForm {
  username?: string
  display_name?: string | null
  email?: string | null
  phone?: string | null
  bio?: string | null
  avatar?: File | null
  avatar_base64?: string
  password?: string
  old_password?: string
}

// Admin Change Password Form
export interface AdminChangePasswordForm {
  new_password: string
  confirm_password: string
}

// Admin Ban User Form
export interface AdminBanUserForm {
  reason: string
}

// Auth Types
export interface AuthResponse {
  user: User
  access_token: string
}

export interface RedeemResponse {
  success: boolean
  message: string
  user_tag: UserTagDto
}

// Tag status simple type
export interface TagSimple {
  id: string
  name: string
  title: string
  is_active: boolean
}

// My tag status APIs
export interface MyActiveTagStatusResponse {
  has_active: boolean
  current_tag_enabled: boolean
  tag?: TagSimple
  status: 'active' | 'tag_disabled'
}

export interface MyTagStatusResponse {
  enabled: boolean
  status: 'active' | 'tag_disabled'
  tag: TagSimple
}

// Admin: delete redemption codes
export interface DeleteRedemptionCodesRequest {
  ids?: string[]
  codes?: string[]
}

export interface DeleteRedemptionCodesResponse {
  deleted: number
}

// Permission constants
export const PERMISSIONS = {
  MANAGE_USERS: 'MANAGE_USERS',
  EDIT_POST: 'EDIT_POST',
  DELETE_POST: 'DELETE_POST',
  HIDE_POST: 'HIDE_POST',
  PIN_POST: 'PIN_POST',
  FEATURE_POST: 'FEATURE_POST',
  MANAGE_ANNOUNCEMENTS: 'MANAGE_ANNOUNCEMENTS',
  MANAGE_COMMENTS: 'MANAGE_COMMENTS',
  MANAGE_TAGS: 'MANAGE_TAGS',
} as const

export type PermissionType = typeof PERMISSIONS[keyof typeof PERMISSIONS]

// Error Types
export interface ApiError {
  code: string
  message: string
  trace?: string
}

// UI State Types
export interface LoadingState {
  loading: boolean
  error: string | null
}

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

// Log Types
export interface LogEntry {
  id: string
  user_id?: string
  admin_id?: string
  action: string
  object_type: string
  object_id?: string | null
  metadata?: string | null
  created_at: string
  ip?: string | null
  user_agent?: string | null
  // 可选的解析后的元数据，前端使用
  parsedMetadata?: Record<string, unknown>
}

export interface LogFilters {
  user_id?: string
  admin_id?: string
  action?: string
  object_type?: string
  object_id?: string
  q?: string
  from?: string // RFC3339 格式
  to?: string   // RFC3339 格式
  page?: number
  page_size?: number
}


