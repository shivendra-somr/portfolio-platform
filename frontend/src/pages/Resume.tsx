import { certifications, education, experience, profile, projects, skills } from '../data'
import { formatRange, formatMonth } from '../lib/format'
import { Seo } from '../components/Seo'
import { Icon } from '../components/Icon'

export function Resume() {
  return (
    <div className="container page resume">
      <Seo title="Resume" />
      <div className="row-between">
        <div>
          <h1>{profile.name}</h1>
          <p className="lead">{profile.headline} · {profile.tagline}</p>
          <p className="muted">
            {profile.location} · <a href={`mailto:${profile.email}`}>{profile.email}</a>
            {profile.showPhone && <> · {profile.phone}</>}
          </p>
        </div>
        <a href={profile.resumeUrl} className="btn" download><Icon name="download" size={16} /> Download PDF</a>
      </div>

      <section>
        <h2>Summary</h2>
        <p>{profile.summary}</p>
      </section>

      <section>
        <h2>Skills</h2>
        <dl className="resume-skills">
          {skills.map((g) => (
            <div key={g.category}><dt>{g.category}</dt><dd>{g.items.join(', ')}</dd></div>
          ))}
        </dl>
      </section>

      <section>
        <h2>Experience</h2>
        {experience.map((e) => (
          <div key={e.id} className="resume-entry">
            <div className="row-between">
              <h3>{e.role} · {e.company}</h3>
              <span className="muted">{e.location} · {formatRange(e.startDate, e.current ? null : e.endDate)}</span>
            </div>
            <ul className="bullets">{e.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
          </div>
        ))}
      </section>

      <section>
        <h2>Selected projects</h2>
        {projects.filter((p) => p.featured).map((p) => (
          <div key={p.id} className="resume-entry">
            <div className="row-between">
              <h3>{p.title} — {p.subtitle}</h3>
              <span className="muted">{p.category}</span>
            </div>
            <p className="muted small"><em>Technologies: {p.tech.join(', ')}</em></p>
            <ul className="bullets">{p.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
          </div>
        ))}
      </section>

      <section>
        <h2>Education</h2>
        {education.map((e) => (
          <div key={e.degree} className="row-between resume-line">
            <span><strong>{e.degree}</strong> · {e.institution}</span>
            <span className="muted">{formatMonth(e.startDate)} – {formatMonth(e.endDate)}</span>
          </div>
        ))}
      </section>

      <section>
        <h2>Certifications & achievements</h2>
        <ul className="bullets">
          {certifications.map((c) => (
            <li key={c.title}>{c.url ? <a href={c.url} target="_blank" rel="noreferrer">{c.title}</a> : c.title}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
