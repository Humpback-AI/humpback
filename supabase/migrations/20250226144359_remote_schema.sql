drop policy "Users can create API keys in their workspaces" on "public"."api_keys";

drop policy "Users can delete their workspace API keys" on "public"."api_keys";

drop policy "Users can view their workspace API keys" on "public"."api_keys";

drop policy "Users can view their workspace roles" on "public"."workspace_roles";

drop policy "Users can view their workspaces" on "public"."workspaces";

revoke delete on table "public"."workspace_roles" from "anon";

revoke insert on table "public"."workspace_roles" from "anon";

revoke references on table "public"."workspace_roles" from "anon";

revoke select on table "public"."workspace_roles" from "anon";

revoke trigger on table "public"."workspace_roles" from "anon";

revoke truncate on table "public"."workspace_roles" from "anon";

revoke update on table "public"."workspace_roles" from "anon";

revoke delete on table "public"."workspace_roles" from "authenticated";

revoke insert on table "public"."workspace_roles" from "authenticated";

revoke references on table "public"."workspace_roles" from "authenticated";

revoke select on table "public"."workspace_roles" from "authenticated";

revoke trigger on table "public"."workspace_roles" from "authenticated";

revoke truncate on table "public"."workspace_roles" from "authenticated";

revoke update on table "public"."workspace_roles" from "authenticated";

revoke delete on table "public"."workspace_roles" from "service_role";

revoke insert on table "public"."workspace_roles" from "service_role";

revoke references on table "public"."workspace_roles" from "service_role";

revoke select on table "public"."workspace_roles" from "service_role";

revoke trigger on table "public"."workspace_roles" from "service_role";

revoke truncate on table "public"."workspace_roles" from "service_role";

revoke update on table "public"."workspace_roles" from "service_role";

revoke delete on table "public"."workspaces" from "anon";

revoke insert on table "public"."workspaces" from "anon";

revoke references on table "public"."workspaces" from "anon";

revoke select on table "public"."workspaces" from "anon";

revoke trigger on table "public"."workspaces" from "anon";

revoke truncate on table "public"."workspaces" from "anon";

revoke update on table "public"."workspaces" from "anon";

revoke delete on table "public"."workspaces" from "authenticated";

revoke insert on table "public"."workspaces" from "authenticated";

revoke references on table "public"."workspaces" from "authenticated";

revoke select on table "public"."workspaces" from "authenticated";

revoke trigger on table "public"."workspaces" from "authenticated";

revoke truncate on table "public"."workspaces" from "authenticated";

revoke update on table "public"."workspaces" from "authenticated";

revoke delete on table "public"."workspaces" from "service_role";

revoke insert on table "public"."workspaces" from "service_role";

revoke references on table "public"."workspaces" from "service_role";

revoke select on table "public"."workspaces" from "service_role";

revoke trigger on table "public"."workspaces" from "service_role";

revoke truncate on table "public"."workspaces" from "service_role";

revoke update on table "public"."workspaces" from "service_role";

alter table "public"."api_keys" drop constraint "api_keys_workspace_id_fkey";

alter table "public"."chunks" drop constraint "chunks_workspace_id_fkey";

alter table "public"."workspace_roles" drop constraint "workspace_roles_user_id_fkey";

alter table "public"."workspace_roles" drop constraint "workspace_roles_workspace_id_fkey";

drop function if exists "public"."create_workspace_with_owner"(workspace_name text);

alter table "public"."workspace_roles" drop constraint "organization_roles_pkey";

alter table "public"."workspaces" drop constraint "organizations_pkey";

drop index if exists "public"."organization_roles_pkey";

drop index if exists "public"."organizations_pkey";

drop table "public"."workspace_roles";

drop table "public"."workspaces";

alter table "public"."api_keys" drop column "workspace_id";

alter table "public"."api_keys" add column "user_id" uuid not null;

alter table "public"."chunks" drop column "workspace_id";

alter table "public"."chunks" alter column "user_id" set not null;

alter table "public"."api_keys" add constraint "api_keys_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."api_keys" validate constraint "api_keys_user_id_fkey";

create policy "Users can create their own API keys"
on "public"."api_keys"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can delete their own API keys"
on "public"."api_keys"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can update their own API keys"
on "public"."api_keys"
as permissive
for update
to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Users can view their own API keys"
on "public"."api_keys"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Anyone can view chunks"
on "public"."chunks"
as permissive
for select
to public
using (true);


create policy "Users can create their own chunks"
on "public"."chunks"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can delete their own chunks"
on "public"."chunks"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can update their own chunks"
on "public"."chunks"
as permissive
for update
to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



