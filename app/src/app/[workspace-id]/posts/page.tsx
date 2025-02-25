"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import type { Tables } from "~/supabase/types";
import { Button } from "@/components/ui/button";
import { fetchChunks } from "@/modules/[workspace-id]/chunks/actions";
import { CreateChunkDialog } from "@/components/[workspace-id]/[chunk]/CreateChunkDialog";
import { EditChunkDialog } from "@/components/[workspace-id]/[chunk]/EditChunkDialog";
import { DeleteChunkDialog } from "@/components/[workspace-id]/[chunk]/DeleteChunkDialog";
import { DataTable } from "@/components/[workspace-id]/posts/DataTable";
import { columns } from "@/components/[workspace-id]/posts/Columns";

const ITEMS_PER_PAGE = 10;

export default function PostsPage() {
  const params = useParams();
  const workspaceId = params["workspace-id"] as string;
  const [page, setPage] = useState(1);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingChunk, setEditingChunk] = useState<Tables<"chunks"> | null>(
    null
  );
  const [deletingChunk, setDeletingChunk] = useState<Tables<"chunks"> | null>(
    null
  );

  const {
    data: chunksData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["chunks", workspaceId, page],
    queryFn: () => fetchChunks(workspaceId, page, ITEMS_PER_PAGE),
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

  const chunks = chunksData?.data ?? [];
  const totalPages = chunksData
    ? Math.ceil(chunksData.total / ITEMS_PER_PAGE)
    : 0;

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

        <div className="flex justify-end">
          <Button
            onClick={() => setShowCreateDialog(true)}
            disabled={isLoading}
          >
            <Plus />
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
