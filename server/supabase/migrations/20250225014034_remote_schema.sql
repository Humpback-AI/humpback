alter table "public"."api_keys" drop constraint "api_keys_hashed_key_key";

drop index if exists "public"."api_keys_hashed_key_key";

alter table "public"."api_keys" drop column "hashed_key";

alter table "public"."api_keys" add column "key" text not null;

CREATE UNIQUE INDEX api_keys_hashed_key_key ON public.api_keys USING btree (key);

alter table "public"."api_keys" add constraint "api_keys_hashed_key_key" UNIQUE using index "api_keys_hashed_key_key";

create policy "Users can create API keys in their workspaces"
on "public"."api_keys"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM workspace_roles
  WHERE ((workspace_roles.workspace_id = api_keys.workspace_id) AND (workspace_roles.user_id = auth.uid())))));


create policy "Users can delete their workspace API keys"
on "public"."api_keys"
as permissive
for delete
to public
using ((EXISTS ( SELECT 1
   FROM workspace_roles
  WHERE ((workspace_roles.workspace_id = api_keys.workspace_id) AND (workspace_roles.user_id = auth.uid())))));


create policy "Users can view their workspace API keys"
on "public"."api_keys"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM workspace_roles
  WHERE ((workspace_roles.workspace_id = api_keys.workspace_id) AND (workspace_roles.user_id = auth.uid())))));



