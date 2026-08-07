interface CVPiece {
  name: string
  role?: string | null
  id?: string | null
}

interface CVEntry {
  year: number
  yearEnd?: number | null
  title: string
  venue?: string | null
  location?: string | null
  details?: string | null
  pieces?: CVPiece[] | null
  id?: string | null
}

interface CVSectionProps {
  title: string
  entries: CVEntry[]
  compact?: boolean
}

function formatYear(year: number, yearEnd?: number | null): string {
  if (yearEnd && yearEnd !== year) return `${year}–${yearEnd}`
  return String(year)
}

export function CVSection({ title, entries, compact = false }: CVSectionProps) {
  return (
    <div className="mb-12">
      <h2 className="font-heading text-2xl tracking-tight mb-6 pb-3 border-b border-border">
        {title}
      </h2>
      <div className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.id} className="grid grid-cols-[80px_1fr] gap-4">
            <span className="text-sm text-muted-foreground tabular-nums">
              {formatYear(entry.year, entry.yearEnd)}
            </span>
            <div>
              <span className="text-sm">{entry.title}</span>
              {!compact && entry.venue && (
                <span className="text-sm text-muted-foreground">, {entry.venue}</span>
              )}
              {!compact && entry.location && (
                <span className="text-sm text-muted-foreground">, {entry.location}</span>
              )}
              {compact && entry.details && (
                <span className="text-sm text-muted-foreground">, {entry.details}</span>
              )}
              {entry.pieces && entry.pieces.length > 0 && (
                <ul className="mt-1 ml-4 space-y-0.5">
                  {entry.pieces.map((piece) => (
                    <li key={piece.id} className="text-sm text-muted-foreground">
                      <span className="mr-1">&bull;</span>
                      {piece.name}
                      {piece.role && (
                        <span className="text-muted-foreground/70"> ({piece.role})</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
