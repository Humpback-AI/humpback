import { generateApiKey } from "generate-api-key";
import { createClient } from "@/lib/supabase/client";

export async function fetchApiKeys(workspaceId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("api_keys")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createApiKey(workspaceId: string) {
  const supabase = createClient();
  const key = generateApiKey({
    method: "base62",
    prefix: "sk",
    dashes: false,
  }) as string;

  const { error } = await supabase.from("api_keys").insert([
    {
      key,
      workspace_id: workspaceId,
    },
  ]);

  if (error) throw error;
  return key;
}

export async function deleteApiKey(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("api_keys").delete().eq("id", id);
  if (error) throw error;
}
