import { useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useAsync } from '../lib/useAsync'
import { Seo } from '../components/Seo'
import { Loading, PostCard, SectionHeading } from '../components/Sections'
import { Icon } from '../components/Icon'

export function Blog() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const tag = params.get('tag') ?? ''
  const page = Number(params.get('page') ?? 0)
  const posts = useAsync(() => api.listPosts({ q, tag, page, size: 9 }), [q, tag, page])
  const tags = useAsync(() => api.tags(), [])

  const update = (next: Record<string, string>) => {
    const p = new URLSearchParams(params)
    for (const [k, v] of Object.entries(next)) {
      if (v) p.set(k, v)
      else p.delete(k)
    }
    if (!('page' in next)) p.delete('page')
    setParams(p)
  }

  return (
    <div className="container page">
      <Seo title="Blog" description="Notes on Java, Spring Boot, AI integration and data engineering." />
      <SectionHeading eyebrow="Writing" title="Blog"
        action={<a className="link-arrow" href="/api/feed.xml"><Icon name="rss" size={14} /> RSS</a>} />

      <form key={q} className="search" role="search" onSubmit={(e) => {
        e.preventDefault()
        update({ q: String(new FormData(e.currentTarget).get('q') ?? '').trim(), tag: '' })
      }}>
        <input type="search" name="q" placeholder="Search posts…" defaultValue={q} aria-label="Search posts" />
        <button className="btn">Search</button>
      </form>

      {tags.data && tags.data.length > 0 && (
        <div className="chips">
          <button className={`chip ${!tag ? 'chip-active' : ''}`} onClick={() => update({ tag: '' })}>All</button>
          {tags.data.map((t) => (
            <button key={t} className={`chip ${tag === t ? 'chip-active' : ''}`} onClick={() => update({ tag: t, q: '' })}>
              #{t}
            </button>
          ))}
        </div>
      )}

      {posts.loading && <Loading slow={posts.slow} />}
      {posts.error && (
        <p className="error">
          Couldn't load posts right now. <button className="link-btn" onClick={() => window.location.reload()}>Try again</button>
        </p>
      )}
      {posts.data && posts.data.items.length === 0 && (
        <p className="muted">{q || tag ? 'No posts match that.' : 'No posts published yet.'}</p>
      )}
      {posts.data && posts.data.items.length > 0 && (
        <>
          <div className="grid-3">{posts.data.items.map((p) => <PostCard key={p.id} post={p} />)}</div>
          {posts.data.totalPages > 1 && (
            <nav className="pager" aria-label="Pagination">
              <button className="btn btn-ghost" disabled={page === 0} onClick={() => update({ page: String(page - 1) })}>← Newer</button>
              <span className="muted">Page {page + 1} of {posts.data.totalPages}</span>
              <button className="btn btn-ghost" disabled={page + 1 >= posts.data.totalPages}
                onClick={() => update({ page: String(page + 1) })}>Older →</button>
            </nav>
          )}
        </>
      )}
    </div>
  )
}
