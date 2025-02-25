import { createClient } from "@/lib/supabase/client";
import type { TablesInsert } from "@/lib/supabase/types";

export async function fetchChunks(workspaceId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chunks")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

fetchChunks.key = "/modules/[workspace-id]/chunks/actions/fetchChunks";

export async function createChunk(
  workspaceId: string,
  chunk: Omit<TablesInsert<"chunks">, "workspace_id">
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chunks")
    .insert([{ ...chunk, workspace_id: workspaceId }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateChunk(
  chunkId: string,
  chunk: Partial<TablesInsert<"chunks">>
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chunks")
    .update(chunk)
    .eq("id", chunkId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteChunk(chunkId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("chunks").delete().eq("id", chunkId);

  if (error) throw error;
}
