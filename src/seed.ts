import config from "@payload-config";
import { getPayload } from "payload";
import sharp from "sharp";

// ── Helpers ──────────────────────────────────────────────────

function makeLexicalContent(paragraphs: string[]) {
  return {
    root: {
      type: "root",
      direction: "ltr" as const,
      format: "" as const,
      indent: 0,
      version: 1,
      children: paragraphs.map((text) => ({
        type: "paragraph",
        direction: "ltr" as const,
        format: "" as const,
        indent: 0,
        version: 1,
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal" as const,
            style: "",
            text,
            type: "text",
            version: 1,
          },
        ],
      })),
    },
  };
}

async function generateImage(label: string, r: number, g: number, b: number): Promise<Buffer> {
  // Create an SVG with a colored background and white text label
  const svg = `
    <svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
      <rect width="1920" height="1080" fill="rgb(${r},${g},${b})" />
      <text x="960" y="560" font-family="sans-serif" font-size="72"
            fill="white" text-anchor="middle" dominant-baseline="middle">
        ${label}
      </text>
    </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

// ── Test Data ────────────────────────────────────────────────

const blogPosts = [
  {
    title: "Getting Started with Next.js 15",
    slug: "getting-started-nextjs-15",
    _status: "published" as const,
    excerpt:
      "A beginner-friendly guide to building modern web applications with Next.js 15 and the App Router.",
    tags: [{ tag: "nextjs" }, { tag: "react" }, { tag: "tutorial" }],
    content: makeLexicalContent([
      "Next.js 15 represents a significant step forward for the React ecosystem. With the App Router now stable, building performant web applications has never been easier.",
      "The new server components model allows you to write components that render entirely on the server, reducing the JavaScript bundle sent to the client. This leads to faster page loads and better SEO.",
      "In this post, we will walk through setting up a new Next.js 15 project, configuring TypeScript, and building your first pages using the App Router pattern.",
      "One of the most exciting features is Turbopack, the Rust-based bundler that replaces Webpack in development mode. It offers dramatically faster hot module replacement and build times.",
      "To get started, simply run npx create-next-app@latest and follow the prompts. Make sure to select the App Router option when asked.",
    ]),
    color: { r: 45, g: 100, b: 160 },
    daysAgo: 3,
  },
  {
    title: "Why I Switched to Payload CMS",
    slug: "why-i-switched-to-payload-cms",
    _status: "published" as const,
    excerpt:
      "After years of using various headless CMS platforms, I finally found one that feels like it was built for developers.",
    tags: [{ tag: "payload" }, { tag: "cms" }, { tag: "typescript" }],
    content: makeLexicalContent([
      "I have tried many content management systems over the years. WordPress, Strapi, Sanity, Contentful — each had their strengths, but none felt quite right for my workflow.",
      "Payload CMS changed everything. It lives directly inside your Next.js application, speaks TypeScript natively, and gives you a fully customizable admin panel out of the box.",
      "The Local API is particularly powerful. Instead of making HTTP requests to fetch your content, you can query the database directly in your server components. No REST, no GraphQL — just direct database access with full type safety.",
      "The access control system is elegant and flexible. You define permissions per collection using simple functions that receive the request context. Need public reads but authenticated writes? A few lines of code.",
      "If you are a TypeScript developer building with Next.js, I cannot recommend Payload CMS enough. It feels like it was designed specifically for this stack.",
    ]),
    color: { r: 140, g: 60, b: 90 },
    daysAgo: 7,
  },
  {
    title: "My Terminal Setup in 2025",
    slug: "my-terminal-setup-2025",
    _status: "published" as const,
    excerpt:
      "A tour of my current terminal configuration, including shell, editor, and all the tools I use daily.",
    tags: [{ tag: "tools" }, { tag: "terminal" }, { tag: "productivity" }],
    content: makeLexicalContent([
      "I spend most of my working hours in the terminal, so having a well-tuned setup is essential. Here is what I am using in 2025.",
      "My shell of choice is Zsh with a minimal prompt. I have moved away from heavy frameworks like Oh My Zsh in favor of a hand-crafted configuration that loads in milliseconds.",
      "For editing, I use Neovim with a Lua-based configuration. The LSP integration has become incredibly good, giving me IDE-level features like auto-completion, go-to-definition, and inline diagnostics.",
      "My terminal emulator is Ghostty, which offers excellent performance and native rendering. Combined with tmux for session management, it is a rock-solid environment.",
      "Some other tools in my daily toolkit include ripgrep for searching, fd for finding files, zoxide for directory jumping, and lazygit for a visual Git interface.",
    ]),
    color: { r: 50, g: 50, b: 50 },
    daysAgo: 14,
  },
  {
    title: "Building a Guestbook with Server Actions",
    slug: "building-guestbook-server-actions",
    _status: "published" as const,
    excerpt:
      "How I built the guestbook feature on this site using Next.js server actions and Payload CMS.",
    tags: [{ tag: "nextjs" }, { tag: "server-actions" }, { tag: "tutorial" }],
    content: makeLexicalContent([
      "The guestbook on this website is one of my favorite features. It is a simple concept — visitors can leave a short message — but it touches several interesting technical areas.",
      "The implementation uses Next.js server actions for form submission. Server actions let you define async functions that run on the server and can be called directly from client components.",
      "On the backend, Payload CMS handles data storage through the GuestbookEntry collection. Entries have a name and message field, with public read and create access but authenticated-only deletion.",
      "To prevent spam, I integrated Cloudflare Turnstile, a privacy-friendly CAPTCHA alternative. The verification happens server-side in the action before the entry is created.",
      "When a new entry is posted, an email notification is sent via Resend. This way I know when someone signs the guestbook without having to check the site manually.",
    ]),
    color: { r: 30, g: 130, b: 76 },
    daysAgo: 21,
  },
  {
    title: "Draft: Exploring Rust for Web Development",
    slug: "exploring-rust-web-dev",
    _status: "draft" as const,
    excerpt: "An early look at using Rust for building web backends. Still a work in progress.",
    tags: [{ tag: "rust" }, { tag: "webdev" }],
    content: makeLexicalContent([
      "This is a draft post exploring Rust as a language for web backend development. I have been experimenting with Axum and Actix-web.",
      "Rust offers memory safety without garbage collection, which translates to extremely low-latency web services. The type system catches many bugs at compile time that would otherwise surface in production.",
      "The ecosystem is maturing rapidly. Libraries like Axum provide ergonomic APIs that feel surprisingly close to Express or Fastify, while delivering much better performance.",
    ]),
    color: { r: 180, g: 100, b: 40 },
    daysAgo: 1,
  },
];

const guestbookEntries = [
  { name: "Alice", message: "Love the minimal design of this site! Great work." },
  {
    name: "Bob",
    message: "Interesting blog posts. Looking forward to more content about Next.js.",
  },
  { name: "Charlie", message: "The guestbook is a fun throwback to the old web. Nice touch!" },
  {
    name: "Diana",
    message: "Found your terminal setup post super helpful. Switched to Ghostty because of it.",
  },
  { name: "Erik", message: "Fellow Norwegian developer here. Hei hei!" },
  {
    name: "Fatima",
    message: "Your Payload CMS article convinced me to try it for my next project.",
  },
  { name: "George", message: "Clean code, clean design. Bookmarked." },
  { name: "Hannah", message: "Would love to see a post about your deployment setup!" },
  { name: "Ivan", message: "The warm parchment color scheme is really unique. Feels cozy." },
  { name: "Julia", message: "Thanks for sharing your knowledge. Keep writing!" },
];

// ── Main Seed Function ───────────────────────────────────────

const seed = async () => {
  const payload = await getPayload({ config });

  payload.logger.info("Starting seed...");

  // ── Clean existing test data ──
  payload.logger.info("Cleaning existing data...");

  const existingPosts = await payload.find({
    collection: "blog",
    limit: 100,
    overrideAccess: true,
  });
  for (const post of existingPosts.docs) {
    await payload.delete({ collection: "blog", id: post.id, overrideAccess: true });
  }

  const existingImages = await payload.find({
    collection: "blog-image",
    limit: 100,
    overrideAccess: true,
  });
  for (const img of existingImages.docs) {
    await payload.delete({ collection: "blog-image", id: img.id, overrideAccess: true });
  }

  const existingEntries = await payload.find({
    collection: "guestbook-entry",
    limit: 100,
    overrideAccess: true,
  });
  for (const entry of existingEntries.docs) {
    await payload.delete({ collection: "guestbook-entry", id: entry.id, overrideAccess: true });
  }

  // ── Create admin user (skip if exists) ──
  payload.logger.info("Creating admin user...");
  const existingUsers = await payload.find({
    collection: "users",
    where: { email: { equals: "admin@example.com" } },
    overrideAccess: true,
  });

  if (existingUsers.docs.length === 0) {
    await payload.create({
      collection: "users",
      data: {
        email: "admin@example.com",
        password: "password123",
      },
      overrideAccess: true,
    });
    payload.logger.info("  Created user: admin@example.com / password123");
  } else {
    payload.logger.info("  Admin user already exists, skipping.");
  }

  // ── Create blog images ──
  payload.logger.info("Creating blog images...");
  const imageIds: number[] = [];

  for (const post of blogPosts) {
    const buffer = await generateImage(post.title, post.color.r, post.color.g, post.color.b);

    const image = await payload.create({
      collection: "blog-image",
      data: {
        alt: `Featured image for "${post.title}"`,
      },
      file: {
        data: buffer,
        mimetype: "image/png",
        name: `${post.slug}.png`,
        size: buffer.length,
      },
      overrideAccess: true,
    });

    imageIds.push(image.id);
    payload.logger.info(`  Created image: ${post.slug}.png`);
  }

  // ── Create blog posts ──
  payload.logger.info("Creating blog posts...");

  for (let i = 0; i < blogPosts.length; i++) {
    const post = blogPosts[i];
    const publishedAt = new Date();
    publishedAt.setDate(publishedAt.getDate() - post.daysAgo);

    await payload.create({
      collection: "blog",
      data: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        publishedAt: publishedAt.toISOString(),
        featuredImage: imageIds[i],
        content: post.content,
        tags: post.tags,
        _status: post._status,
      },
      draft: post._status === "draft",
      overrideAccess: true,
    });

    payload.logger.info(`  Created post: "${post.title}" [${post._status}]`);
  }

  // ── Create guestbook entries ──
  payload.logger.info("Creating guestbook entries...");

  for (let i = 0; i < guestbookEntries.length; i++) {
    const entry = guestbookEntries[i];

    // Stagger creation times so they appear in a natural order
    const createdAt = new Date();
    createdAt.setHours(createdAt.getHours() - (guestbookEntries.length - i) * 3);

    await payload.create({
      collection: "guestbook-entry",
      data: {
        name: entry.name,
        message: entry.message,
      },
      overrideAccess: true,
    });

    payload.logger.info(`  Created guestbook entry from: ${entry.name}`);
  }

  // ── Done ──
  payload.logger.info("");
  payload.logger.info("Seed complete!");
  payload.logger.info("  - 1 admin user (admin@example.com / password123)");
  payload.logger.info(
    `  - ${blogPosts.length} blog posts (${blogPosts.filter((p) => p._status === "published").length} published, ${blogPosts.filter((p) => p._status === "draft").length} draft)`,
  );
  payload.logger.info(`  - ${blogPosts.length} blog images`);
  payload.logger.info(`  - ${guestbookEntries.length} guestbook entries`);

  process.exit(0);
};

await seed();
