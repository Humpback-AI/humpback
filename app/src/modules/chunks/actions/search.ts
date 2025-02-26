"use server";

import { chunksIndex } from "@/lib/meilisearch/indexes";

export async function searchChunks({
  query,
  page,
  hitsPerPage,
  userId,
}: {
  query: string;
  page: number;
  hitsPerPage: number;
  userId: string;
}) {
  return chunksIndex.search(query, {
    page,
    hitsPerPage,
    filter: `user_id=${userId}`,
  });
}
