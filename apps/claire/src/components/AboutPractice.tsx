import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import Link from 'next/link'

interface AboutPracticeProps {
  quote?: string | null
  body?: SerializedEditorState | null
}

export function AboutPractice({ quote, body }: AboutPracticeProps) {
  if (!quote && !body) return null

  return (
    <section className="bg-[#070707] px-5 py-28 text-[#f3f1ea] md:px-9 md:py-44">
      <div className="mx-auto grid max-w-[105rem] gap-16 border-t border-white/20 pt-6 md:grid-cols-[0.55fr_1.45fr]">
        <p className="font-heading text-xl text-[#f3f1ea]/48">The practice</p>
        <div>
          {quote ? (
            <blockquote className="max-w-[24ch] font-heading text-[clamp(2.8rem,5.4vw,6.5rem)] leading-[0.96] tracking-[-0.045em]">
              {quote}
            </blockquote>
          ) : null}
          <div className="mt-14 flex flex-wrap gap-x-10 gap-y-5 text-sm">
            <Link href="/about" className="text-link-underline">
              Read about the practice
            </Link>
            <Link href="/about#contact" className="text-link-underline text-[#ff532e]">
              Begin a conversation
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
