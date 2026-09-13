import { WorkRow, type WorkRowData } from './WorkRow'

interface WorksGridProps {
  works: WorkRowData[]
  label: string
  subtitle?: string | null
  description?: string | null
}

export function WorksGrid({ works, label, subtitle, description }: WorksGridProps) {
  return (
    <section className="site-shell page-section">
      <div className="page-intro">
        <h1 className="page-title">{label}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
        {description && <p className="prose-copy intro-copy">{description}</p>}
      </div>
      <div className="project-index">
        {works.map((work, i) => (
          <WorkRow key={work.id} work={work} reverse={i % 2 === 1} />
        ))}
      </div>
    </section>
  )
}
