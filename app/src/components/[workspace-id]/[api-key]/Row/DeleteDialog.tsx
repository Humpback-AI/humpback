import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { PostgrestError } from "@supabase/supabase-js";

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
import { deleteApiKey } from "@/modules/[workspace-id]/api-keys/actions";

interface DeleteDialogProps {
  apiKey: Tables<"api_keys">;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteDialog({
  apiKey,
  isOpen,
  onClose,
  onSuccess,
}: DeleteDialogProps) {
  const { mutate: handleDelete, isPending } = useMutation({
    mutationFn: deleteApiKey,
    onSuccess: () => {
      toast.success("API Key Deleted", {
        description: "The API key has been deleted successfully",
      });
      onSuccess();
      onClose();
    },
    onError: (error) => {
      const message =
        error instanceof PostgrestError
          ? error.message
          : "Failed to delete API key";
      toast.error("Error", { description: message });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Revoke API key</DialogTitle>
          <DialogDescription className="pt-4">
            This API key will immediately be disabled. API requests made using
            this key will be rejected, which could cause any systems still
            depending on it to break. Once revoked, you&apos;ll no longer be
            able to view or modify this API key.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="w-full p-3 bg-muted rounded-md font-mono text-sm">
            {apiKey.key}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleDelete(apiKey.id)}
            disabled={isPending}
          >
            Revoke key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
