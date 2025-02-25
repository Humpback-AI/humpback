import { useState } from "react";
import { Trash2 } from "lucide-react";

import { TableCell } from "@/components/ui/table";
import { TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { Tables } from "~/supabase/types";

import { ApiKeyCell } from "./Row/ApiKeyCell";
import { DeleteDialog } from "./Row/DeleteDialog";

interface Props {
  apiKey: Tables<"api_keys">;
  onDelete: () => void;
}

export default function Row({ apiKey, onDelete }: Props) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <DeleteDialog
        apiKey={apiKey}
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onSuccess={onDelete}
      />

      <TableRow>
        <TableCell>{apiKey.name}</TableCell>
        <TableCell>
          <ApiKeyCell value={apiKey.key} />
        </TableCell>
        <TableCell>
          {new Date(apiKey.created_at).toLocaleDateString()}
        </TableCell>
        <TableCell>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TableCell>
      </TableRow>
    </>
  );
}
