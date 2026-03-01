export const revalidate = 60;

import { BlogPostCard } from "@/components/BlogPostCard";
import { GuestbookEntries } from "@/components/GuestbookEntries";
import { GuestbookForm } from "@/components/GuestbookForm";
import { FadeIn, FadeUp, StaggerContainer, StaggerItem } from "@/components/Motion";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import config from "@payload-config";
import Image from "next/image";
import { getPayload } from "payload";

export default async function HomePage() {
  const payload = await getPayload({ config });

  const [blogPosts, guestbookEntries] = await Promise.all([
    payload.find({
      collection: "blog",
      draft: false,
      sort: "-publishedAt",
      limit: 0,
      where: { _status: { equals: "published" } },
      select: { id: true, slug: true, title: true, excerpt: true, publishedAt: true },
    }),
    payload.find({
      collection: "guestbook-entry",
      sort: "-createdAt",
      limit: 100,
      pagination: false,
      select: { id: true, name: true, message: true, createdAt: true },
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
          <p className="text-muted-foreground text-sm mt-1 leading-7">
            Welcome! I&apos;m Fredrik &mdash; a software engineer who enjoys tinkering with
            infrastructure, programming languages, and whatever else catches my curiosity. Have a
            look around and feel free to leave a note in the guestbook.
          </p>
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
                <GuestbookEntries entries={guestbookEntries.docs} />
              </ScrollArea>
            </Card>
            <GuestbookForm turnstileSitekey={turnstileSitekey} />
          </section>
        </FadeIn>
      </div>
    </div>
  );
}
