set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_workspace_with_owner(workspace_name text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_workspace_id uuid;
BEGIN
  INSERT INTO workspaces (name)
  VALUES (workspace_name)
  RETURNING id INTO new_workspace_id;

  INSERT INTO workspace_roles (workspace_id, user_id, role)
  VALUES (new_workspace_id, auth.uid(), 'owner');

  RETURN new_workspace_id;
END;
$function$
;

create policy "Users can view their workspace roles"
on "public"."workspace_roles"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));


create policy "Users can view their workspaces"
on "public"."workspaces"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM workspace_roles
  WHERE ((workspace_roles.workspace_id = workspaces.id) AND (workspace_roles.user_id = auth.uid())))));



