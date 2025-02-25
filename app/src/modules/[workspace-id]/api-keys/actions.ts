import { generateApiKey } from "generate-api-key";

import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export async function fetchApiKeys(workspaceId: string) {
  const { data, error } = await supabase
    .from("api_keys")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

fetchApiKeys.key = "/modules/[workspace-id]/api-keys/actions/fetchApiKeys";

export async function createApiKey(workspaceId: string, name: string) {
  const key = generateApiKey({
    method: "base62",
    dashes: false,
  });

  const prefixedKey = `sk_${String(key)}`;

  const { error } = await supabase.from("api_keys").insert([
    {
      key: prefixedKey,
      name,
      workspace_id: workspaceId,
    },
  ]);

  if (error) throw error;
  return prefixedKey;
}

export async function deleteApiKey(id: string) {
  const { error } = await supabase.from("api_keys").delete().eq("id", id);
  if (error) throw error;
}
