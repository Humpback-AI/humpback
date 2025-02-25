alter table "public"."chunks" add column "user_id" uuid;

alter table "public"."chunks" add constraint "chunks_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL not valid;

alter table "public"."chunks" validate constraint "chunks_user_id_fkey";


