// Extra types that extend backend API without touching the main index for now

export interface NotificationDto {
  id: string
  title: string
  /**
   * Sanitised HTML fragment provided by the backend. Render inside a trusted container only.
   */
  content: string
  is_read: boolean
  metadata?: string | Record<string, unknown> | null
  created_at: string
}

export interface ActiveTagDto {
  name: string
  title: string
  background_color: string
  text_color: string
  user_deleted: boolean
}

// Public user existence status
export interface UserStatusDto {
  exists: boolean
  isdeleted: boolean
  is_banned: boolean
  id?: string
  ban_reason?: string | null
}
