'use client'

export function PrintCV() {
  return (
    <button type="button" className="text-link print-button" onClick={() => window.print()}>
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M6 9V3h12v6M6 17H3V9h18v8h-3M6 14h12v7H6zM17 12h1" />
      </svg>
      Print / Save PDF
    </button>
  )
}
