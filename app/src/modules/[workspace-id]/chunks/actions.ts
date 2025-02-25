import { SearchResponse } from "meilisearch";

import { PostSearchChunksSchema } from "@/app/schemas/api/chunks/search/schema";
import { ChunkPayload } from "~/meilisearch/types";
import type { TablesInsert } from "~/supabase/types";
import { createClient } from "@/lib/supabase/client";

export async function fetchChunks(
  args: PostSearchChunksSchema
): Promise<
  SearchResponse<ChunkPayload, { hitsPerPage: number; page: number }>
> {
  if (!args.query.trim()) {
    const supabase = createClient();
    const from = (args.page - 1) * (args.hitsPerPage || 10);
    const to = from + (args.hitsPerPage || 10) - 1;

    const { data: chunks, count } = await supabase
      .from("chunks")
      .select("*", { count: "exact" })
      .eq("workspace_id", args.workspaceId)
      .order("created_at", { ascending: false })
      .range(from, to);

    const transformedChunks = (chunks || []).map((chunk) => ({
      ...chunk,
      created_at_timestamp: new Date(chunk.created_at).getTime(),
      updated_at_timestamp: chunk.updated_at
        ? new Date(chunk.updated_at).getTime()
        : null,
    }));

    const hitsPerPage = args.hitsPerPage || 10;
    const totalHits = count || 0;
    const totalPages = Math.ceil(totalHits / hitsPerPage);

    return {
      hits: transformedChunks,
      page: args.page,
      hitsPerPage,
      totalHits,
      totalPages,
      processingTimeMs: 0,
      query: args.query,
    };
  }

  const response = await fetch("/api/chunks/search", {
    method: "POST",
    body: JSON.stringify(args),
  });

  const results = await response.json();

  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }

  return results;
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
    `${process.env.NEXT_PUBLIC_HUMPBACK_SERVER_BASE_URL}/v1/webhooks/content-sync`,
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
