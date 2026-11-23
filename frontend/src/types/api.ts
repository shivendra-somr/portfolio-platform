export type PostStatus = 'DRAFT' | 'PUBLISHED'

export interface PostSummary {
  id: number
  slug: string
  title: string
  summary: string | null
  coverImage: string | null
  tags: string[]
  status: PostStatus
  publishedAt: string | null
  updatedAt: string
  readingMinutes: number
  viewCount: number
  likeCount: number
}

export interface PostDetail {
  meta: PostSummary
  content: string
}

export interface PageResponse<T> {
  items: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface CommentNode {
  id: number
  parentId: number | null
  authorName: string
  content: string
  createdAt: string
  replies: CommentNode[]
}

export type CommentStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface AdminComment {
  id: number
  postId: number
  parentId: number | null
  authorName: string
  content: string
  status: CommentStatus
  createdAt: string
}

export interface PostRequest {
  title: string
  slug?: string
  summary?: string
  content: string
  coverImage?: string
  tags: string[]
  status: PostStatus
}

export interface TokenResponse {
  token: string
  username: string
  role: 'ADMIN' | 'VISITOR'
  expiresInSeconds: number
}
