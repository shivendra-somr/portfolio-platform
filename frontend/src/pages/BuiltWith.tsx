import { Seo } from '../components/Seo'
import { SectionHeading } from '../components/Sections'

const decisions = [
  {
    title: 'Portfolio content lives in JSON, blog content in PostgreSQL',
    body: 'Profile, skills, experience and projects change rarely and are versioned with the code in src/static-data. Blog posts and comments change often and need search, moderation and analytics, so they live behind the API.',
  },
  {
    title: 'Stateless JWT with Spring’s OAuth2 resource server',
    body: 'Instead of a hand-rolled filter, tokens are HS256-signed with NimbusJwtEncoder and validated by the resource server. Roles travel in a "roles" claim and map to ROLE_ADMIN / ROLE_VISITOR authorities.',
  },
  {
    title: 'PostgreSQL full-text search before Elasticsearch',
    body: 'A generated, weighted tsvector column (title > summary > body) with a GIN index and websearch_to_tsquery covers search without another service to run.',
  },
  {
    title: 'Redis cache on the read path only',
    body: 'Single posts, popular posts and the tag list are cached; any admin write evicts them. View counts are incremented with a direct UPDATE so they never invalidate the cache.',
  },
  {
    title: 'Spam protection without CAPTCHAs',
    body: 'Comments and the contact form use a hidden honeypot field plus per-IP sliding-window rate limits. Comments are held for moderation by default.',
  },
  {
    title: 'Flyway owns the schema',
    body: 'Hibernate runs with ddl-auto=validate, so the app refuses to start if entities and migrations drift. Integration tests run the real migrations on PostgreSQL via Testcontainers.',
  },
]

export function BuiltWith() {
  return (
    <div className="container page">
      <Seo title="Built with" description="Architecture and design decisions behind this site." />
      <SectionHeading eyebrow="Under the hood" title="How this site is built" />

      <figure className="card arch">
        <svg viewBox="0 0 760 260" role="img" aria-labelledby="arch-title">
          <title id="arch-title">Architecture: React SPA calls Spring Boot API, which uses PostgreSQL and Redis</title>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
            </marker>
          </defs>
          <g className="arch-box"><rect x="10" y="90" width="180" height="80" rx="10" /><text x="100" y="122">React + TS (Vite)</text><text x="100" y="145" className="sub">static-data/*.json</text></g>
          <g className="arch-box"><rect x="290" y="90" width="180" height="80" rx="10" /><text x="100" y="122" transform="translate(280 0)">Spring Boot API</text><text x="100" y="145" transform="translate(280 0)" className="sub">Security · JPA · Cache</text></g>
          <g className="arch-box"><rect x="570" y="20" width="180" height="70" rx="10" /><text x="660" y="50">PostgreSQL</text><text x="660" y="72" className="sub">Flyway · FTS</text></g>
          <g className="arch-box"><rect x="570" y="170" width="180" height="70" rx="10" /><text x="660" y="200">Redis</text><text x="660" y="222" className="sub">post cache</text></g>
          <g className="arch-line">
            <line x1="190" y1="130" x2="288" y2="130" markerEnd="url(#arrow)" />
            <line x1="470" y1="115" x2="568" y2="60" markerEnd="url(#arrow)" />
            <line x1="470" y1="145" x2="568" y2="200" markerEnd="url(#arrow)" />
          </g>
          <text x="239" y="120" className="sub">REST + JWT</text>
        </svg>
      </figure>

      <div className="grid-2">
        {decisions.map((d) => (
          <article key={d.title} className="card">
            <h3>{d.title}</h3>
            <p>{d.body}</p>
          </article>
        ))}
      </div>
      <p className="muted">
        Try the API yourself: <a href="/swagger-ui.html">Swagger UI</a> (served by the backend).
      </p>
    </div>
  )
}
