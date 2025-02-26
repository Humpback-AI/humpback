import { TableCell } from "@/components/ui/table";
import { TableRow } from "@/components/ui/table";
import type { Tables } from "~/supabase/types";

import { ApiKeyCell } from "./Row/ApiKeyCell";
import { DeleteAction } from "./Row/DeleteAction";

interface Props {
  apiKey: Tables<"api_keys">;
  onDelete: () => void;
}

export default function Row({ apiKey, onDelete }: Props) {
  return (
    <>
      <TableRow>
        <TableCell>{apiKey.name}</TableCell>
        <TableCell>
          <ApiKeyCell value={apiKey.key} />
        </TableCell>
        <TableCell>
          {new Date(apiKey.created_at).toLocaleDateString()}
        </TableCell>
        <TableCell>
          <DeleteAction apiKey={apiKey} onSuccess={onDelete} />
        </TableCell>
      </TableRow>
    </>
  );
}
