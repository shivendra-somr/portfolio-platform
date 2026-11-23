import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../lib/api'
import { Markdown } from '../../components/Markdown'
import type { PostRequest, PostStatus } from '../../types/api'

const empty: PostRequest = { title: '', slug: '', summary: '', content: '', coverImage: '', tags: [], status: 'DRAFT' }

export function PostEditor() {
  const { id } = useParams()
  const postId = id ? Number(id) : null
  const navigate = useNavigate()
  const [form, setForm] = useState<PostRequest>(empty)
  const [tagsText, setTagsText] = useState('')
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!postId) return
    api.adminPost(postId).then(({ meta, content }) => {
      setForm({
        title: meta.title, slug: meta.slug, summary: meta.summary ?? '', content,
        coverImage: meta.coverImage ?? '', tags: meta.tags, status: meta.status,
      })
      setTagsText(meta.tags.join(', '))
    }).catch((e: Error) => setMsg({ ok: false, text: e.message }))
  }, [postId])

  const set = <K extends keyof PostRequest>(k: K, v: PostRequest[K]) => setForm((f) => ({ ...f, [k]: v }))

  async function save(status: PostStatus) {
    setBusy(true)
    setMsg(null)
    const body: PostRequest = {
      ...form,
      status,
      slug: form.slug?.trim() || undefined,
      tags: tagsText.split(',').map((t) => t.trim()).filter(Boolean),
    }
    try {
      const saved = postId ? await api.updatePost(postId, body) : await api.createPost(body)
      setMsg({ ok: true, text: status === 'PUBLISHED' ? 'Published.' : 'Draft saved.' })
      if (!postId) navigate(`/admin/posts/${saved.meta.id}`, { replace: true })
      else set('status', status)
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message })
    } finally {
      setBusy(false)
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    save(form.status)
  }

  return (
    <form className="form editor" onSubmit={onSubmit}>
      <div className="row-between">
        <h1>{postId ? 'Edit post' : 'New post'}</h1>
        <span className={`pill ${form.status === 'PUBLISHED' ? 'pill-ok' : ''}`}>{form.status.toLowerCase()}</span>
      </div>
      <label>Title<input value={form.title} onChange={(e) => set('title', e.target.value)} required maxLength={200} /></label>
      <div className="form-row">
        <label>Slug <span className="muted small">(optional, auto from title)</span>
          <input value={form.slug} onChange={(e) => set('slug', e.target.value)} pattern="[a-z0-9]+(-[a-z0-9]+)*" />
        </label>
        <label>Tags <span className="muted small">(comma separated)</span>
          <input value={tagsText} onChange={(e) => setTagsText(e.target.value)} />
        </label>
      </div>
      <label>Summary<input value={form.summary} onChange={(e) => set('summary', e.target.value)} maxLength={500} /></label>
      <label>Cover image URL<input value={form.coverImage} onChange={(e) => set('coverImage', e.target.value)} maxLength={500} /></label>

      <div className="tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'write'} className={`chip ${tab === 'write' ? 'chip-active' : ''}`} onClick={() => setTab('write')}>Write</button>
        <button type="button" role="tab" aria-selected={tab === 'preview'} className={`chip ${tab === 'preview' ? 'chip-active' : ''}`} onClick={() => setTab('preview')}>Preview</button>
      </div>
      {tab === 'write' ? (
        <textarea className="md-input" value={form.content} onChange={(e) => set('content', e.target.value)} rows={22}
          required placeholder="Write in Markdown. Fenced code blocks get syntax highlighting." />
      ) : (
        <div className="card preview"><Markdown>{form.content || '_Nothing to preview yet._'}</Markdown></div>
      )}

      <div className="editor-actions">
        <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => save('DRAFT')}>Save draft</button>
        <button type="button" className="btn" disabled={busy} onClick={() => save('PUBLISHED')}>Publish</button>
        {msg && <span className={msg.ok ? 'success' : 'error'} role="status">{msg.text}</span>}
      </div>
    </form>
  )
}
