interface Credit {
  id?: string | null
  name: string
  role: string
}

export function Credits({ credits }: { credits?: Credit[] | null }) {
  if (!credits?.length) return null
  return (
    <div className="credits">
      <h2 className="credits-heading">Credits</h2>
      <dl className="credits-list">
        {credits.map((credit) => (
          <div key={credit.id ?? `${credit.name}-${credit.role}`} className="credit-row">
            <dt>{credit.role}</dt>
            <dd>{credit.name}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
