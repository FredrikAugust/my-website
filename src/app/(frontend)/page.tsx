export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { GuestbookForm } from '@/components/GuestbookForm'
import { deleteComment } from '@/actions/guestbook'
import { timeAgo } from '@/lib/time'

export default async function HomePage() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  const [blogPosts, guestbookEntries] = await Promise.all([
    payload.find({
      collection: 'blog',
      sort: '-publishedAt',
      limit: 3,
      where: { status: { equals: 'published' } },
    }),
    payload.find({
      collection: 'guestbook-entry',
      sort: '-createdAt',
      limit: 100,
    }),
  ])

  const turnstileSitekey = process.env.CF_TURNSTILE_SITEKEY ?? ''

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="!text-4xl !leading-[1.3] !font-bold !font-display text-transparent bg-clip-text bg-contain bg-[url('/images/sparkles.gif')]">
          Fredrik&apos;s Homepage
        </h1>
        <div className="text-muted-foreground text-sm mt-1 space-y-1">
          <p>
            Here you can read about my experiments and experiences with various technologies.
          </p>
          <p>I hope you enjoy your visit. Please leave a message in the guestbook if you did.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Blog posts */}
        <section className="flex flex-col gap-3">
          <h2>Recent blog posts</h2>
          <div className="flex flex-col gap-3">
            {blogPosts.docs.map((post) => (
              <div key={post.id} className="flex flex-col">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                <p className="text-sm">{post.excerpt}</p>
                <small>Published {timeAgo(post.publishedAt!)}</small>
              </div>
            ))}
            <Link href="/blog">See more &rarr;</Link>
          </div>
        </section>

        {/* Guestbook */}
        <section>
          <img className="w-30" src="/images/guestbook.gif" alt="an old man writing in a guestbook" />
          <Card className="border-border shadow-sm bg-[url('/images/paper.jpg')] bg-cover">
            <CardContent className="h-80 overflow-y-auto p-3 flex flex-col gap-1.5">
              {guestbookEntries.docs.map((entry) => (
                <div key={entry.id} className="text-sm">
                  <div className="flex gap-1 items-center flex-wrap">
                    <span className="font-bold">{entry.name}</span>
                    <small title={new Date(entry.createdAt).toISOString()}>
                      {timeAgo(entry.createdAt)}
                    </small>
                    {user && (
                      <form action={deleteComment}>
                        <input type="hidden" name="comment_id" value={entry.id} />
                        <button
                          type="submit"
                          className="text-destructive text-xs font-sans cursor-pointer hover:underline"
                        >
                          Delete
                        </button>
                      </form>
                    )}
                  </div>
                  <span className="whitespace-pre-wrap">{entry.message}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <GuestbookForm turnstileSitekey={turnstileSitekey} />
        </section>
      </div>
    </div>
  )
}
