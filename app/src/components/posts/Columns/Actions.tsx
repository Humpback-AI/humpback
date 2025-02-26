import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tables } from "~/supabase/types";

import { EditChunkDialog } from "./Actions/EditChunkDialog";
import { DeleteChunkDialog } from "./Actions/DeleteChunkDialog";

interface Props {
  post: Tables<"chunks">;
  onRefetch: () => void;
}

export function Actions({ post, onRefetch }: Props) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <>
      <EditChunkDialog
        post={post}
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        onRefetch={onRefetch}
      />
      <DeleteChunkDialog
        chunk={post}
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onRefetch={onRefetch}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Pencil />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setIsDeleteOpen(true)}
            className="text-red-600"
          >
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
