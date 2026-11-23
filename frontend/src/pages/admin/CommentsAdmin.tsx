import { useState } from 'react'
import { api } from '../../lib/api'
import { formatDate } from '../../lib/format'
import { useAsync } from '../../lib/useAsync'
import type { CommentStatus } from '../../types/api'

const STATUSES: CommentStatus[] = ['PENDING', 'APPROVED', 'REJECTED']

export function CommentsAdmin() {
  const [status, setStatus] = useState<CommentStatus>('PENDING')
  const [reload, setReload] = useState(0)
  const { data, error, loading } = useAsync(() => api.adminComments(status), [status, reload])

  async function act(id: number, next: CommentStatus | 'DELETE') {
    if (next === 'DELETE') await api.deleteComment(id)
    else await api.moderateComment(id, next)
    setReload((r) => r + 1)
  }

  return (
    <>
      <h1>Comments</h1>
      <div className="chips">
        {STATUSES.map((s) => (
          <button key={s} className={`chip ${status === s ? 'chip-active' : ''}`} onClick={() => setStatus(s)}>
            {s.toLowerCase()}
          </button>
        ))}
      </div>
      {loading && <p className="muted">Loading…</p>}
      {error && <p className="error">{error.message}</p>}
      {data && data.items.length === 0 && <p className="muted">Nothing here.</p>}
      <ul className="mod-list">
        {data?.items.map((c) => (
          <li key={c.id} className="card">
            <p className="muted small">
              <strong>{c.authorName}</strong> on post #{c.postId}{c.parentId ? ` (reply to #${c.parentId})` : ''} · {formatDate(c.createdAt)}
            </p>
            <p>{c.content}</p>
            <div className="actions">
              {c.status !== 'APPROVED' && <button className="btn btn-sm" onClick={() => act(c.id, 'APPROVED')}>Approve</button>}
              {c.status !== 'REJECTED' && <button className="btn btn-sm btn-ghost" onClick={() => act(c.id, 'REJECTED')}>Reject</button>}
              <button className="link-btn danger" onClick={() => act(c.id, 'DELETE')}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
