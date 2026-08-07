import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`works\` ADD \`video_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`works\` ADD \`video_poster_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`works_video_idx\` ON \`works\` (\`video_id\`);`)
  await db.run(sql`CREATE INDEX \`works_video_poster_idx\` ON \`works\` (\`video_poster_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_works\` (
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
  await db.run(sql`INSERT INTO \`__new_works\`("id", "title", "slug", "category", "featured", "sort_order", "year", "medium", "duration", "subtitle", "description", "venue", "venue_location", "hero_image_id", "thumbnail_image_id", "vimeo_url", "updated_at", "created_at") SELECT "id", "title", "slug", "category", "featured", "sort_order", "year", "medium", "duration", "subtitle", "description", "venue", "venue_location", "hero_image_id", "thumbnail_image_id", "vimeo_url", "updated_at", "created_at" FROM \`works\`;`)
  await db.run(sql`DROP TABLE \`works\`;`)
  await db.run(sql`ALTER TABLE \`__new_works\` RENAME TO \`works\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE UNIQUE INDEX \`works_slug_idx\` ON \`works\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`works_sort_order_idx\` ON \`works\` (\`sort_order\`);`)
  await db.run(sql`CREATE INDEX \`works_hero_image_idx\` ON \`works\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`works_thumbnail_image_idx\` ON \`works\` (\`thumbnail_image_id\`);`)
  await db.run(sql`CREATE INDEX \`works_updated_at_idx\` ON \`works\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`works_created_at_idx\` ON \`works\` (\`created_at\`);`)
}
