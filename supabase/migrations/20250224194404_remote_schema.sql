alter table "public"."workspace_roles" drop constraint "organization_roles_organization_id_fkey";

alter table "public"."workspace_roles" drop constraint "organization_roles_user_id_fkey";

alter table "public"."api_keys" drop constraint "api_keys_workspace_id_fkey";

alter table "public"."chunks" drop constraint "chunks_workspace_id_fkey";

alter table "public"."workspace_roles" add constraint "workspace_roles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."workspace_roles" validate constraint "workspace_roles_user_id_fkey";

alter table "public"."workspace_roles" add constraint "workspace_roles_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE not valid;

alter table "public"."workspace_roles" validate constraint "workspace_roles_workspace_id_fkey";

alter table "public"."api_keys" add constraint "api_keys_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE not valid;

alter table "public"."api_keys" validate constraint "api_keys_workspace_id_fkey";

alter table "public"."chunks" add constraint "chunks_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE not valid;

alter table "public"."chunks" validate constraint "chunks_workspace_id_fkey";


