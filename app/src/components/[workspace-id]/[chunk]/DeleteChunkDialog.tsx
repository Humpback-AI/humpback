"use client";

import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import type { Tables } from "~/supabase/types";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
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
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Post</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this post? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="w-full p-3 bg-muted rounded-md">
          <p className="font-medium">{chunk.title}</p>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {chunk.content}
          </p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => handleDelete(chunk.id)}
            disabled={isPending}
          >
            {isPending && <Loader2 className="animate-spin" />}
            Delete Post
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
