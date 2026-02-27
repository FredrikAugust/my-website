import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // 1. Create the version enum type (enum_blog_status already exists from the old schema)
  await db.execute(sql`
    CREATE TYPE "public"."enum__blog_v_version_status" AS ENUM('draft', 'published');
  `)

  // 2. Add the new _status column, copy data from old status column, then drop old column
  await db.execute(sql`
    ALTER TABLE "blog" ADD COLUMN "_status" "enum_blog_status" DEFAULT 'draft';
    CREATE INDEX "blog__status_idx" ON "blog" USING btree ("_status");
    UPDATE "blog" SET "_status" = "status";
    ALTER TABLE "blog" DROP COLUMN "status";
  `)

  // 3. Create guestbook_entry table (new in the unified app)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "guestbook_entry" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "message" varchar NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "guestbook_entry_updated_at_idx" ON "guestbook_entry" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "guestbook_entry_created_at_idx" ON "guestbook_entry" USING btree ("created_at");
  `)

  // 5. Create the versions table for Payload's draft system
  await db.execute(sql`
    CREATE TABLE "_blog_v_version_tags" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "tag" varchar,
      "_uuid" varchar
    );

    CREATE TABLE "_blog_v" (
      "id" serial PRIMARY KEY NOT NULL,
      "parent_id" integer,
      "version_title" varchar,
      "version_slug" varchar,
      "version_published_at" timestamp(3) with time zone,
      "version_excerpt" varchar,
      "version_featured_image_id" integer,
      "version_content" jsonb,
      "version_updated_at" timestamp(3) with time zone,
      "version_created_at" timestamp(3) with time zone,
      "version__status" "enum__blog_v_version_status" DEFAULT 'draft',
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "latest" boolean
    );

    ALTER TABLE "_blog_v_version_tags" ADD CONSTRAINT "_blog_v_version_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_blog_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_blog_v" ADD CONSTRAINT "_blog_v_parent_id_blog_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."blog"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_blog_v" ADD CONSTRAINT "_blog_v_version_featured_image_id_blog_image_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."blog_image"("id") ON DELETE set null ON UPDATE no action;

    CREATE INDEX "_blog_v_version_tags_order_idx" ON "_blog_v_version_tags" USING btree ("_order");
    CREATE INDEX "_blog_v_version_tags_parent_id_idx" ON "_blog_v_version_tags" USING btree ("_parent_id");
    CREATE INDEX "_blog_v_parent_idx" ON "_blog_v" USING btree ("parent_id");
    CREATE INDEX "_blog_v_version_version_slug_idx" ON "_blog_v" USING btree ("version_slug");
    CREATE INDEX "_blog_v_version_version_featured_image_idx" ON "_blog_v" USING btree ("version_featured_image_id");
    CREATE INDEX "_blog_v_version_version_updated_at_idx" ON "_blog_v" USING btree ("version_updated_at");
    CREATE INDEX "_blog_v_version_version_created_at_idx" ON "_blog_v" USING btree ("version_created_at");
    CREATE INDEX "_blog_v_version_version__status_idx" ON "_blog_v" USING btree ("version__status");
    CREATE INDEX "_blog_v_created_at_idx" ON "_blog_v" USING btree ("created_at");
    CREATE INDEX "_blog_v_updated_at_idx" ON "_blog_v" USING btree ("updated_at");
    CREATE INDEX "_blog_v_latest_idx" ON "_blog_v" USING btree ("latest");
  `)

  // 6. Seed the versions table with an initial version for each existing blog post
  //    This ensures Payload's versioning system recognizes the existing posts
  await db.execute(sql`
    INSERT INTO "_blog_v" (
      "parent_id", "version_title", "version_slug", "version_published_at",
      "version_excerpt", "version_featured_image_id", "version_content",
      "version_updated_at", "version_created_at", "version__status",
      "created_at", "updated_at", "latest"
    )
    SELECT
      "id", "title", "slug", "published_at",
      "excerpt", "featured_image_id", "content",
      "updated_at", "created_at", "_status",
      now(), now(), true
    FROM "blog";
  `)

  // 7. Seed version tags from existing blog tags
  await db.execute(sql`
    INSERT INTO "_blog_v_version_tags" ("_order", "_parent_id", "tag", "_uuid")
    SELECT
      bt."_order",
      bv."id",
      bt."tag",
      bt."id"
    FROM "blog_tags" bt
    JOIN "_blog_v" bv ON bv."parent_id" = bt."_parent_id"
    WHERE bv."latest" = true;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // 1. Re-add the old status column and copy data back
  await db.execute(sql`
    ALTER TABLE "blog" ADD COLUMN "status" "enum_blog_status" DEFAULT 'draft';
    UPDATE "blog" SET "status" = "_status";
    ALTER TABLE "blog" DROP COLUMN "_status";
    DROP INDEX IF EXISTS "blog__status_idx";
  `)

  // 2. Drop versioning infrastructure
  await db.execute(sql`
    DROP TABLE "_blog_v_version_tags" CASCADE;
    DROP TABLE "_blog_v" CASCADE;
    DROP TYPE "public"."enum__blog_v_version_status";
  `)

  // 3. Drop guestbook_entry table
  await db.execute(sql`
    DROP TABLE IF EXISTS "guestbook_entry" CASCADE;
  `)
}
