import Link from 'next/link'

interface ProjectNavigationProps {
  nextWork?: { title: string; slug: string } | null
  category?: string
}

export function ProjectNavigation({ nextWork, category }: ProjectNavigationProps) {
  const backHref =
    category === 'film' ? '/film' : category === 'performance' ? '/performance' : '/works'
  const backLabel =
    category === 'film' ? 'Film' : category === 'performance' ? 'Performance' : 'Works'

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 border-t border-border">
      <div className="flex items-center justify-between">
        <Link
          href={backHref}
          className="text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back to {backLabel}
        </Link>
        {nextWork && (
          <Link
            href={`/works/${nextWork.slug}`}
            className="text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
          >
            Next: {nextWork.title} &rarr;
          </Link>
        )}
      </div>
    </div>
  )
}
