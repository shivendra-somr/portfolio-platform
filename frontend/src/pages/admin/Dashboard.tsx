import { Link } from 'react-router-dom'
import { useState } from 'react'
import { api } from '../../lib/api'
import { formatDate } from '../../lib/format'
import { useAsync } from '../../lib/useAsync'

export function Dashboard() {
  const [reload, setReload] = useState(0)
  const { data, error, loading } = useAsync(() => api.adminPosts(), [reload])

  async function remove(id: number, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    await api.deletePost(id)
    setReload((r) => r + 1)
  }

  const totalViews = data?.items.reduce((s, p) => s + p.viewCount, 0) ?? 0
  const totalLikes = data?.items.reduce((s, p) => s + p.likeCount, 0) ?? 0

  return (
    <>
      <div className="row-between">
        <h1>Posts</h1>
        <Link to="/admin/posts/new" className="btn">New post</Link>
      </div>
      {data && (
        <dl className="stats">
          <div><dt>{data.totalElements}</dt><dd>posts</dd></div>
          <div><dt>{totalViews}</dt><dd>views</dd></div>
          <div><dt>{totalLikes}</dt><dd>likes</dd></div>
        </dl>
      )}
      {loading && <p className="muted">Loading…</p>}
      {error && <p className="error">{error.message}</p>}
      {data && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Title</th><th>Status</th><th>Updated</th><th className="num">Views</th><th className="num">Likes</th><th /></tr>
            </thead>
            <tbody>
              {data.items.map((p) => (
                <tr key={p.id}>
                  <td><Link to={`/admin/posts/${p.id}`}>{p.title}</Link></td>
                  <td><span className={`pill ${p.status === 'PUBLISHED' ? 'pill-ok' : ''}`}>{p.status.toLowerCase()}</span></td>
                  <td>{formatDate(p.updatedAt)}</td>
                  <td className="num">{p.viewCount}</td>
                  <td className="num">{p.likeCount}</td>
                  <td className="actions">
                    {p.status === 'PUBLISHED' && <Link to={`/blog/${p.slug}`}>View</Link>}
                    <button className="link-btn danger" onClick={() => remove(p.id, p.title)}>Delete</button>
                  </td>
                </tr>
              ))}
              {data.items.length === 0 && <tr><td colSpan={6} className="muted">No posts yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
