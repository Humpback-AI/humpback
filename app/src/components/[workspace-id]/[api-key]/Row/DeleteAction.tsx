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
import { deleteApiKey } from "@/modules/[workspace-id]/api-keys/actions";
import { Button } from "@/components/ui/button";

interface Props {
  apiKey: Tables<"api_keys">;
  onSuccess: () => void;
}

export function DeleteAction({ apiKey, onSuccess }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: handleDelete, isPending } = useMutation({
    mutationFn: deleteApiKey,
    onSuccess: () => {
      toast.success("API Key Deleted", {
        description: "The API key has been deleted successfully",
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
        <Button variant="ghost" size="sm">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revoke API key</AlertDialogTitle>
          <AlertDialogDescription className="pt-4">
            This API key will immediately be disabled. API requests made using
            this key will be rejected, which could cause any systems still
            depending on it to break. Once revoked, you&apos;ll no longer be
            able to view this API key.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="w-full p-3 bg-muted rounded-md font-mono text-sm">
          {apiKey.key}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => handleDelete(apiKey.id)}
            disabled={isPending}
          >
            {isPending && <Loader2 className="animate-spin" />}
            Revoke key
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
