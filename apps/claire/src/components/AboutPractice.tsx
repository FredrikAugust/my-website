import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { RichText } from '@payloadcms/richtext-lexical/react'
import Link from 'next/link'

interface AboutPracticeProps {
  quote?: string | null
  body?: SerializedEditorState | null
}

export function AboutPractice({ quote, body }: AboutPracticeProps) {
  if (!quote && !body) return null

  return (
    <section className="bg-secondary py-24">
      <div className="mx-auto max-w-4xl px-6">
        {quote && (
          <blockquote className="font-heading text-2xl md:text-3xl lg:text-4xl leading-snug tracking-tight text-foreground/90 border-l-2 border-foreground/20 pl-8">
            {quote}
          </blockquote>
        )}
        {body && (
          <div className="mt-12 max-w-2xl text-muted-foreground leading-relaxed">
            <RichText data={body} />
          </div>
        )}
        <div className="mt-8">
          <Link
            href="/about"
            className="text-xs uppercase tracking-[0.2em] hover:tracking-[0.3em] transition-all"
          >
            Read More &rarr;
          </Link>
        </div>
      </div>
    </section>
  )
}
