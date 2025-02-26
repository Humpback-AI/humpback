import dayjs from "dayjs";

import { TableCell, TableRow } from "@/components/ui/table";
import type { Tables } from "~/supabase/types";

import { DeleteAction } from "./DeleteAction";

interface Props {
  apiKey: Tables<"api_keys">;
  onDelete: () => void;
}

export default function Row({ apiKey, onDelete }: Props) {
  return (
    <TableRow>
      <TableCell>{apiKey.name}</TableCell>
      <TableCell>
        <span className="font-mono text-xs">{apiKey.key}</span>
      </TableCell>
      <TableCell>{dayjs(apiKey.created_at).format("MMM D, YYYY")}</TableCell>
      <TableCell>
        <DeleteAction apiKey={apiKey} onSuccess={onDelete} />
      </TableCell>
    </TableRow>
  );
}
