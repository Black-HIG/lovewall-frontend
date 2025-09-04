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
        const canModerate = auth.isSuperadmin || auth.hasAnyPerm(['HIDE_POST', 'DELETE_POST', 'EDIT_POST'])
        const pageSize = this.pageSize || 20
        
        // Add timestamp to prevent caching
        const timestamp = Date.now()
        const params = { 
          page: 1, 
          page_size: pageSize,
          _t: timestamp 
        }
        
        // 简化调用，只使用 listPosts，管理员通过前端筛选
        const [listResp, pinnedResp, featuredResp] = await Promise.all([
          api.listPosts(params),
          api.listPosts({ pinned: true, page_size: 6, _t: timestamp }),
          api.listPosts({ featured: true, page_size: 6, _t: timestamp }),
        ])
        
        // 普通用户只能看到正常帖子，管理员可以看到隐藏的帖子
        if (canModerate) {
          this.posts = (listResp.items || []).filter(p => p.status !== 2) // 显示隐藏但不显示已删除
        } else {
          this.posts = (listResp.items || []).filter(p => p.status === 0) // 只显示正常帖子
        }
        
        this.pinned = pinnedResp.items || []
        this.featured = featuredResp.items || []
        this.page = 1
        this.hasMore = (listResp.items || []).length === pageSize
        this.loaded = true
        this.lastLoadedAt = Date.now()
      } catch (error) {
        console.error('Failed to refresh posts:', error)
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
        const canModerate = auth.isSuperadmin || auth.hasAnyPerm(['HIDE_POST', 'DELETE_POST', 'EDIT_POST'])
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
        
        // 普通用户只能看到正常帖子，管理员可以看到隐藏的帖子
        const newPosts = canModerate
          ? (listResp.items || []).filter(p => p.status !== 2) // 显示隐藏但不显示已删除
          : (listResp.items || []).filter(p => p.status === 0) // 只显示正常帖子
          
        this.posts.push(...newPosts)
        this.page = next
        this.hasMore = (listResp.items || []).length === pageSize
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
