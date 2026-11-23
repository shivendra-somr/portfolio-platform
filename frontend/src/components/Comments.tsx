import { useState, type FormEvent } from 'react'
import { api } from '../lib/api'
import { formatDate } from '../lib/format'
import { useAsync } from '../lib/useAsync'
import type { CommentNode } from '../types/api'

function CommentForm({ slug, parentId, onDone }: { slug: string; parentId?: number; onDone?: () => void }) {
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    setBusy(true)
    try {
      const res = await api.addComment(slug, {
        authorName: String(data.get('authorName')),
        content: String(data.get('content')),
        website: String(data.get('website') ?? ''),
        parentId,
      })
      setStatus({ ok: true, msg: res.message })
      form.reset()
      onDone?.()
    } catch (err) {
      setStatus({ ok: false, msg: (err as Error).message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="form comment-form" onSubmit={submit}>
      <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden />
      <label>Name<input name="authorName" required maxLength={80} /></label>
      <label>{parentId ? 'Reply' : 'Comment'}<textarea name="content" required maxLength={2000} rows={3} /></label>
      <button className="btn" disabled={busy}>{busy ? 'Sending…' : parentId ? 'Post reply' : 'Post comment'}</button>
      {status && <p className={status.ok ? 'success' : 'error'} role="status">{status.msg}</p>}
    </form>
  )
}

function Thread({ node, slug }: { node: CommentNode; slug: string }) {
  const [replying, setReplying] = useState(false)
  return (
    <li className="comment">
      <p className="comment-meta"><strong>{node.authorName}</strong> <span className="muted small">{formatDate(node.createdAt)}</span></p>
      <p className="comment-body">{node.content}</p>
      <button className="link-btn small" onClick={() => setReplying((r) => !r)}>{replying ? 'Cancel' : 'Reply'}</button>
      {replying && <CommentForm slug={slug} parentId={node.id} />}
      {node.replies.length > 0 && (
        <ul className="comment-list nested">
          {node.replies.map((r) => <Thread key={r.id} node={r} slug={slug} />)}
        </ul>
      )}
    </li>
  )
}

export function Comments({ slug }: { slug: string }) {
  const { data, error, loading } = useAsync(() => api.comments(slug), [slug])
  return (
    <section className="comments" aria-labelledby="comments-h">
      <h2 id="comments-h">Comments</h2>
      {loading && <p className="muted">Loading comments…</p>}
      {error && <p className="muted">Comments are unavailable right now.</p>}
      {data && data.length === 0 && <p className="muted">No comments yet. Start the conversation.</p>}
      {data && data.length > 0 && (
        <ul className="comment-list">{data.map((c) => <Thread key={c.id} node={c} slug={slug} />)}</ul>
      )}
      <h3>Leave a comment</h3>
      <CommentForm slug={slug} />
    </section>
  )
}
