import type {
  AdminComment, CommentNode, CommentStatus, PageResponse, PostDetail, PostRequest, PostSummary, TokenResponse,
} from '../types/api'

const BASE = import.meta.env.VITE_API_URL ?? ''
const TOKEN_KEY = 'auth'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export function getStoredAuth(): TokenResponse | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY)
    return raw ? (JSON.parse(raw) as TokenResponse) : null
  } catch {
    return null
  }
}

export function storeAuth(auth: TokenResponse | null) {
  try {
    if (auth) localStorage.setItem(TOKEN_KEY, JSON.stringify(auth))
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* storage unavailable */
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  const auth = getStoredAuth()
  if (auth) headers.set('Authorization', `Bearer ${auth.token}`)

  const res = await fetch(`${BASE}${path}`, { ...init, headers })
  if (res.status === 401 && auth) storeAuth(null)
  if (!res.ok) {
    let message = res.statusText
    try {
      const body = await res.json()
      message = body.detail ?? body.message ?? message
    } catch {
      /* not JSON */
    }
    throw new ApiError(res.status, message)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

const qs = (params: Record<string, string | number | undefined>) => {
  const s = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '') s.set(k, String(v))
  const str = s.toString()
  return str ? `?${str}` : ''
}

export const api = {
  // public
  listPosts: (p: { page?: number; size?: number; tag?: string; q?: string } = {}) =>
    request<PageResponse<PostSummary>>(`/api/posts${qs(p)}`),
  popularPosts: () => request<PostSummary[]>('/api/posts/popular'),
  tags: () => request<string[]>('/api/posts/tags'),
  getPost: (slug: string) => request<PostDetail>(`/api/posts/${encodeURIComponent(slug)}`),
  likePost: (slug: string) => request<{ likes: number }>(`/api/posts/${encodeURIComponent(slug)}/like`, { method: 'POST' }),
  comments: (slug: string) => request<CommentNode[]>(`/api/posts/${encodeURIComponent(slug)}/comments`),
  addComment: (slug: string, body: { authorName: string; content: string; parentId?: number; website?: string }) =>
    request<{ message: string }>(`/api/posts/${encodeURIComponent(slug)}/comments`, {
      method: 'POST', body: JSON.stringify(body),
    }),
  contact: (body: { name: string; email: string; subject?: string; message: string; website?: string }) =>
    request<{ message: string }>('/api/contact', { method: 'POST', body: JSON.stringify(body) }),

  // auth
  login: (username: string, password: string) =>
    request<TokenResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),

  // admin
  adminPosts: (page = 0) => request<PageResponse<PostSummary>>(`/api/admin/posts${qs({ page, size: 50 })}`),
  adminPost: (id: number) => request<PostDetail>(`/api/admin/posts/${id}`),
  createPost: (body: PostRequest) => request<PostDetail>('/api/admin/posts', { method: 'POST', body: JSON.stringify(body) }),
  updatePost: (id: number, body: PostRequest) =>
    request<PostDetail>(`/api/admin/posts/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deletePost: (id: number) => request<void>(`/api/admin/posts/${id}`, { method: 'DELETE' }),
  adminComments: (status: CommentStatus) =>
    request<PageResponse<AdminComment>>(`/api/admin/comments${qs({ status, size: 100 })}`),
  moderateComment: (id: number, status: CommentStatus) =>
    request<AdminComment>(`/api/admin/comments/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteComment: (id: number) => request<void>(`/api/admin/comments/${id}`, { method: 'DELETE' }),
}
