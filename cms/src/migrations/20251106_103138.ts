import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "photo" ADD COLUMN "exif_camera_make" varchar;
  ALTER TABLE "photo" ADD COLUMN "exif_camera_model" varchar;
  ALTER TABLE "photo" ADD COLUMN "exif_lens_make" varchar;
  ALTER TABLE "photo" ADD COLUMN "exif_lens_model" varchar;
  ALTER TABLE "photo" ADD COLUMN "exif_focal_length" varchar;
  ALTER TABLE "photo" ADD COLUMN "exif_aperture" varchar;
  ALTER TABLE "photo" ADD COLUMN "exif_shutter_speed" varchar;
  ALTER TABLE "photo" ADD COLUMN "exif_iso" numeric;
  ALTER TABLE "photo" ADD COLUMN "gps_latitude" numeric;
  ALTER TABLE "photo" ADD COLUMN "gps_longitude" numeric;
  ALTER TABLE "photo" ADD COLUMN "prefix" varchar DEFAULT 'photo-uploads';
  ALTER TABLE "photo" DROP COLUMN "location";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "photo" ADD COLUMN "location" varchar;
  ALTER TABLE "photo" DROP COLUMN "exif_camera_make";
  ALTER TABLE "photo" DROP COLUMN "exif_camera_model";
  ALTER TABLE "photo" DROP COLUMN "exif_lens_make";
  ALTER TABLE "photo" DROP COLUMN "exif_lens_model";
  ALTER TABLE "photo" DROP COLUMN "exif_focal_length";
  ALTER TABLE "photo" DROP COLUMN "exif_aperture";
  ALTER TABLE "photo" DROP COLUMN "exif_shutter_speed";
  ALTER TABLE "photo" DROP COLUMN "exif_iso";
  ALTER TABLE "photo" DROP COLUMN "gps_latitude";
  ALTER TABLE "photo" DROP COLUMN "gps_longitude";
  ALTER TABLE "photo" DROP COLUMN "prefix";`)
}
