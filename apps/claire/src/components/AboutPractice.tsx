import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import Link from 'next/link'

interface AboutPracticeProps {
  quote?: string | null
  body?: SerializedEditorState | null
}

export function AboutPractice({ quote, body }: AboutPracticeProps) {
  if (!quote && !body) return null

  return (
    <section className="bg-[#7e332b] px-6 py-24 text-[#f2efe7] md:px-10 md:py-36">
      <div className="mx-auto grid max-w-[96rem] gap-12 md:grid-cols-[1fr_2fr]">
        <p className="text-xs uppercase tracking-[0.2em] text-[#f2efe7]/65">Practice / 04</p>
        <div>
          {quote && (
            <blockquote className="max-w-[22ch] font-heading text-3xl leading-[1.03] tracking-[-0.03em] md:text-5xl lg:text-6xl">
              {quote}
            </blockquote>
          )}
          <div className="mt-12 flex flex-wrap items-center gap-8 border-t border-[#f2efe7]/35 pt-5">
            <Link href="/about" className="text-link-underline text-xs uppercase tracking-[0.2em]">
              Read about the practice &rarr;
            </Link>
            <Link
              href="/about#contact"
              className="text-link-underline text-xs uppercase tracking-[0.2em]"
            >
              Start a conversation
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
