"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useHotkeys } from "react-hotkeys-hook";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createChunk } from "@/modules/chunks/actions";
import { useAuth } from "@/contexts/AuthContext";

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
  onRefetch: () => void;
}

export function CreateChunkAction({ onRefetch }: Props) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [isOpen, setIsOpen] = useState(false);

  useHotkeys("c", () => setIsOpen(true), {
    enabled: !isOpen,
    enableOnFormTags: false,
    preventDefault: true,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      source_url: "",
    },
  });

  const { mutate: createPost, isPending } = useMutation({
    mutationFn: (values: FormValues) =>
      createChunk({ userId: userId!, chunk: values }),
    onSuccess: () => {
      toast.success("Post Created", {
        description: "Your post has been created successfully",
      });
      form.reset();
      setIsOpen(false);
      onRefetch();
    },
    onError: (error) => {
      const message = error.message || "Failed to create post";
      toast.error("Error", { description: message });
    },
  });

  function onSubmit(values: FormValues) {
    createPost(values);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="group flex items-center gap-2">
          Create Post
          <kbd className="hidden rounded px-2 py-0.5 text-xs font-light transition-all duration-75 md:inline-block bg-neutral-700 text-neutral-400 group-hover:bg-neutral-600 group-hover:text-neutral-300">
            C
          </kbd>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
          <DialogDescription>
            Create a new post. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter title"
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
              placeholder="Enter content"
              disabled={isPending}
              className="h-32"
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
              placeholder="Enter source URL"
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
              <Button type="button" variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
