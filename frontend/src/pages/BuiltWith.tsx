import { builtWith } from '../data'
import { Seo } from '../components/Seo'
import { SectionHeading } from '../components/Sections'

function ArchBox({ x, y, w, h, title, subtitle }: { x: number; y: number; w: number; h: number; title: string; subtitle: string }) {
  const cx = x + w / 2
  return (
    <g className="arch-box">
      <rect x={x} y={y} width={w} height={h} rx="10" />
      <text x={cx} y={y + h / 2 - 4}>{title}</text>
      <text x={cx} y={y + h / 2 + 16} className="sub">{subtitle}</text>
    </g>
  )
}

export function BuiltWith() {
  const { intro, architecture: a, stack, decisions } = builtWith

  return (
    <div className="container page">
      <Seo title="Built with" description="Tech stack, architecture and design decisions behind this site." />
      <SectionHeading eyebrow="Under the hood" title="How this site is built" />
      <p className="lead built-intro">{intro}</p>

      <figure className="card arch">
        <svg viewBox="0 0 800 270" role="img" aria-labelledby="arch-title">
          <title id="arch-title">
            {`Architecture: ${a.frontend.title} calls ${a.backend.title}, which uses ${a.database.title} and a ${a.cache.title.toLowerCase()}`}
          </title>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
            </marker>
          </defs>
          <ArchBox x={10} y={95} w={210} h={80} {...a.frontend} />
          <ArchBox x={300} y={95} w={210} h={80} {...a.backend} />
          <ArchBox x={580} y={15} w={210} h={80} {...a.database} />
          <ArchBox x={580} y={175} w={210} h={80} {...a.cache} />
          <g className="arch-line">
            <line x1="220" y1="135" x2="298" y2="135" markerEnd="url(#arrow)" />
            <line x1="510" y1="118" x2="578" y2="62" markerEnd="url(#arrow)" />
            <line x1="510" y1="152" x2="578" y2="208" markerEnd="url(#arrow)" strokeDasharray="5 4" />
          </g>
          <text x="259" y="122" className="sub">{a.link}</text>
        </svg>
      </figure>

      <section className="section">
        <SectionHeading eyebrow="Stack" title="Tech stack" />
        <div className="stack-grid">
          {stack.map((group) => (
            <div key={group.layer} className="card">
              <h3>{group.layer}</h3>
              <dl className="stack-list">
                {group.items.map((item) => (
                  <div key={item.name}>
                    <dt>{item.name}</dt>
                    <dd>{item.purpose}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeading eyebrow="Trade-offs" title="Design decisions" />
        <div className="grid-2">
          {decisions.map((d) => (
            <article key={d.title} className="card">
              <h3>{d.title}</h3>
              <p>{d.body}</p>
            </article>
          ))}
        </div>
      </section>

      <p className="muted">
        Try the API yourself in <a href="/swagger-ui.html">Swagger UI</a>, or read the{' '}
        <a href="/blog">blog posts</a> about how it was built.
      </p>
    </div>
  )
}
