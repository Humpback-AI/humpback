import { generateApiKey } from "generate-api-key";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export async function fetchApiKeys() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("api_keys")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

fetchApiKeys.key = "/modules/api-keys/actions/fetchApiKeys";

export async function createApiKey(name: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error("Not authenticated");

  // Check existing API keys count
  const existingKeys = await fetchApiKeys();
  if (existingKeys.length >= 10) {
    throw new Error("Maximum limit of 10 API keys reached");
  }

  const key = generateApiKey({
    method: "base62",
    dashes: false,
  });

  const prefixedKey = `sk_${String(key)}`;

  const { error } = await supabase.from("api_keys").insert([
    {
      key: prefixedKey,
      name,
      user_id: session.user.id,
    },
  ]);

  if (error) throw error;
  return prefixedKey;
}

export async function deleteApiKey(keyId: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("api_keys")
    .delete()
    .eq("id", keyId)
    .eq("user_id", session.user.id);

  if (error) throw error;
}
