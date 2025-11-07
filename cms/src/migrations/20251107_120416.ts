import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_blog_status" AS ENUM('draft', 'published');
  CREATE TABLE "blog_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "blog" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"published_at" timestamp(3) with time zone,
  	"status" "enum_blog_status" DEFAULT 'draft' NOT NULL,
  	"excerpt" varchar,
  	"featured_image_id" integer,
  	"content" jsonb NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "blog_image" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"prefix" varchar DEFAULT 'blog-uploads',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "blog_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "blog_image_id" integer;
  ALTER TABLE "blog_tags" ADD CONSTRAINT "blog_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blog"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blog" ADD CONSTRAINT "blog_featured_image_id_blog_image_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."blog_image"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "blog_tags_order_idx" ON "blog_tags" USING btree ("_order");
  CREATE INDEX "blog_tags_parent_id_idx" ON "blog_tags" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "blog_slug_idx" ON "blog" USING btree ("slug");
  CREATE INDEX "blog_featured_image_idx" ON "blog" USING btree ("featured_image_id");
  CREATE INDEX "blog_updated_at_idx" ON "blog" USING btree ("updated_at");
  CREATE INDEX "blog_created_at_idx" ON "blog" USING btree ("created_at");
  CREATE INDEX "blog_image_updated_at_idx" ON "blog_image" USING btree ("updated_at");
  CREATE INDEX "blog_image_created_at_idx" ON "blog_image" USING btree ("created_at");
  CREATE UNIQUE INDEX "blog_image_filename_idx" ON "blog_image" USING btree ("filename");
  CREATE INDEX "blog_image_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "blog_image" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "blog_image_sizes_large_sizes_large_filename_idx" ON "blog_image" USING btree ("sizes_large_filename");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_blog_fk" FOREIGN KEY ("blog_id") REFERENCES "public"."blog"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_blog_image_fk" FOREIGN KEY ("blog_image_id") REFERENCES "public"."blog_image"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_blog_id_idx" ON "payload_locked_documents_rels" USING btree ("blog_id");
  CREATE INDEX "payload_locked_documents_rels_blog_image_id_idx" ON "payload_locked_documents_rels" USING btree ("blog_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "blog_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "blog" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "blog_image" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "blog_tags" CASCADE;
  DROP TABLE "blog" CASCADE;
  DROP TABLE "blog_image" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_blog_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_blog_image_fk";
  
  DROP INDEX "payload_locked_documents_rels_blog_id_idx";
  DROP INDEX "payload_locked_documents_rels_blog_image_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "blog_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "blog_image_id";
  DROP TYPE "public"."enum_blog_status";`)
}
