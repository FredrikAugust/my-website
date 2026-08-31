import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import Link from 'next/link'

interface AboutPracticeProps {
  quote?: string | null
  body?: SerializedEditorState | null
}

export function AboutPractice({ quote, body }: AboutPracticeProps) {
  if (!quote && !body) return null

  return (
    <section className="score-grid bg-[#1648ff] px-6 py-24 text-white md:px-10 md:py-36">
      <div className="mx-auto grid max-w-[96rem] grid-cols-12 gap-x-4 md:gap-x-6">
        <div className="col-span-12 mb-16 flex justify-between border-y border-white/40 py-3 text-xs uppercase tracking-[0.2em] md:col-span-3 md:mb-0 md:block">
          <p>Movement 04</p>
          <p className="md:mt-2">Practice</p>
        </div>
        <div className="col-span-12 md:col-span-8 md:col-start-5">
          {quote && (
            <blockquote className="max-w-[20ch] font-heading text-4xl uppercase leading-[0.98] tracking-[0.035em] md:text-6xl">
              {quote}
            </blockquote>
          )}
          <div className="mt-14 flex flex-wrap items-center gap-8 border-t border-white/40 pt-4">
            <Link href="/about" className="text-link-underline text-xs uppercase tracking-[0.2em]">
              Read the practice ⟶
            </Link>
            <Link
              href="/about#contact"
              className="text-link-underline text-xs uppercase tracking-[0.2em]"
            >
              Contact / collaborate
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
