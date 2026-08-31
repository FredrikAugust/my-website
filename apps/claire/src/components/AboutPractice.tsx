import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import Link from 'next/link'

interface AboutPracticeProps {
  quote?: string | null
  body?: SerializedEditorState | null
}

export function AboutPractice({ quote, body }: AboutPracticeProps) {
  if (!quote && !body) return null

  return (
    <section className="bg-[#eff0eb] px-5 pb-32 pt-10 text-[#11110f] md:px-9 md:pb-48">
      <div className="mx-auto grid max-w-[105rem] gap-16 border-t border-black/30 pt-6 md:grid-cols-[0.55fr_1.45fr]">
        <p className="font-heading text-xl text-black/48">About the practice</p>
        <div>
          {quote ? (
            <blockquote className="max-w-[24ch] font-heading text-[clamp(2.8rem,5.4vw,6.5rem)] leading-[0.96] tracking-[-0.045em]">
              {quote}
            </blockquote>
          ) : null}
          <div className="mt-14 flex flex-wrap gap-x-10 gap-y-5 text-sm">
            <Link href="/about" className="text-link-underline">
              Read more
            </Link>
            <Link href="/about#contact" className="text-link-underline text-[#355c45]">
              Begin a conversation
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
