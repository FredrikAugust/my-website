export const revalidate = 60;

import { deleteComment } from "@/actions/guestbook";
import { BlogPostCard } from "@/components/BlogPostCard";
import { GuestbookForm } from "@/components/GuestbookForm";
import { FadeIn, FadeUp, StaggerContainer, StaggerItem } from "@/components/Motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { timeAgo } from "@/lib/time";
import config from "@payload-config";
import { headers } from "next/headers";
import Image from "next/image";
import { getPayload } from "payload";

export default async function HomePage() {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await headers() });

  const [blogPosts, guestbookEntries] = await Promise.all([
    payload.find({
      collection: "blog",
      sort: "-publishedAt",
      limit: 0,
      where: { _status: { equals: "published" } },
    }),
    payload.find({
      collection: "guestbook-entry",
      sort: "-createdAt",
      limit: 100,
    }),
  ]);

  const turnstileSitekey = process.env.CF_TURNSTILE_SITEKEY ?? "";

  return (
    <div className="flex flex-col gap-4">
      <FadeUp>
        <div>
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight font-display text-transparent bg-clip-text bg-contain bg-[url('/images/sparkles.gif')] dark:bg-linear-to-r dark:from-amber-200 dark:to-orange-300">
            Fredrik&apos;s Homepage
          </h1>
          <div className="text-muted-foreground text-sm mt-1 space-y-1">
            <p className="leading-7">
              Welcome! I&apos;m Fredrik &mdash; a software engineer who enjoys tinkering with
              infrastructure, programming languages, and whatever else catches my curiosity.
            </p>
            <p className="leading-7">
              Have a look around and feel free to leave a note in the guestbook.
            </p>
          </div>
        </div>
      </FadeUp>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Blog posts */}
        <section className="flex flex-col gap-3">
          <FadeUp>
            <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight">Blog posts</h2>
          </FadeUp>
          <StaggerContainer className="flex flex-col gap-3">
            {blogPosts.docs.map((post) => (
              <StaggerItem key={post.id}>
                <BlogPostCard post={post} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* Guestbook */}
        <FadeIn delay={0.15}>
          <section>
            <Image
              className="w-30"
              src="/images/guestbook.gif"
              alt="an old man writing in a guestbook"
              width={120}
              height={120}
              unoptimized
            />
            <Card className="border-border shadow-sm bg-[url('/images/paper.jpg')] bg-cover dark:bg-none dark:bg-card p-2">
              <ScrollArea className="h-80">
                <div className="flex flex-col gap-1.5">
                  {guestbookEntries.docs.map((entry) => (
                    <div key={entry.id} className="text-sm">
                      <div className="flex gap-1 items-center flex-wrap">
                        <span className="font-bold">{entry.name}</span>
                        <small
                          className="text-sm leading-none font-medium text-muted-foreground"
                          title={new Date(entry.createdAt).toISOString()}
                        >
                          {timeAgo(entry.createdAt)}
                        </small>
                        {user && (
                          <form action={deleteComment}>
                            <input type="hidden" name="comment_id" value={entry.id} />
                            <Button type="submit" variant="destructive" size="xs">
                              Delete
                            </Button>
                          </form>
                        )}
                      </div>
                      <span className="whitespace-pre-wrap">{entry.message}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
            <GuestbookForm turnstileSitekey={turnstileSitekey} />
          </section>
        </FadeIn>
      </div>
    </div>
  );
}
