"use client";

import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

import { type Tables } from "@/lib/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteChunk } from "@/modules/[workspace-id]/chunks/actions";

interface DeleteChunkDialogProps {
  chunk: Tables<"chunks">;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteChunkDialog({
  chunk,
  isOpen,
  onClose,
  onSuccess,
}: DeleteChunkDialogProps) {
  const { mutate: handleDelete, isPending } = useMutation({
    mutationFn: deleteChunk,
    onSuccess: () => {
      toast.success("Post Deleted", {
        description: "The post has been deleted successfully",
      });
      onSuccess();
      onClose();
    },
    onError: (error) => {
      const message = error.message || "Failed to delete post";
      toast.error("Error", { description: message });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Post</DialogTitle>
          <DialogDescription className="pt-4">
            Are you sure you want to delete this post? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="w-full p-3 bg-muted rounded-md">
            <p className="font-medium">{chunk.title}</p>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {chunk.content}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleDelete(chunk.id)}
            disabled={isPending}
          >
            Delete Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
