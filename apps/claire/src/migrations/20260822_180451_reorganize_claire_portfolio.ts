import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`installations_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`installations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`installations_gallery_order_idx\` ON \`installations_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`installations_gallery_parent_id_idx\` ON \`installations_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`installations_gallery_image_idx\` ON \`installations_gallery\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`installations_credits\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`role\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`installations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`installations_credits_order_idx\` ON \`installations_credits\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`installations_credits_parent_id_idx\` ON \`installations_credits\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`installations\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`title\` text,
  	\`generate_slug\` integer DEFAULT true,
  	\`slug\` text,
  	\`featured\` integer DEFAULT false,
  	\`sort_order\` numeric DEFAULT 0,
  	\`year\` numeric,
  	\`short_description\` text,
  	\`description\` text,
  	\`hero_image_id\` integer,
  	\`thumbnail_image_id\` integer,
  	\`video_id\` integer,
  	\`video_poster_id\` integer,
  	\`vimeo_url\` text,
  	\`materials\` text,
  	\`dimensions\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`thumbnail_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`installations_slug_idx\` ON \`installations\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`installations_sort_order_idx\` ON \`installations\` (\`sort_order\`);`)
  await db.run(sql`CREATE INDEX \`installations_hero_image_idx\` ON \`installations\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`installations_thumbnail_image_idx\` ON \`installations\` (\`thumbnail_image_id\`);`)
  await db.run(sql`CREATE INDEX \`installations_video_idx\` ON \`installations\` (\`video_id\`);`)
  await db.run(sql`CREATE INDEX \`installations_video_poster_idx\` ON \`installations\` (\`video_poster_id\`);`)
  await db.run(sql`CREATE INDEX \`installations_updated_at_idx\` ON \`installations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`installations_created_at_idx\` ON \`installations\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`installations__status_idx\` ON \`installations\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_installations_v_version_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`image_id\` integer,
  	\`caption\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_installations_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_installations_v_version_gallery_order_idx\` ON \`_installations_v_version_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_installations_v_version_gallery_parent_id_idx\` ON \`_installations_v_version_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_installations_v_version_gallery_image_idx\` ON \`_installations_v_version_gallery\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_installations_v_version_credits\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`name\` text,
  	\`role\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_installations_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_installations_v_version_credits_order_idx\` ON \`_installations_v_version_credits\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_installations_v_version_credits_parent_id_idx\` ON \`_installations_v_version_credits\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_installations_v\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_generate_slug\` integer DEFAULT true,
  	\`version_slug\` text,
  	\`version_featured\` integer DEFAULT false,
  	\`version_sort_order\` numeric DEFAULT 0,
  	\`version_year\` numeric,
  	\`version_short_description\` text,
  	\`version_description\` text,
  	\`version_hero_image_id\` integer,
  	\`version_thumbnail_image_id\` integer,
  	\`version_video_id\` integer,
  	\`version_video_poster_id\` integer,
  	\`version_vimeo_url\` text,
  	\`version_materials\` text,
  	\`version_dimensions\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`installations\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_thumbnail_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_video_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_video_poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_installations_v_parent_idx\` ON \`_installations_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_installations_v_version_version_slug_idx\` ON \`_installations_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_installations_v_version_version_sort_order_idx\` ON \`_installations_v\` (\`version_sort_order\`);`)
  await db.run(sql`CREATE INDEX \`_installations_v_version_version_hero_image_idx\` ON \`_installations_v\` (\`version_hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_installations_v_version_version_thumbnail_image_idx\` ON \`_installations_v\` (\`version_thumbnail_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_installations_v_version_version_video_idx\` ON \`_installations_v\` (\`version_video_id\`);`)
  await db.run(sql`CREATE INDEX \`_installations_v_version_version_video_poster_idx\` ON \`_installations_v\` (\`version_video_poster_id\`);`)
  await db.run(sql`CREATE INDEX \`_installations_v_version_version_updated_at_idx\` ON \`_installations_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_installations_v_version_version_created_at_idx\` ON \`_installations_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_installations_v_version_version__status_idx\` ON \`_installations_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_installations_v_created_at_idx\` ON \`_installations_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_installations_v_updated_at_idx\` ON \`_installations_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_installations_v_latest_idx\` ON \`_installations_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_installations_v_autosave_idx\` ON \`_installations_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`exhibitions_documentation\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`exhibitions\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`exhibitions_documentation_order_idx\` ON \`exhibitions_documentation\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`exhibitions_documentation_parent_id_idx\` ON \`exhibitions_documentation\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`exhibitions_documentation_image_idx\` ON \`exhibitions_documentation\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`exhibitions_credits\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`role\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`exhibitions\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`exhibitions_credits_order_idx\` ON \`exhibitions_credits\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`exhibitions_credits_parent_id_idx\` ON \`exhibitions_credits\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`exhibitions\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`title\` text,
  	\`generate_slug\` integer DEFAULT true,
  	\`slug\` text,
  	\`featured\` integer DEFAULT false,
  	\`sort_order\` numeric DEFAULT 0,
  	\`overview\` text,
  	\`venue\` text,
  	\`city\` text,
  	\`start_date\` text,
  	\`end_date\` text,
  	\`date_label\` text,
  	\`hero_image_id\` integer,
  	\`thumbnail_image_id\` integer,
  	\`video_id\` integer,
  	\`video_poster_id\` integer,
  	\`vimeo_url\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`thumbnail_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`exhibitions_slug_idx\` ON \`exhibitions\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`exhibitions_sort_order_idx\` ON \`exhibitions\` (\`sort_order\`);`)
  await db.run(sql`CREATE INDEX \`exhibitions_hero_image_idx\` ON \`exhibitions\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`exhibitions_thumbnail_image_idx\` ON \`exhibitions\` (\`thumbnail_image_id\`);`)
  await db.run(sql`CREATE INDEX \`exhibitions_video_idx\` ON \`exhibitions\` (\`video_id\`);`)
  await db.run(sql`CREATE INDEX \`exhibitions_video_poster_idx\` ON \`exhibitions\` (\`video_poster_id\`);`)
  await db.run(sql`CREATE INDEX \`exhibitions_updated_at_idx\` ON \`exhibitions\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`exhibitions_created_at_idx\` ON \`exhibitions\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`exhibitions__status_idx\` ON \`exhibitions\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`exhibitions_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`installations_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`exhibitions\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`installations_id\`) REFERENCES \`installations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`exhibitions_rels_order_idx\` ON \`exhibitions_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`exhibitions_rels_parent_idx\` ON \`exhibitions_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`exhibitions_rels_path_idx\` ON \`exhibitions_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`exhibitions_rels_installations_id_idx\` ON \`exhibitions_rels\` (\`installations_id\`);`)
  await db.run(sql`CREATE TABLE \`_exhibitions_v_version_documentation\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`image_id\` integer,
  	\`caption\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_exhibitions_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_exhibitions_v_version_documentation_order_idx\` ON \`_exhibitions_v_version_documentation\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_exhibitions_v_version_documentation_parent_id_idx\` ON \`_exhibitions_v_version_documentation\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_exhibitions_v_version_documentation_image_idx\` ON \`_exhibitions_v_version_documentation\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_exhibitions_v_version_credits\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`name\` text,
  	\`role\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_exhibitions_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_exhibitions_v_version_credits_order_idx\` ON \`_exhibitions_v_version_credits\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_exhibitions_v_version_credits_parent_id_idx\` ON \`_exhibitions_v_version_credits\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_exhibitions_v\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_generate_slug\` integer DEFAULT true,
  	\`version_slug\` text,
  	\`version_featured\` integer DEFAULT false,
  	\`version_sort_order\` numeric DEFAULT 0,
  	\`version_overview\` text,
  	\`version_venue\` text,
  	\`version_city\` text,
  	\`version_start_date\` text,
  	\`version_end_date\` text,
  	\`version_date_label\` text,
  	\`version_hero_image_id\` integer,
  	\`version_thumbnail_image_id\` integer,
  	\`version_video_id\` integer,
  	\`version_video_poster_id\` integer,
  	\`version_vimeo_url\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`exhibitions\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_thumbnail_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_video_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_video_poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_exhibitions_v_parent_idx\` ON \`_exhibitions_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_exhibitions_v_version_version_slug_idx\` ON \`_exhibitions_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_exhibitions_v_version_version_sort_order_idx\` ON \`_exhibitions_v\` (\`version_sort_order\`);`)
  await db.run(sql`CREATE INDEX \`_exhibitions_v_version_version_hero_image_idx\` ON \`_exhibitions_v\` (\`version_hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_exhibitions_v_version_version_thumbnail_image_idx\` ON \`_exhibitions_v\` (\`version_thumbnail_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_exhibitions_v_version_version_video_idx\` ON \`_exhibitions_v\` (\`version_video_id\`);`)
  await db.run(sql`CREATE INDEX \`_exhibitions_v_version_version_video_poster_idx\` ON \`_exhibitions_v\` (\`version_video_poster_id\`);`)
  await db.run(sql`CREATE INDEX \`_exhibitions_v_version_version_updated_at_idx\` ON \`_exhibitions_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_exhibitions_v_version_version_created_at_idx\` ON \`_exhibitions_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_exhibitions_v_version_version__status_idx\` ON \`_exhibitions_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_exhibitions_v_created_at_idx\` ON \`_exhibitions_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_exhibitions_v_updated_at_idx\` ON \`_exhibitions_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_exhibitions_v_latest_idx\` ON \`_exhibitions_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_exhibitions_v_autosave_idx\` ON \`_exhibitions_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_exhibitions_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`installations_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_exhibitions_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`installations_id\`) REFERENCES \`installations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_exhibitions_v_rels_order_idx\` ON \`_exhibitions_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_exhibitions_v_rels_parent_idx\` ON \`_exhibitions_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_exhibitions_v_rels_path_idx\` ON \`_exhibitions_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_exhibitions_v_rels_installations_id_idx\` ON \`_exhibitions_v_rels\` (\`installations_id\`);`)
  await db.run(sql`CREATE TABLE \`films_credits\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`role\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`films\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`films_credits_order_idx\` ON \`films_credits\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`films_credits_parent_id_idx\` ON \`films_credits\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`films_screenings\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`festival\` text,
  	\`location\` text,
  	\`year\` numeric,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`films\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`films_screenings_order_idx\` ON \`films_screenings\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`films_screenings_parent_id_idx\` ON \`films_screenings\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`films_stills\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`films\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`films_stills_order_idx\` ON \`films_stills\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`films_stills_parent_id_idx\` ON \`films_stills\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`films_stills_image_idx\` ON \`films_stills\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`films\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`title\` text,
  	\`generate_slug\` integer DEFAULT true,
  	\`slug\` text,
  	\`featured\` integer DEFAULT false,
  	\`sort_order\` numeric DEFAULT 0,
  	\`year\` numeric,
  	\`description\` text,
  	\`hero_image_id\` integer,
  	\`thumbnail_image_id\` integer,
  	\`video_id\` integer,
  	\`video_poster_id\` integer,
  	\`vimeo_url\` text,
  	\`duration\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`thumbnail_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`films_slug_idx\` ON \`films\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`films_sort_order_idx\` ON \`films\` (\`sort_order\`);`)
  await db.run(sql`CREATE INDEX \`films_hero_image_idx\` ON \`films\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`films_thumbnail_image_idx\` ON \`films\` (\`thumbnail_image_id\`);`)
  await db.run(sql`CREATE INDEX \`films_video_idx\` ON \`films\` (\`video_id\`);`)
  await db.run(sql`CREATE INDEX \`films_video_poster_idx\` ON \`films\` (\`video_poster_id\`);`)
  await db.run(sql`CREATE INDEX \`films_updated_at_idx\` ON \`films\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`films_created_at_idx\` ON \`films\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`films__status_idx\` ON \`films\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_films_v_version_credits\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`name\` text,
  	\`role\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_films_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_films_v_version_credits_order_idx\` ON \`_films_v_version_credits\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_films_v_version_credits_parent_id_idx\` ON \`_films_v_version_credits\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_films_v_version_screenings\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`festival\` text,
  	\`location\` text,
  	\`year\` numeric,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_films_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_films_v_version_screenings_order_idx\` ON \`_films_v_version_screenings\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_films_v_version_screenings_parent_id_idx\` ON \`_films_v_version_screenings\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_films_v_version_stills\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`image_id\` integer,
  	\`caption\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_films_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_films_v_version_stills_order_idx\` ON \`_films_v_version_stills\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_films_v_version_stills_parent_id_idx\` ON \`_films_v_version_stills\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_films_v_version_stills_image_idx\` ON \`_films_v_version_stills\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_films_v\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_generate_slug\` integer DEFAULT true,
  	\`version_slug\` text,
  	\`version_featured\` integer DEFAULT false,
  	\`version_sort_order\` numeric DEFAULT 0,
  	\`version_year\` numeric,
  	\`version_description\` text,
  	\`version_hero_image_id\` integer,
  	\`version_thumbnail_image_id\` integer,
  	\`version_video_id\` integer,
  	\`version_video_poster_id\` integer,
  	\`version_vimeo_url\` text,
  	\`version_duration\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`films\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_thumbnail_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_video_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_video_poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_films_v_parent_idx\` ON \`_films_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_films_v_version_version_slug_idx\` ON \`_films_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_films_v_version_version_sort_order_idx\` ON \`_films_v\` (\`version_sort_order\`);`)
  await db.run(sql`CREATE INDEX \`_films_v_version_version_hero_image_idx\` ON \`_films_v\` (\`version_hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_films_v_version_version_thumbnail_image_idx\` ON \`_films_v\` (\`version_thumbnail_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_films_v_version_version_video_idx\` ON \`_films_v\` (\`version_video_id\`);`)
  await db.run(sql`CREATE INDEX \`_films_v_version_version_video_poster_idx\` ON \`_films_v\` (\`version_video_poster_id\`);`)
  await db.run(sql`CREATE INDEX \`_films_v_version_version_updated_at_idx\` ON \`_films_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_films_v_version_version_created_at_idx\` ON \`_films_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_films_v_version_version__status_idx\` ON \`_films_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_films_v_created_at_idx\` ON \`_films_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_films_v_updated_at_idx\` ON \`_films_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_films_v_latest_idx\` ON \`_films_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_films_v_autosave_idx\` ON \`_films_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`home_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`installations_id\` integer,
  	\`exhibitions_id\` integer,
  	\`films_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`home\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`installations_id\`) REFERENCES \`installations\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`exhibitions_id\`) REFERENCES \`exhibitions\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`films_id\`) REFERENCES \`films\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_rels_order_idx\` ON \`home_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`home_rels_parent_idx\` ON \`home_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_rels_path_idx\` ON \`home_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`home_rels_installations_id_idx\` ON \`home_rels\` (\`installations_id\`);`)
  await db.run(sql`CREATE INDEX \`home_rels_exhibitions_id_idx\` ON \`home_rels\` (\`exhibitions_id\`);`)
  await db.run(sql`CREATE INDEX \`home_rels_films_id_idx\` ON \`home_rels\` (\`films_id\`);`)
  await db.run(sql`CREATE TABLE \`dance_performance_footage_credits\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`role\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`dance_performance_footage\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`dance_performance_footage_credits_order_idx\` ON \`dance_performance_footage_credits\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`dance_performance_footage_credits_parent_id_idx\` ON \`dance_performance_footage_credits\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`dance_performance_footage\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`year\` numeric,
  	\`description\` text,
  	\`video_id\` integer,
  	\`video_poster_id\` integer,
  	\`vimeo_url\` text,
  	FOREIGN KEY (\`video_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`dance\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`dance_performance_footage_order_idx\` ON \`dance_performance_footage\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`dance_performance_footage_parent_id_idx\` ON \`dance_performance_footage\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`dance_performance_footage_video_idx\` ON \`dance_performance_footage\` (\`video_id\`);`)
  await db.run(sql`CREATE INDEX \`dance_performance_footage_video_poster_idx\` ON \`dance_performance_footage\` (\`video_poster_id\`);`)
  await db.run(sql`CREATE TABLE \`dance_selected_stage_works_credits\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`role\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`dance_selected_stage_works\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`dance_selected_stage_works_credits_order_idx\` ON \`dance_selected_stage_works_credits\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`dance_selected_stage_works_credits_parent_id_idx\` ON \`dance_selected_stage_works_credits\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`dance_selected_stage_works\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`anchor\` text NOT NULL,
  	\`company_or_venue\` text,
  	\`role\` text,
  	\`date_or_year\` text,
  	\`image_id\` integer,
  	\`description\` text,
  	\`video_id\` integer,
  	\`video_poster_id\` integer,
  	\`vimeo_url\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`dance\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`dance_selected_stage_works_order_idx\` ON \`dance_selected_stage_works\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`dance_selected_stage_works_parent_id_idx\` ON \`dance_selected_stage_works\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`dance_selected_stage_works_image_idx\` ON \`dance_selected_stage_works\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`dance_selected_stage_works_video_idx\` ON \`dance_selected_stage_works\` (\`video_id\`);`)
  await db.run(sql`CREATE INDEX \`dance_selected_stage_works_video_poster_idx\` ON \`dance_selected_stage_works\` (\`video_poster_id\`);`)
  await db.run(sql`CREATE TABLE \`dance\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`heading\` text DEFAULT 'Dance',
  	\`introduction\` text,
  	\`showreel_video_id\` integer,
  	\`showreel_video_poster_id\` integer,
  	\`showreel_vimeo_url\` text,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`showreel_video_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`showreel_video_poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`dance_showreel_showreel_video_idx\` ON \`dance\` (\`showreel_video_id\`);`)
  await db.run(sql`CREATE INDEX \`dance_showreel_showreel_video_poster_idx\` ON \`dance\` (\`showreel_video_poster_id\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`installations_id\` integer REFERENCES installations(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`exhibitions_id\` integer REFERENCES exhibitions(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`films_id\` integer REFERENCES films(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_installations_id_idx\` ON \`payload_locked_documents_rels\` (\`installations_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_exhibitions_id_idx\` ON \`payload_locked_documents_rels\` (\`exhibitions_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_films_id_idx\` ON \`payload_locked_documents_rels\` (\`films_id\`);`)
  await db.run(sql`ALTER TABLE \`cv\` ADD \`full_pdf_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`cv\` ADD \`download_filename\` text DEFAULT 'Claire-Foody-CV.pdf';`)
  await db.run(sql`CREATE INDEX \`cv_full_pdf_idx\` ON \`cv\` (\`full_pdf_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`installations_gallery\`;`)
  await db.run(sql`DROP TABLE \`installations_credits\`;`)
  await db.run(sql`DROP TABLE \`installations\`;`)
  await db.run(sql`DROP TABLE \`_installations_v_version_gallery\`;`)
  await db.run(sql`DROP TABLE \`_installations_v_version_credits\`;`)
  await db.run(sql`DROP TABLE \`_installations_v\`;`)
  await db.run(sql`DROP TABLE \`exhibitions_documentation\`;`)
  await db.run(sql`DROP TABLE \`exhibitions_credits\`;`)
  await db.run(sql`DROP TABLE \`exhibitions\`;`)
  await db.run(sql`DROP TABLE \`exhibitions_rels\`;`)
  await db.run(sql`DROP TABLE \`_exhibitions_v_version_documentation\`;`)
  await db.run(sql`DROP TABLE \`_exhibitions_v_version_credits\`;`)
  await db.run(sql`DROP TABLE \`_exhibitions_v\`;`)
  await db.run(sql`DROP TABLE \`_exhibitions_v_rels\`;`)
  await db.run(sql`DROP TABLE \`films_credits\`;`)
  await db.run(sql`DROP TABLE \`films_screenings\`;`)
  await db.run(sql`DROP TABLE \`films_stills\`;`)
  await db.run(sql`DROP TABLE \`films\`;`)
  await db.run(sql`DROP TABLE \`_films_v_version_credits\`;`)
  await db.run(sql`DROP TABLE \`_films_v_version_screenings\`;`)
  await db.run(sql`DROP TABLE \`_films_v_version_stills\`;`)
  await db.run(sql`DROP TABLE \`_films_v\`;`)
  await db.run(sql`DROP TABLE \`home_rels\`;`)
  await db.run(sql`DROP TABLE \`dance_performance_footage_credits\`;`)
  await db.run(sql`DROP TABLE \`dance_performance_footage\`;`)
  await db.run(sql`DROP TABLE \`dance_selected_stage_works_credits\`;`)
  await db.run(sql`DROP TABLE \`dance_selected_stage_works\`;`)
  await db.run(sql`DROP TABLE \`dance\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	\`works_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`works_id\`) REFERENCES \`works\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id", "works_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id", "works_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_works_id_idx\` ON \`payload_locked_documents_rels\` (\`works_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_cv\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`INSERT INTO \`__new_cv\`("id", "updated_at", "created_at") SELECT "id", "updated_at", "created_at" FROM \`cv\`;`)
  await db.run(sql`DROP TABLE \`cv\`;`)
  await db.run(sql`ALTER TABLE \`__new_cv\` RENAME TO \`cv\`;`)
}
