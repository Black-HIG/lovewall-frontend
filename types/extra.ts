// Extra types that extend backend API without touching the main index for now

export interface NotificationDto {
  id: string
  title: string
  content: string // may contain placeholder {{link}}
  is_read: boolean
  metadata?: string | Record<string, unknown> | null
  created_at: string
}

// Public user existence status
export interface UserStatusDto {
  exists: boolean
  isdeleted: boolean
  is_banned: boolean
  id?: string
}
