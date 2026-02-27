import config from '@payload-config'
import { Feed } from 'feed'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'
export const revalidate = 300

export async function GET() {
  const payload = await getPayload({ config })
  const posts = await payload.find({
    collection: 'blog',
    sort: '-publishedAt',
    where: { _status: { equals: 'published' } },
    limit: 50,
  })

  const author = { name: 'Fredrik August Madsen-Malmo', email: 'contact@fredrikmalmo.com' }

  const feed = new Feed({
    id: 'fredrik-augusts-technology-blog',
    title: "Fredrik's blog",
    description: 'I write blogs about programming, technology, and sometimes other things.',
    link: 'https://fredrikmalmo.com',
    feedLinks: { atom: 'https://fredrikmalmo.com/feed.xml' },
    author,
    updated: new Date(),
    copyright: '',
  })

  for (const post of posts.docs) {
    const url = `https://fredrikmalmo.com/blog/${post.slug}`
    feed.addItem({
      id: url,
      title: post.title,
      link: url,
      description: post.excerpt ?? '',
      date: post.publishedAt ? new Date(post.publishedAt) : new Date(post.createdAt),
      author: [author],
    })
  }

  return new Response(feed.atom1(), {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  })
}
