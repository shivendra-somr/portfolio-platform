import { useMemo, useState } from 'react'
import { projects } from '../data'
import { Seo } from '../components/Seo'
import { ProjectCard, SectionHeading } from '../components/Sections'

export function Projects() {
  const categories = useMemo(() => ['All', ...new Set(projects.map((p) => p.category))], [])
  const [active, setActive] = useState('All')
  const shown = active === 'All' ? projects : projects.filter((p) => p.category === active)

  return (
    <div className="container page">
      <Seo title="Projects" description="Backend, AI and data-engineering projects." />
      <SectionHeading eyebrow="Work" title="Projects" />
      <div className="chips" role="tablist" aria-label="Filter by category">
        {categories.map((c) => (
          <button key={c} role="tab" aria-selected={active === c} className={`chip ${active === c ? 'chip-active' : ''}`}
            onClick={() => setActive(c)}>
            {c}
          </button>
        ))}
      </div>
      <div className="grid-2">
        {shown.map((p) => <ProjectCard key={p.id} project={p} expanded />)}
      </div>
    </div>
  )
}
