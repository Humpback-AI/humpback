"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchChunks } from "@/modules/[workspace-id]/chunks/actions";
import { CreateChunkDialog } from "@/components/[workspace-id]/[chunk]/CreateChunkDialog";
import { EditChunkDialog } from "@/components/[workspace-id]/[chunk]/EditChunkDialog";
import { DeleteChunkDialog } from "@/components/[workspace-id]/[chunk]/DeleteChunkDialog";
import type { Tables } from "@/lib/supabase/types";

export default function PostsPage() {
  const params = useParams();
  const workspaceId = params["workspace-id"] as string;
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingChunk, setEditingChunk] = useState<Tables<"chunks"> | null>(
    null
  );
  const [deletingChunk, setDeletingChunk] = useState<Tables<"chunks"> | null>(
    null
  );

  const {
    data: chunks = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["chunks", workspaceId],
    queryFn: () => fetchChunks(workspaceId),
  });

  return (
    <div className="container mx-auto py-10">
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
            Manage your posts and content. Create, edit, and delete posts as
            needed.
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

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[25%]">Title</TableHead>
                <TableHead className="w-[35%]">Content</TableHead>
                <TableHead className="w-[15%]">Created At</TableHead>
                <TableHead className="w-[15%]">Updated At</TableHead>
                <TableHead className="w-[10%]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chunks.map((chunk) => (
                <TableRow key={chunk.id}>
                  <TableCell className="truncate max-w-md">
                    {chunk.title}
                  </TableCell>
                  <TableCell className="truncate max-w-md">
                    {chunk.content}
                  </TableCell>
                  <TableCell>
                    {new Date(chunk.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {chunk.updated_at
                      ? new Date(chunk.updated_at).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingChunk(chunk)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingChunk(chunk)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {chunks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No posts found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
