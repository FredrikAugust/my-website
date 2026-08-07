import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`users_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`created_at\` text,
  	\`expires_at\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`users\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`email\` text NOT NULL,
  	\`reset_password_token\` text,
  	\`reset_password_expiration\` text,
  	\`salt\` text,
  	\`hash\` text,
  	\`login_attempts\` numeric DEFAULT 0,
  	\`lock_until\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`users_created_at_idx\` ON \`users\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`)
  await db.run(sql`CREATE TABLE \`media\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`alt\` text NOT NULL,
  	\`prefix\` text DEFAULT 'claire-media-uploads',
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric
  );
  `)
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`)
  await db.run(sql`CREATE TABLE \`works_collaborators\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`role\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`works\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`works_collaborators_order_idx\` ON \`works_collaborators\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`works_collaborators_parent_id_idx\` ON \`works_collaborators\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`works_performers\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`works\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`works_performers_order_idx\` ON \`works_performers\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`works_performers_parent_id_idx\` ON \`works_performers\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`works_screenings\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`festival\` text NOT NULL,
  	\`location\` text NOT NULL,
  	\`year\` numeric NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`works\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`works_screenings_order_idx\` ON \`works_screenings\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`works_screenings_parent_id_idx\` ON \`works_screenings\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`works_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`works\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`works_gallery_order_idx\` ON \`works_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`works_gallery_parent_id_idx\` ON \`works_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`works_gallery_image_idx\` ON \`works_gallery\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`works_files\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`file_id\` integer NOT NULL,
  	FOREIGN KEY (\`file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`works\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`works_files_order_idx\` ON \`works_files\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`works_files_parent_id_idx\` ON \`works_files\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`works_files_file_idx\` ON \`works_files\` (\`file_id\`);`)
  await db.run(sql`CREATE TABLE \`works\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`title\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`category\` text NOT NULL,
  	\`featured\` integer DEFAULT false,
  	\`sort_order\` numeric DEFAULT 0,
  	\`year\` numeric NOT NULL,
  	\`medium\` text,
  	\`duration\` text,
  	\`subtitle\` text,
  	\`description\` text,
  	\`venue\` text,
  	\`venue_location\` text,
  	\`hero_image_id\` integer,
  	\`thumbnail_image_id\` integer,
  	\`vimeo_url\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`thumbnail_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`works_slug_idx\` ON \`works\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`works_sort_order_idx\` ON \`works\` (\`sort_order\`);`)
  await db.run(sql`CREATE INDEX \`works_hero_image_idx\` ON \`works\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`works_thumbnail_image_idx\` ON \`works\` (\`thumbnail_image_id\`);`)
  await db.run(sql`CREATE INDEX \`works_updated_at_idx\` ON \`works\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`works_created_at_idx\` ON \`works\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_kv\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`global_slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_global_slug_idx\` ON \`payload_locked_documents\` (\`global_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_updated_at_idx\` ON \`payload_locked_documents\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_created_at_idx\` ON \`payload_locked_documents\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents_rels\` (
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
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_works_id_idx\` ON \`payload_locked_documents_rels\` (\`works_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`key\` text,
  	\`value\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_key_idx\` ON \`payload_preferences\` (\`key\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_updated_at_idx\` ON \`payload_preferences\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_created_at_idx\` ON \`payload_preferences\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_migrations\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`name\` text,
  	\`batch\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_migrations_updated_at_idx\` ON \`payload_migrations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_migrations_created_at_idx\` ON \`payload_migrations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`home\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`hero_video_id\` integer,
  	\`hero_fallback_image_id\` integer,
  	\`hero_title\` text,
  	\`hero_descriptor\` text,
  	\`about_practice_quote\` text,
  	\`about_practice_body\` text,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`hero_video_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`hero_fallback_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`home_hero_hero_video_idx\` ON \`home\` (\`hero_video_id\`);`)
  await db.run(sql`CREATE INDEX \`home_hero_hero_fallback_image_idx\` ON \`home\` (\`hero_fallback_image_id\`);`)
  await db.run(sql`CREATE TABLE \`site_settings\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`artist_name\` text DEFAULT 'Claire Foody' NOT NULL,
  	\`artist_descriptor\` text,
  	\`email\` text,
  	\`phone\` text,
  	\`vimeo_url\` text,
  	\`instagram_url\` text,
  	\`footer_bio\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`about\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`portrait_id\` integer,
  	\`headline\` text,
  	\`bio\` text,
  	\`approach_title\` text,
  	\`approach_content\` text,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`portrait_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`about_portrait_idx\` ON \`about\` (\`portrait_id\`);`)
  await db.run(sql`CREATE TABLE \`cv_sections_entries_pieces\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`role\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`cv_sections_entries\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`cv_sections_entries_pieces_order_idx\` ON \`cv_sections_entries_pieces\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`cv_sections_entries_pieces_parent_id_idx\` ON \`cv_sections_entries_pieces\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`cv_sections_entries\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`year\` numeric NOT NULL,
  	\`year_end\` numeric,
  	\`title\` text NOT NULL,
  	\`venue\` text,
  	\`location\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`cv_sections\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`cv_sections_entries_order_idx\` ON \`cv_sections_entries\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`cv_sections_entries_parent_id_idx\` ON \`cv_sections_entries\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`cv_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`cv\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`cv_sections_order_idx\` ON \`cv_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`cv_sections_parent_id_idx\` ON \`cv_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`cv_sidebar_sections_entries_pieces\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`role\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`cv_sidebar_sections_entries\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`cv_sidebar_sections_entries_pieces_order_idx\` ON \`cv_sidebar_sections_entries_pieces\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`cv_sidebar_sections_entries_pieces_parent_id_idx\` ON \`cv_sidebar_sections_entries_pieces\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`cv_sidebar_sections_entries\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`year\` numeric NOT NULL,
  	\`year_end\` numeric,
  	\`title\` text NOT NULL,
  	\`details\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`cv_sidebar_sections\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`cv_sidebar_sections_entries_order_idx\` ON \`cv_sidebar_sections_entries\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`cv_sidebar_sections_entries_parent_id_idx\` ON \`cv_sidebar_sections_entries\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`cv_sidebar_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`cv\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`cv_sidebar_sections_order_idx\` ON \`cv_sidebar_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`cv_sidebar_sections_parent_id_idx\` ON \`cv_sidebar_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`cv\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`contact_inquiry_categories\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`description\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`contact\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`contact_inquiry_categories_order_idx\` ON \`contact_inquiry_categories\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`contact_inquiry_categories_parent_id_idx\` ON \`contact_inquiry_categories\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`contact\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`heading\` text,
  	\`description\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`performance_page_affiliations\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`organization\` text NOT NULL,
  	\`role\` text,
  	\`years\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`performance_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`performance_page_affiliations_order_idx\` ON \`performance_page_affiliations\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`performance_page_affiliations_parent_id_idx\` ON \`performance_page_affiliations\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`performance_page\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`heading\` text DEFAULT 'Choreography and live works',
  	\`description\` text,
  	\`background_title\` text DEFAULT 'My Background',
  	\`background_content\` text,
  	\`cta_title\` text DEFAULT 'Commission & Collaboration',
  	\`cta_description\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`film_page\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`heading\` text DEFAULT 'Moving image and choreography',
  	\`description\` text,
  	\`cta_title\` text DEFAULT 'Screening Inquiries',
  	\`cta_description\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`works_page\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`heading\` text DEFAULT 'Installations, films, and performances',
  	\`description\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`users_sessions\`;`)
  await db.run(sql`DROP TABLE \`users\`;`)
  await db.run(sql`DROP TABLE \`media\`;`)
  await db.run(sql`DROP TABLE \`works_collaborators\`;`)
  await db.run(sql`DROP TABLE \`works_performers\`;`)
  await db.run(sql`DROP TABLE \`works_screenings\`;`)
  await db.run(sql`DROP TABLE \`works_gallery\`;`)
  await db.run(sql`DROP TABLE \`works_files\`;`)
  await db.run(sql`DROP TABLE \`works\`;`)
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_migrations\`;`)
  await db.run(sql`DROP TABLE \`home\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`about\`;`)
  await db.run(sql`DROP TABLE \`cv_sections_entries_pieces\`;`)
  await db.run(sql`DROP TABLE \`cv_sections_entries\`;`)
  await db.run(sql`DROP TABLE \`cv_sections\`;`)
  await db.run(sql`DROP TABLE \`cv_sidebar_sections_entries_pieces\`;`)
  await db.run(sql`DROP TABLE \`cv_sidebar_sections_entries\`;`)
  await db.run(sql`DROP TABLE \`cv_sidebar_sections\`;`)
  await db.run(sql`DROP TABLE \`cv\`;`)
  await db.run(sql`DROP TABLE \`contact_inquiry_categories\`;`)
  await db.run(sql`DROP TABLE \`contact\`;`)
  await db.run(sql`DROP TABLE \`performance_page_affiliations\`;`)
  await db.run(sql`DROP TABLE \`performance_page\`;`)
  await db.run(sql`DROP TABLE \`film_page\`;`)
  await db.run(sql`DROP TABLE \`works_page\`;`)
}
