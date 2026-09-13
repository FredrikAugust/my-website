export function Arrow({ direction = 'right' }: { direction?: 'left' | 'right' }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      className="link-arrow"
    >
      <path d={direction === 'left' ? 'M20 12H4m7-7-7 7 7 7' : 'M4 12h16m-7-7 7 7-7 7'} />
    </svg>
  )
}
