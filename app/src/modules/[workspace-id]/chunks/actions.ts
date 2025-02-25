import { createClient } from "@/lib/supabase/client";
import type { TablesInsert } from "~/supabase/types";

export async function fetchChunks(
  workspaceId: string,
  page: number = 1,
  pageSize: number = 10
) {
  const supabase = createClient();

  // Calculate the range for pagination
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const [{ count }, { data }] = await Promise.all([
    // Get total count
    supabase
      .from("chunks")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", workspaceId),
    // Get paginated data
    supabase
      .from("chunks")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .range(start, end),
  ]);

  if (!data) throw new Error("Failed to fetch chunks");

  return {
    data,
    total: count || 0,
  };
}

fetchChunks.key = "/modules/[workspace-id]/chunks/actions/fetchChunks";

/**
 * Syncs chunk operations with the Humpback server
 */
export async function syncChunks(chunkIds: string[]) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const accessToken = session?.access_token;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_HUMPBACK_SERVER_BASE_URL}/webhooks/content-sync`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        chunk_ids: chunkIds,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Sync failed: ${errorData.message || response.statusText}`);
  }

  return await response.json();
}

export async function createChunk({
  workspaceId,
  userId,
  chunk,
}: {
  workspaceId: string;
  userId: string;
  chunk: Omit<TablesInsert<"chunks">, "workspace_id">;
}) {
  const supabase = createClient();
  const { data } = await supabase
    .from("chunks")
    .insert([{ ...chunk, workspace_id: workspaceId, user_id: userId }])
    .select()
    .single()
    .throwOnError();

  await syncChunks([data.id]);

  return data;
}

export async function updateChunk(
  chunkId: string,
  chunk: Partial<TablesInsert<"chunks">>
) {
  const supabase = createClient();
  const { data } = await supabase
    .from("chunks")
    .update({ ...chunk, updated_at: new Date().toISOString() })
    .eq("id", chunkId)
    .select()
    .single()
    .throwOnError();

  await syncChunks([data.id]);

  return data;
}

export async function deleteChunk(chunkId: string) {
  const supabase = createClient();
  await supabase.from("chunks").delete().eq("id", chunkId).throwOnError();

  await syncChunks([chunkId]);
}
