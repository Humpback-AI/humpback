"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createChunk } from "@/modules/[workspace-id]/chunks/actions";
import { createClient } from "@/lib/supabase/client";
import { DialogClose } from "@radix-ui/react-dialog";

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
  const params = useParams();
  const workspaceId = params["workspace-id"] as string;
  const [userId, setUserId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useHotkeys("c", () => setIsOpen(true), {
    enabled: !isOpen,
    enableOnFormTags: false,
    preventDefault: true,
  });

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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
      createChunk({ workspaceId, userId: userId!, chunk: values }),
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
          Create new post
          <kbd className="hidden rounded px-2 py-0.5 text-xs font-light transition-all duration-75 md:inline-block bg-neutral-700 text-neutral-400 group-hover:bg-neutral-600 group-hover:text-neutral-300">
            C
          </kbd>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
          <DialogDescription>
            Create a new post to share with your audience.
          </DialogDescription>
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
            <Button type="submit" disabled={isPending || !userId}>
              {isPending && <Loader2 className="animate-spin" />}
              Create Post
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
