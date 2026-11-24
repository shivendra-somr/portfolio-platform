import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Experience, Project, SkillGroup } from '../types/portfolio'
import type { PostSummary } from '../types/api'
import { formatDate, formatRange } from '../lib/format'
import { Icon } from './Icon'

export function SectionHeading({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  )
}

export function TagList({ items, small }: { items: string[]; small?: boolean }) {
  return (
    <ul className={`tags ${small ? 'tags-sm' : ''}`}>
      {items.map((t) => <li key={t}>{t}</li>)}
    </ul>
  )
}

export function SkillGrid({ groups }: { groups: SkillGroup[] }) {
  return (
    <div className="skill-grid">
      {groups.map((g) => (
        <div key={g.category} className="card skill-card">
          <h3>{g.category}</h3>
          <TagList items={g.items} small />
        </div>
      ))}
    </div>
  )
}

export function ExperienceTimeline({ items }: { items: Experience[] }) {
  return (
    <ol className="timeline">
      {items.map((e) => (
        <li key={e.id} className="timeline-item">
          <div className="timeline-dot" aria-hidden />
          <div className="card">
            <div className="row-between">
              <div>
                <h3>{e.role}</h3>
                <p className="muted">
                  {e.companyUrl ? <a href={e.companyUrl} target="_blank" rel="noreferrer">{e.company}</a> : e.company}
                  {' · '}{e.location}
                </p>
              </div>
              <span className="pill">{formatRange(e.startDate, e.current ? null : e.endDate)}</span>
            </div>
            {e.summary && <p>{e.summary}</p>}
            <ul className="bullets">
              {e.highlights.map((h) => <li key={h}>{h}</li>)}
            </ul>
            <TagList items={e.tech} small />
          </div>
        </li>
      ))}
    </ol>
  )
}

export function ProjectCard({ project, expanded }: { project: Project; expanded?: boolean }) {
  return (
    <article className="card project-card">
      <p className="eyebrow">{project.category}</p>
      <h3>{project.title}</h3>
      <p className="muted">{project.subtitle}</p>
      <p>{project.description}</p>
      {project.metrics && (
        <dl className="metrics">
          {project.metrics.map((m) => (
            <div key={m.label}><dt>{m.value}</dt><dd>{m.label}</dd></div>
          ))}
        </dl>
      )}
      {expanded && (
        <ul className="bullets">
          {project.highlights.map((h) => <li key={h}>{h}</li>)}
        </ul>
      )}
      <TagList items={project.tech} small />
      {(project.url || project.repoUrl) && (
        <div className="card-links">
          {project.url && <a href={project.url} target="_blank" rel="noreferrer">Live site <Icon name="external" size={14} /></a>}
          {project.repoUrl && <a href={project.repoUrl} target="_blank" rel="noreferrer">Source <Icon name="github" size={14} /></a>}
        </div>
      )}
    </article>
  )
}

export function PostCard({ post }: { post: PostSummary }) {
  return (
    <article className="card post-card">
      <p className="muted small">
        {formatDate(post.publishedAt)} · {post.readingMinutes} min read
      </p>
      <h3><Link to={`/blog/${post.slug}`}>{post.title}</Link></h3>
      {post.summary && <p>{post.summary}</p>}
      <TagList items={post.tags} small />
    </article>
  )
}

/** Loading line that explains a slow first load (free backend waking from sleep). */
export function Loading({ slow, label = 'Loading…' }: { slow?: boolean; label?: string }) {
  return (
    <p className="muted" role="status">
      {slow ? 'Waking up the server. Free hosting sleeps when idle, so the first load can take up to a minute…' : label}
    </p>
  )
}
