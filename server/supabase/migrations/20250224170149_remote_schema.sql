alter table "public"."users" add column "full_name" text;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$function$
;

create policy "Users can create a profile."
on "public"."users"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = id));


create policy "Users can delete a profile."
on "public"."users"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = id));


create policy "Users can update own user data."
on "public"."users"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = id))
with check ((( SELECT auth.uid() AS uid) = id));


create policy "Users can view own user data."
on "public"."users"
as permissive
for select
to public
using ((auth.uid() = id));



