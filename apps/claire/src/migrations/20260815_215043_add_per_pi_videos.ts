import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pi_playback\` ADD \`pi1_video_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`pi_playback\` ADD \`pi2_video_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`pi_playback\` ADD \`pi3_video_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`pi_playback_pi1_video_idx\` ON \`pi_playback\` (\`pi1_video_id\`);`)
  await db.run(sql`CREATE INDEX \`pi_playback_pi2_video_idx\` ON \`pi_playback\` (\`pi2_video_id\`);`)
  await db.run(sql`CREATE INDEX \`pi_playback_pi3_video_idx\` ON \`pi_playback\` (\`pi3_video_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_pi_playback\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`video_id\` integer,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`video_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_pi_playback\`("id", "video_id", "updated_at", "created_at") SELECT "id", "video_id", "updated_at", "created_at" FROM \`pi_playback\`;`)
  await db.run(sql`DROP TABLE \`pi_playback\`;`)
  await db.run(sql`ALTER TABLE \`__new_pi_playback\` RENAME TO \`pi_playback\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`pi_playback_video_idx\` ON \`pi_playback\` (\`video_id\`);`)
}
