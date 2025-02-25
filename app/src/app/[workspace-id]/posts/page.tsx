"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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

        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[25%] max-w-[200px]">Title</TableHead>
                  <TableHead className="w-[35%] max-w-[200px]">
                    Content
                  </TableHead>
                  <TableHead className="w-[15%]">Created at</TableHead>
                  <TableHead className="w-[15%]">Updated at</TableHead>
                  <TableHead className="w-[10%]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chunks.map((chunk) => (
                  <TableRow key={chunk.id}>
                    <TableCell className="truncate max-w-[200px]">
                      {chunk.title}
                    </TableCell>
                    <TableCell className="truncate max-w-[200px]">
                      {chunk.content}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {chunk.created_at &&
                        new Date(chunk.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {chunk.updated_at
                        ? new Date(chunk.updated_at).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setEditingChunk(chunk as Tables<"chunks">)
                          }
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setDeletingChunk(chunk as Tables<"chunks">)
                          }
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
                      {isLoading ? "Loading..." : "No posts found"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) setPage(page - 1);
                  }}
                  className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => {
                  // Show first page, last page, and pages around current page
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= page - 1 && pageNum <= page + 1)
                  ) {
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(pageNum);
                          }}
                          isActive={page === pageNum}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (pageNum === page - 2 || pageNum === page + 2) {
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  return null;
                }
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < totalPages) setPage(page + 1);
                  }}
                  className={
                    page >= totalPages ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
