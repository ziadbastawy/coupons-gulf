import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'staff');
  ALTER TABLE "users" ADD COLUMN "role" "enum_users_role" DEFAULT 'staff' NOT NULL;
  ALTER TABLE "users" ADD COLUMN "permissions_coupons_read" boolean;
  ALTER TABLE "users" ADD COLUMN "permissions_coupons_create" boolean;
  ALTER TABLE "users" ADD COLUMN "permissions_coupons_update" boolean;
  ALTER TABLE "users" ADD COLUMN "permissions_coupons_delete" boolean;
  ALTER TABLE "users" ADD COLUMN "permissions_stores_read" boolean;
  ALTER TABLE "users" ADD COLUMN "permissions_stores_create" boolean;
  ALTER TABLE "users" ADD COLUMN "permissions_stores_update" boolean;
  ALTER TABLE "users" ADD COLUMN "permissions_stores_delete" boolean;
  ALTER TABLE "users" ADD COLUMN "permissions_categories_read" boolean;
  ALTER TABLE "users" ADD COLUMN "permissions_categories_create" boolean;
  ALTER TABLE "users" ADD COLUMN "permissions_categories_update" boolean;
  ALTER TABLE "users" ADD COLUMN "permissions_categories_delete" boolean;
  ALTER TABLE "users" ADD COLUMN "permissions_media_read" boolean;
  ALTER TABLE "users" ADD COLUMN "permissions_media_create" boolean;
  ALTER TABLE "users" ADD COLUMN "permissions_media_update" boolean;
  ALTER TABLE "users" ADD COLUMN "permissions_media_delete" boolean;
  ALTER TABLE "users" ADD COLUMN "permissions_clicks_read" boolean;
  ALTER TABLE "users" ADD COLUMN "permissions_clicks_delete" boolean;
  -- Everyone who already had an account had full access; keep it that way.
  UPDATE "users" SET "role" = 'admin';
`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" DROP COLUMN "role";
  ALTER TABLE "users" DROP COLUMN "permissions_coupons_read";
  ALTER TABLE "users" DROP COLUMN "permissions_coupons_create";
  ALTER TABLE "users" DROP COLUMN "permissions_coupons_update";
  ALTER TABLE "users" DROP COLUMN "permissions_coupons_delete";
  ALTER TABLE "users" DROP COLUMN "permissions_stores_read";
  ALTER TABLE "users" DROP COLUMN "permissions_stores_create";
  ALTER TABLE "users" DROP COLUMN "permissions_stores_update";
  ALTER TABLE "users" DROP COLUMN "permissions_stores_delete";
  ALTER TABLE "users" DROP COLUMN "permissions_categories_read";
  ALTER TABLE "users" DROP COLUMN "permissions_categories_create";
  ALTER TABLE "users" DROP COLUMN "permissions_categories_update";
  ALTER TABLE "users" DROP COLUMN "permissions_categories_delete";
  ALTER TABLE "users" DROP COLUMN "permissions_media_read";
  ALTER TABLE "users" DROP COLUMN "permissions_media_create";
  ALTER TABLE "users" DROP COLUMN "permissions_media_update";
  ALTER TABLE "users" DROP COLUMN "permissions_media_delete";
  ALTER TABLE "users" DROP COLUMN "permissions_clicks_read";
  ALTER TABLE "users" DROP COLUMN "permissions_clicks_delete";
  DROP TYPE "public"."enum_users_role";`)
}
