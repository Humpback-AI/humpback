"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useDebouncedCallback } from "use-debounce";
import type { SearchResponse } from "meilisearch";

import { Input } from "@/components/ui/input";
import { fetchChunks } from "@/modules/[workspace-id]/chunks/actions";
import { CreateChunkAction } from "@/components/[workspace-id]/posts/CreateChunkAction";
import { DataTable } from "@/components/[workspace-id]/posts/DataTable";
import { columns } from "@/components/[workspace-id]/posts/Columns";
import type { ChunkPayload } from "~/meilisearch/types";

const ITEMS_PER_PAGE = 10;
const DEBOUNCE_MS = 300;

export default function PostsPage() {
  const params = useParams();
  const workspaceId = params["workspace-id"] as string;
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setDebouncedQuery(value);
    setPage(1); // Reset to first page when searching
  }, DEBOUNCE_MS);

  const {
    data: chunksData,
    isPending,
    refetch,
  } = useQuery<
    SearchResponse<ChunkPayload, { hitsPerPage: number; page: number }>
  >({
    queryKey: ["chunks", workspaceId, page, debouncedQuery],
    queryFn: () =>
      fetchChunks({
        query: debouncedQuery,
        page,
        hitsPerPage: ITEMS_PER_PAGE,
        workspaceId,
      }),
    placeholderData: (previousData) => previousData,
  });

  const chunks = chunksData?.hits ?? [];
  const totalPages = chunksData?.totalPages ?? 0;

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    debouncedSearch(value);
  };

  return (
    <div className="container mx-auto py-10 max-w-screen-xl">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Posts</h1>
          <p className="text-muted-foreground mt-2">
            Manage your posts and content. All posts will be available through
            Humpback&apos;s search API.
          </p>
        </div>

        <div className="flex justify-between items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            {isPending ? (
              <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 animate-spin" />
            ) : (
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            )}
            <Input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  debouncedSearch.flush();
                }
              }}
              className="pl-9"
            />
          </div>
          <CreateChunkAction onRefetch={refetch} />
        </div>

        <DataTable
          columns={columns}
          data={chunks}
          pageCount={totalPages}
          currentPage={page}
          onPageChange={setPage}
          onRefetch={refetch}
        />
      </div>
    </div>
  );
}
