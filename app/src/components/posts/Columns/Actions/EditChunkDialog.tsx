"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fetchChunks, updateChunk } from "@/modules/chunks/actions";
import type { Tables } from "~/supabase/types";

const formSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(256, "Title must be less than 256 characters"),
  content: z.string().min(1, "Content is required"),
  source_url: z.string().url("Please enter a valid URL"),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  post: Tables<"chunks">;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRefetch: () => void;
}

export function EditChunkDialog({
  post,
  isOpen,
  onOpenChange,
  onRefetch,
}: Props) {
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: post.title,
      content: post.content,
      source_url: post.source_url || "",
    },
  });

  const { mutate: editPost, isPending } = useMutation({
    mutationFn: (values: FormValues) => updateChunk(post.id, values),
    onSuccess: () => {
      toast.success("Post Updated", {
        description: "Your post has been updated successfully",
      });
      form.reset();
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: [fetchChunks.key] });
      onRefetch();
    },
    onError: (error) => {
      const message = error.message || "Failed to update post";
      toast.error("Error", { description: message });
    },
  });

  function onSubmit(values: FormValues) {
    editPost(values);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
          <DialogDescription>Make changes to your post.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter post title"
              disabled={isPending}
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Write your post content here..."
              className="h-32"
              disabled={isPending}
              {...form.register("content")}
            />
            {form.formState.errors.content && (
              <p className="text-sm text-destructive">
                {form.formState.errors.content.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="source_url">Source URL</Label>
            <Input
              id="source_url"
              placeholder="https://example.com"
              disabled={isPending}
              {...form.register("source_url")}
            />
            {form.formState.errors.source_url && (
              <p className="text-sm text-destructive">
                {form.formState.errors.source_url.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
