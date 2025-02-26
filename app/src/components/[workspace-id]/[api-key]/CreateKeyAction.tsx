"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createApiKey } from "@/modules/[workspace-id]/api-keys/actions";

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters"),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  onRefetch: () => void;
}

export function CreateKeyAction({ onRefetch }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const params = useParams();
  const workspaceId = params["workspace-id"] as string;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const { mutate: createKey, isPending } = useMutation({
    mutationFn: (values: FormValues) => createApiKey(workspaceId, values.name),
    onSuccess: (key) => {
      toast.success("API Key Created", {
        description: (
          <div className="mt-2 font-mono text-xs break-all">{key}</div>
        ),
        duration: 10000,
      });
      form.reset();
      onRefetch();
      setIsOpen(false);
    },
    onError: (error) => {
      const message = error.message || "Failed to create API key";
      toast.error("Error", { description: message });
    },
  });

  function onSubmit(values: FormValues) {
    createKey(values);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button disabled={isPending}>
          <Plus />
          Create new key
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create API Key</DialogTitle>
          <DialogDescription>
            Create a new API key to access the Humpback search API.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g., Production"
              disabled={isPending}
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
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
              Create Key
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
