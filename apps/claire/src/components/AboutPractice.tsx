import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import Link from 'next/link'

interface AboutPracticeProps {
  quote?: string | null
  body?: SerializedEditorState | null
}

export function AboutPractice({ quote, body }: AboutPracticeProps) {
  if (!quote && !body) return null

  return (
    <section className="bg-[#0a0a0a] px-6 py-24 text-[#f0ede6] md:px-10 md:py-36">
      <div className="mx-auto grid max-w-[96rem] gap-12 md:grid-cols-[1fr_2fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#ef6b2e]">
            Final scene / Practice
          </p>
          <p className="mt-3 text-sm text-[#f0ede6]/50">The work continues beyond the frame.</p>
        </div>
        <div>
          {quote && (
            <blockquote className="max-w-[20ch] font-heading text-4xl leading-[1.01] tracking-[-0.035em] md:text-6xl">
              {quote}
            </blockquote>
          )}
          <div className="mt-14 flex flex-wrap gap-8 border-t border-[#f0ede6]/25 pt-5">
            <Link href="/about" className="text-link-underline text-xs uppercase tracking-[0.2em]">
              About the practice →
            </Link>
            <Link
              href="/about#contact"
              className="text-link-underline text-xs uppercase tracking-[0.2em] text-[#ef6b2e]"
            >
              Begin a conversation
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
