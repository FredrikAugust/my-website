import { WorkRow, type WorkRowData } from './WorkRow'

interface WorksGridProps {
  works: WorkRowData[]
  label: string
  subtitle?: string | null
  description?: string | null
}

export function WorksGrid({ works, label, subtitle, description }: WorksGridProps) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-16">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">{label}</p>
        {subtitle && (
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl tracking-tight">
            {subtitle}
          </h1>
        )}
        {description && (
          <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>
      <div className="space-y-24">
        {works.map((work, i) => (
          <WorkRow key={work.id} work={work} reverse={i % 2 === 1} />
        ))}
      </div>
    </section>
  )
}
