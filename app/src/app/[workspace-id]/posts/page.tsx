"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useDebouncedCallback } from "use-debounce";
import type { SearchResponse } from "meilisearch";

import type { Tables } from "~/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchChunks } from "@/modules/[workspace-id]/chunks/actions";
import { CreateChunkDialog } from "@/components/[workspace-id]/[chunk]/CreateChunkDialog";
import { EditChunkDialog } from "@/components/[workspace-id]/[chunk]/EditChunkDialog";
import { DeleteChunkDialog } from "@/components/[workspace-id]/[chunk]/DeleteChunkDialog";
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
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingChunk, setEditingChunk] = useState<Tables<"chunks"> | null>(
    null
  );
  const [deletingChunk, setDeletingChunk] = useState<Tables<"chunks"> | null>(
    null
  );

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

  useEffect(() => {
    const handleEditPost = (event: CustomEvent<Tables<"chunks">>) => {
      setEditingChunk(event.detail);
    };

    const handleDeletePost = (event: CustomEvent<Tables<"chunks">>) => {
      setDeletingChunk(event.detail);
    };

    window.addEventListener("EDIT_POST", handleEditPost as EventListener);
    window.addEventListener("DELETE_POST", handleDeletePost as EventListener);

    return () => {
      window.removeEventListener("EDIT_POST", handleEditPost as EventListener);
      window.removeEventListener(
        "DELETE_POST",
        handleDeletePost as EventListener
      );
    };
  }, []);

  const chunks = chunksData?.hits ?? [];
  const totalPages = chunksData?.totalPages ?? 0;

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    debouncedSearch(value);
  };

  return (
    <div className="container mx-auto py-10 max-w-screen-xl">
      <CreateChunkDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={refetch}
      />

      {editingChunk && (
        <EditChunkDialog
          chunk={editingChunk}
          isOpen={true}
          onClose={() => setEditingChunk(null)}
          onSuccess={refetch}
        />
      )}

      {deletingChunk && (
        <DeleteChunkDialog
          chunk={deletingChunk}
          isOpen={true}
          onClose={() => setDeletingChunk(null)}
          onSuccess={refetch}
        />
      )}

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
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create new post
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={chunks}
          pageCount={totalPages}
          currentPage={page}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
