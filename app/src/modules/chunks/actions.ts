import { createClient } from "@/lib/supabase/client";
import { chunksIndex } from "@/lib/meilisearch/indexes";

const supabase = createClient();

interface FetchChunksParams {
  query: string;
  page: number;
  hitsPerPage: number;
}

export async function fetchChunks({
  query,
  page,
  hitsPerPage,
}: FetchChunksParams) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error("Not authenticated");

  // If no search query, fetch directly from Supabase
  if (!query.trim()) {
    const from = (page - 1) * hitsPerPage;
    const to = from + hitsPerPage - 1;

    const { data: chunks, count } = await supabase
      .from("chunks")
      .select("*", { count: "exact" })
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .range(from, to);

    const transformedChunks = (chunks || []).map((chunk) => ({
      ...chunk,
      created_at_timestamp: new Date(chunk.created_at).getTime(),
      updated_at_timestamp: chunk.updated_at
        ? new Date(chunk.updated_at).getTime()
        : null,
    }));

    const totalHits = count || 0;
    const totalPages = Math.ceil(totalHits / hitsPerPage);

    return {
      hits: transformedChunks,
      page,
      hitsPerPage,
      totalHits,
      totalPages,
      processingTimeMs: 0,
      query,
    };
  }

  // If there is a search query, use Meilisearch
  return chunksIndex.search(query, {
    page,
    hitsPerPage,
    filter: `user_id=${session.user.id}`,
  });
}

fetchChunks.key = "/modules/chunks/actions/fetchChunks";

interface CreateChunkParams {
  userId: string;
  chunk: {
    title: string;
    content: string;
    source_url: string;
  };
}

export async function createChunk({ userId, chunk }: CreateChunkParams) {
  const { data, error } = await supabase
    .from("chunks")
    .insert([
      {
        title: chunk.title,
        content: chunk.content,
        source_url: chunk.source_url,
        user_id: userId,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  await syncChunks([data.id]);

  return data;
}

export async function updateChunk(
  chunkId: string,
  chunk: {
    title: string;
    content: string;
    source_url: string;
  }
) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("chunks")
    .update({
      title: chunk.title,
      content: chunk.content,
      source_url: chunk.source_url,
    })
    .eq("id", chunkId)
    .eq("user_id", session.user.id)
    .select()
    .single();

  if (error) throw error;

  await syncChunks([data.id]);

  return data;
}

export async function deleteChunk(chunkId: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("chunks")
    .delete()
    .eq("id", chunkId)
    .eq("user_id", session.user.id);

  if (error) throw error;

  await syncChunks([chunkId]);
}

/**
 * Syncs chunk operations with the Humpback server
 */
export async function syncChunks(chunkIds: string[]) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error("Not authenticated");

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_HUMPBACK_SERVER_BASE_URL}/v1/webhooks/content-sync`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
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
