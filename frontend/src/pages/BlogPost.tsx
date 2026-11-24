import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, ApiError } from '../lib/api'
import { formatDate } from '../lib/format'
import { useAsync } from '../lib/useAsync'
import { Seo } from '../components/Seo'
import { Markdown } from '../components/Markdown'
import { Comments } from '../components/Comments'
import { Loading, TagList } from '../components/Sections'
import { Icon } from '../components/Icon'

export function BlogPost() {
  const { slug = '' } = useParams()
  const { data, error, loading, slow } = useAsync(() => api.getPost(slug), [slug])
  const [likes, setLikes] = useState<number | null>(null)
  const [liked, setLiked] = useState(false)

  if (loading) return <div className="container page"><Loading slow={slow} /></div>
  if (error) {
    const notFound = error instanceof ApiError && error.status === 404
    return (
      <div className="container page">
        <h1>{notFound ? 'Post not found' : 'Something went wrong'}</h1>
        <p><Link to="/blog">← Back to blog</Link></p>
      </div>
    )
  }
  if (!data) return null
  const { meta, content } = data

  async function like() {
    if (liked) return
    setLiked(true)
    try {
      const res = await api.likePost(slug)
      setLikes(res.likes)
    } catch {
      setLiked(false)
    }
  }

  return (
    <article className="container page post">
      <Seo title={meta.title} description={meta.summary ?? undefined} />
      <p><Link to="/blog" className="muted">← All posts</Link></p>
      <header className="post-header">
        <h1>{meta.title}</h1>
        <p className="muted">{formatDate(meta.publishedAt)} · {meta.readingMinutes} min read</p>
        <TagList items={meta.tags} small />
      </header>
      {meta.coverImage && <img className="cover" src={meta.coverImage} alt="" />}
      <Markdown>{content}</Markdown>
      <div className="post-actions">
        <button className={`btn btn-ghost like ${liked ? 'liked' : ''}`} onClick={like} aria-pressed={liked}>
          <Icon name="heart" size={16} /> {likes ?? meta.likeCount}
        </button>
      </div>
      <Comments slug={slug} />
    </article>
  )
}
