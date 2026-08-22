interface Credit {
  id?: string | null
  name: string
  role: string
}

export function Credits({ credits }: { credits?: Credit[] | null }) {
  if (!credits?.length) return null
  return (
    <div>
      <h2 className="mb-3 text-xs uppercase tracking-[0.15em] text-muted-foreground">Credits</h2>
      <ul className="space-y-2">
        {credits.map((credit) => (
          <li key={credit.id ?? `${credit.name}-${credit.role}`} className="text-sm">
            <span>{credit.name}</span>
            <span className="text-muted-foreground"> — {credit.role}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
