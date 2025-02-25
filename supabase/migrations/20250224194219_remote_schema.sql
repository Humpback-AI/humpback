revoke delete on table "public"."organization_roles" from "anon";

revoke insert on table "public"."organization_roles" from "anon";

revoke references on table "public"."organization_roles" from "anon";

revoke select on table "public"."organization_roles" from "anon";

revoke trigger on table "public"."organization_roles" from "anon";

revoke truncate on table "public"."organization_roles" from "anon";

revoke update on table "public"."organization_roles" from "anon";

revoke delete on table "public"."organization_roles" from "authenticated";

revoke insert on table "public"."organization_roles" from "authenticated";

revoke references on table "public"."organization_roles" from "authenticated";

revoke select on table "public"."organization_roles" from "authenticated";

revoke trigger on table "public"."organization_roles" from "authenticated";

revoke truncate on table "public"."organization_roles" from "authenticated";

revoke update on table "public"."organization_roles" from "authenticated";

revoke delete on table "public"."organization_roles" from "service_role";

revoke insert on table "public"."organization_roles" from "service_role";

revoke references on table "public"."organization_roles" from "service_role";

revoke select on table "public"."organization_roles" from "service_role";

revoke trigger on table "public"."organization_roles" from "service_role";

revoke truncate on table "public"."organization_roles" from "service_role";

revoke update on table "public"."organization_roles" from "service_role";

revoke delete on table "public"."organizations" from "anon";

revoke insert on table "public"."organizations" from "anon";

revoke references on table "public"."organizations" from "anon";

revoke select on table "public"."organizations" from "anon";

revoke trigger on table "public"."organizations" from "anon";

revoke truncate on table "public"."organizations" from "anon";

revoke update on table "public"."organizations" from "anon";

revoke delete on table "public"."organizations" from "authenticated";

revoke insert on table "public"."organizations" from "authenticated";

revoke references on table "public"."organizations" from "authenticated";

revoke select on table "public"."organizations" from "authenticated";

revoke trigger on table "public"."organizations" from "authenticated";

revoke truncate on table "public"."organizations" from "authenticated";

revoke update on table "public"."organizations" from "authenticated";

revoke delete on table "public"."organizations" from "service_role";

revoke insert on table "public"."organizations" from "service_role";

revoke references on table "public"."organizations" from "service_role";

revoke select on table "public"."organizations" from "service_role";

revoke trigger on table "public"."organizations" from "service_role";

revoke truncate on table "public"."organizations" from "service_role";

revoke update on table "public"."organizations" from "service_role";

alter table "public"."api_keys" drop constraint "api_keys_organization_id_fkey";

alter table "public"."chunks" drop constraint "chunks_organization_id_fkey";

alter table "public"."organization_roles" drop constraint "organization_roles_organization_id_fkey";

alter table "public"."organization_roles" drop constraint "organization_roles_user_id_fkey";

alter table "public"."organization_roles" drop constraint "organization_roles_pkey";

alter table "public"."organizations" drop constraint "organizations_pkey";

drop index if exists "public"."organization_roles_pkey";

drop index if exists "public"."organizations_pkey";

drop table "public"."organization_roles";

drop table "public"."organizations";

create table "public"."workspace_roles" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text),
    "updated_at" timestamp with time zone,
    "user_id" uuid not null,
    "workspace_id" uuid not null,
    "role" text not null
);


alter table "public"."workspace_roles" enable row level security;

create table "public"."workspaces" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text),
    "updated_at" timestamp with time zone,
    "name" text not null
);


alter table "public"."workspaces" enable row level security;

alter table "public"."api_keys" drop column "organization_id";

alter table "public"."api_keys" add column "workspace_id" uuid not null;

alter table "public"."chunks" drop column "organization_id";

alter table "public"."chunks" add column "workspace_id" uuid not null;

alter table "public"."users" add column "avatar_image_url" text;

CREATE UNIQUE INDEX organization_roles_pkey ON public.workspace_roles USING btree (id);

CREATE UNIQUE INDEX organizations_pkey ON public.workspaces USING btree (id);

alter table "public"."workspace_roles" add constraint "organization_roles_pkey" PRIMARY KEY using index "organization_roles_pkey";

alter table "public"."workspaces" add constraint "organizations_pkey" PRIMARY KEY using index "organizations_pkey";

alter table "public"."api_keys" add constraint "api_keys_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES workspaces(id) not valid;

alter table "public"."api_keys" validate constraint "api_keys_workspace_id_fkey";

alter table "public"."chunks" add constraint "chunks_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES workspaces(id) not valid;

alter table "public"."chunks" validate constraint "chunks_workspace_id_fkey";

alter table "public"."workspace_roles" add constraint "organization_roles_organization_id_fkey" FOREIGN KEY (workspace_id) REFERENCES workspaces(id) not valid;

alter table "public"."workspace_roles" validate constraint "organization_roles_organization_id_fkey";

alter table "public"."workspace_roles" add constraint "organization_roles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."workspace_roles" validate constraint "organization_roles_user_id_fkey";

grant delete on table "public"."workspace_roles" to "anon";

grant insert on table "public"."workspace_roles" to "anon";

grant references on table "public"."workspace_roles" to "anon";

grant select on table "public"."workspace_roles" to "anon";

grant trigger on table "public"."workspace_roles" to "anon";

grant truncate on table "public"."workspace_roles" to "anon";

grant update on table "public"."workspace_roles" to "anon";

grant delete on table "public"."workspace_roles" to "authenticated";

grant insert on table "public"."workspace_roles" to "authenticated";

grant references on table "public"."workspace_roles" to "authenticated";

grant select on table "public"."workspace_roles" to "authenticated";

grant trigger on table "public"."workspace_roles" to "authenticated";

grant truncate on table "public"."workspace_roles" to "authenticated";

grant update on table "public"."workspace_roles" to "authenticated";

grant delete on table "public"."workspace_roles" to "service_role";

grant insert on table "public"."workspace_roles" to "service_role";

grant references on table "public"."workspace_roles" to "service_role";

grant select on table "public"."workspace_roles" to "service_role";

grant trigger on table "public"."workspace_roles" to "service_role";

grant truncate on table "public"."workspace_roles" to "service_role";

grant update on table "public"."workspace_roles" to "service_role";

grant delete on table "public"."workspaces" to "anon";

grant insert on table "public"."workspaces" to "anon";

grant references on table "public"."workspaces" to "anon";

grant select on table "public"."workspaces" to "anon";

grant trigger on table "public"."workspaces" to "anon";

grant truncate on table "public"."workspaces" to "anon";

grant update on table "public"."workspaces" to "anon";

grant delete on table "public"."workspaces" to "authenticated";

grant insert on table "public"."workspaces" to "authenticated";

grant references on table "public"."workspaces" to "authenticated";

grant select on table "public"."workspaces" to "authenticated";

grant trigger on table "public"."workspaces" to "authenticated";

grant truncate on table "public"."workspaces" to "authenticated";

grant update on table "public"."workspaces" to "authenticated";

grant delete on table "public"."workspaces" to "service_role";

grant insert on table "public"."workspaces" to "service_role";

grant references on table "public"."workspaces" to "service_role";

grant select on table "public"."workspaces" to "service_role";

grant trigger on table "public"."workspaces" to "service_role";

grant truncate on table "public"."workspaces" to "service_role";

grant update on table "public"."workspaces" to "service_role";


