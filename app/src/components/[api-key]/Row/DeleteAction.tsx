import { useState } from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";

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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteApiKey } from "@/modules/api-keys/actions";
import { Button } from "@/components/ui/button";

interface Props {
  apiKey: Tables<"api_keys">;
  onSuccess: () => void;
}

export function DeleteAction({ apiKey, onSuccess }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const { mutate: deleteKey, isPending } = useMutation({
    mutationFn: () => deleteApiKey(apiKey.id),
    onSuccess: () => {
      toast.success("API Key Deleted", {
        description: "Your API key has been deleted successfully",
      });
      onSuccess();
      setIsOpen(false);
    },
    onError: (error) => {
      const message = error.message || "Failed to delete API key";
      toast.error("Error", { description: message });
    },
  });

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete API Key</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this API key? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteKey()}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending && <Loader2 className="animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
