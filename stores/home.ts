import { defineStore } from 'pinia'
import type { PostDto, Pagination } from '~/types'

interface HomeState {
  posts: PostDto[]
  pinned: PostDto[]
  featured: PostDto[]
  page: number
  pageSize: number
  hasMore: boolean
  loading: boolean
  loadingMore: boolean
  loaded: boolean
  lastLoadedAt: number | null
}

export const useHomeStore = defineStore('home', {
  state: (): HomeState => ({
    posts: [],
    pinned: [],
    featured: [],
    page: 1,
    pageSize: useRuntimeConfig().public.pageSize as number | undefined || 20,
    hasMore: true,
    loading: false,
    loadingMore: false,
    loaded: false,
    lastLoadedAt: null,
  }),
  getters: {
    hasData: (s) => s.loaded && (s.posts.length > 0 || s.pinned.length > 0 || s.featured.length > 0),
    // 全局排序优先级: 置顶+精华 > 置顶 > 精华 > 普通 > 隐藏(> 已删除)
    sortedPosts: (s) =>
      s.posts.slice().sort((a, b) => {
        const score = (p: PostDto) => {
          if (p.status === 2) return 5
          if (p.status === 1) return 4
          // status === 0
          if (p.is_pinned && p.is_featured) return 0
          if (p.is_pinned) return 1
          if (p.is_featured) return 2
          return 3
        }
        const sa = score(a)
        const sb = score(b)
        if (sa !== sb) return sa - sb
        // Newest first within same class
        const at = new Date(a.created_at).getTime()
        const bt = new Date(b.created_at).getTime()
        return bt - at
      }),
  },
  actions: {
    // Force refresh data every time (no caching)
    async initialLoad() {
      await this.forceRefresh()
    },

    async forceRefresh() {
      this.loading = true
      try {
        const api = useApi()
        const auth = useAuthStore()
        const canModerate = auth.isSuperadmin || auth.hasPerm('MANAGE_POSTS')
        const pageSize = this.pageSize || 20
        
        // Add timestamp to prevent caching
        const timestamp = Date.now()
        const params = { 
          page: 1, 
          page_size: pageSize,
          _t: timestamp 
        }
        
        console.log('HomeStore: Starting forceRefresh, params:', params)
        console.log('HomeStore: API instance created')
        
        // 简化调用，只使用 listPosts，管理员通过前端筛选
        const [listResp, pinnedResp, featuredResp] = await Promise.all([
          api.listPosts(params),
          api.listPosts({ pinned: true, page_size: 6, _t: timestamp }),
          api.listPosts({ featured: true, page_size: 6, _t: timestamp }),
        ])
        
        console.log('HomeStore: API responses received:', {
          listResp: listResp,
          listCount: listResp.items?.length || 0,
          pinnedCount: pinnedResp.items?.length || 0,
          featuredCount: featuredResp.items?.length || 0
        })
        
        // Normalize shape to be robust against slight backend variations
        const normalizeStatus = (s: any): 0 | 1 | 2 => {
          if (typeof s === 'number') return (s === 1 || s === 2) ? s : 0
          if (typeof s === 'string') {
            const v = s.toLowerCase()
            if (v.includes('hide')) return 1
            if (v.includes('delete') || v.includes('remove')) return 2
            return 0
          }
          return 0
        }
        // 统一的图片字段规范化函数
        const normalizeImages = (p: any): string[] => {
          if (Array.isArray(p.images) && p.images.length > 0) return p.images
          if (p.images && typeof p.images === 'string') return [String(p.images)]
          if (p.image_path) return [p.image_path]
          if (p.image_url) return [p.image_url]
          return []
        }

        const normalizePost = (p: any): PostDto => ({
          id: String(p.id),
          author_id: String(p.author_id ?? p.user_id ?? ''),
          author_name: String(p.author_name ?? p.author_display_name ?? p.author_username ?? '匿名'),
          target_name: String(p.target_name ?? p.to_name ?? 'TA'),
          content: String(p.content ?? ''),
          images: normalizeImages(p),
          status: normalizeStatus(p.status) as 0 | 1 | 2,
          is_pinned: !!p.is_pinned,
          is_featured: !!p.is_featured,
          created_at: p.created_at ?? new Date().toISOString(),
          updated_at: p.updated_at ?? p.created_at ?? new Date().toISOString(),
          author_tag: p.author_tag,
          author_isadmin: p.author_isadmin,
          moderation_reason: p.moderation_reason ?? null,
          view_count: p.view_count,
          comment_count: p.comment_count,
          audit_status: p.audit_status,
          audit_msg: p.audit_msg,
          manual_review_requested: p.manual_review_requested,
        })

        const rawItems: any[] = (listResp as any)?.items
          ?? (listResp as any)?.list
          ?? (listResp as any)?.records
          ?? (listResp as any)?.rows
          ?? (Array.isArray((listResp as any)?.data) ? (listResp as any).data : [])
        const normalizedItems: PostDto[] = (rawItems || []).map(normalizePost)
        if (canModerate) {
          this.posts = normalizedItems.filter((p: PostDto) => p.status !== 2) // show hidden, exclude deleted
          console.log('HomeStore: Filtered posts for moderator:', this.posts.length)
        } else {
          this.posts = normalizedItems.filter((p: PostDto) => p.status === 0)
          console.log('HomeStore: Filtered posts for user:', this.posts.length)
        }

        const pinnedRaw: any[] = (pinnedResp as any)?.items
          ?? (pinnedResp as any)?.list
          ?? (pinnedResp as any)?.records
          ?? (pinnedResp as any)?.rows
          ?? (Array.isArray((pinnedResp as any)?.data) ? (pinnedResp as any).data : [])
        const featuredRaw: any[] = (featuredResp as any)?.items
          ?? (featuredResp as any)?.list
          ?? (featuredResp as any)?.records
          ?? (featuredResp as any)?.rows
          ?? (Array.isArray((featuredResp as any)?.data) ? (featuredResp as any).data : [])
        this.pinned = (pinnedRaw || []).map(normalizePost)
        this.featured = (featuredRaw || []).map(normalizePost)
        this.page = 1
        this.hasMore = (rawItems || []).length === pageSize
        this.loaded = true
        this.lastLoadedAt = Date.now()
        
        console.log('HomeStore: Final state:', {
          postsCount: this.posts.length,
          pinnedCount: this.pinned.length,
          featuredCount: this.featured.length,
          loaded: this.loaded
        })
      } catch (error) {
        console.error('HomeStore: Failed to refresh posts:', error)
        // 显示友好的错误信息
        const toast = useToast()
        toast.error('刷新失败，请稍后重试')
      } finally {
        this.loading = false
      }
    },

    async refresh() {
      await this.forceRefresh()
    },

    async loadMore() {
      if (!this.hasMore || this.loadingMore) return
      this.loadingMore = true
      try {
        const api = useApi()
        const auth = useAuthStore()
        const canModerate = auth.isSuperadmin || auth.hasPerm('MANAGE_POSTS')
        const pageSize = this.pageSize || 20
        const next = this.page + 1
        
        // Add timestamp to prevent caching
        const timestamp = Date.now()
        const params = { 
          page: next, 
          page_size: pageSize,
          _t: timestamp 
        }

        const listResp: Pagination<PostDto> = await api.listPosts(params)

        // 统一的图片字段规范化函数
        const normalizeImages = (p: any): string[] => {
          if (Array.isArray(p.images) && p.images.length > 0) return p.images
          if (p.images && typeof p.images === 'string') return [String(p.images)]
          if (p.image_path) return [p.image_path]
          if (p.image_url) return [p.image_url]
          return []
        }

        // 普通用户只能看到正常帖子，管理员可以看到隐藏的帖子
        const itemsRaw: any[] = (listResp as any)?.items
          ?? (listResp as any)?.list
          ?? (listResp as any)?.records
          ?? (listResp as any)?.rows
          ?? (Array.isArray((listResp as any)?.data) ? (listResp as any).data : [])
        const items = itemsRaw.map((p: any) => ({
          id: String(p.id),
          author_id: String(p.author_id ?? p.user_id ?? ''),
          author_name: String(p.author_name ?? p.author_display_name ?? p.author_username ?? '匿名'),
          target_name: String(p.target_name ?? p.to_name ?? 'TA'),
          content: String(p.content ?? ''),
          images: normalizeImages(p),
          status: (typeof (p as any).status === 'number' ? (p as any).status : (String((p as any).status || '').toLowerCase().includes('hide') ? 1 : (String((p as any).status || '').toLowerCase().includes('delete') || String((p as any).status || '').toLowerCase().includes('remove') ? 2 : 0))) as 0 | 1 | 2,
          is_pinned: !!(p as any).is_pinned,
          is_featured: !!(p as any).is_featured,
          created_at: (p as any).created_at ?? new Date().toISOString(),
          updated_at: (p as any).updated_at ?? (p as any).created_at ?? new Date().toISOString(),
          author_tag: p.author_tag,
          author_isadmin: p.author_isadmin,
        } as PostDto))
        const newPosts = canModerate
          ? items.filter((p: PostDto) => p.status !== 2)
          : items.filter((p: PostDto) => p.status === 0)
          
        this.posts.push(...newPosts)
        this.page = next
        this.hasMore = (itemsRaw || []).length === pageSize
      } catch (error) {
        console.error('Failed to load more posts:', error)
        const toast = useToast()
        toast.error('加载更多失败，请稍后重试')
      } finally {
        this.loadingMore = false
      }
    },
  }
})
