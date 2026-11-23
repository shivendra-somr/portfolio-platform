import { Link } from 'react-router-dom'
import { experience, featuredProjects, profile, skills } from '../data'
import { api } from '../lib/api'
import { useAsync } from '../lib/useAsync'
import { Seo } from '../components/Seo'
import { Icon } from '../components/Icon'
import { ExperienceTimeline, PostCard, ProjectCard, SectionHeading, SkillGrid } from '../components/Sections'

export function Home() {
  const posts = useAsync(() => api.listPosts({ size: 3 }), [])

  return (
    <>
      <Seo />
      <section className="hero">
        <div className="container">
          {profile.availableForWork && <p className="badge"><span className="dot" /> Open to opportunities</p>}
          <h1>
            Hi, I'm {profile.name.split(' ')[0]}.<br />
            <span className="accent">{profile.headline}.</span>
          </h1>
          <p className="lead">{profile.tagline}</p>
          <p className="hero-summary">{profile.summary}</p>
          <div className="hero-actions">
            <Link to="/projects" className="btn">View projects</Link>
            <a href={profile.resumeUrl} className="btn btn-ghost" download>
              <Icon name="download" size={16} /> Resume
            </a>
            <Link to="/contact" className="btn btn-ghost">Get in touch</Link>
          </div>
          <dl className="stats">
            {profile.highlights.map((h) => (
              <div key={h.label}><dt>{h.value}</dt><dd>{h.label}</dd></div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Toolbox" title="Skills" />
          <SkillGrid groups={skills} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Career" title="Experience" />
          <ExperienceTimeline items={experience} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Selected work" title="Featured projects"
            action={<Link to="/projects" className="link-arrow">All projects →</Link>} />
          <div className="grid-2">
            {featuredProjects.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Writing" title="Latest posts"
            action={<Link to="/blog" className="link-arrow">All posts →</Link>} />
          {posts.loading && <p className="muted">Loading posts…</p>}
          {posts.error && <p className="muted">The blog API isn't reachable right now.</p>}
          {posts.data && posts.data.items.length === 0 && <p className="muted">First posts coming soon.</p>}
          {posts.data && posts.data.items.length > 0 && (
            <div className="grid-3">{posts.data.items.map((p) => <PostCard key={p.id} post={p} />)}</div>
          )}
        </div>
      </section>
    </>
  )
}
