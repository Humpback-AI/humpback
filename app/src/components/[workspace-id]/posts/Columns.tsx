"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Tables } from "~/supabase/types";

export type Post = Tables<"chunks">;

export const columns: ColumnDef<Post>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      return (
        <div className="truncate max-w-[200px]">{row.getValue("title")}</div>
      );
    },
  },
  {
    accessorKey: "content",
    header: "Content",
    cell: ({ row }) => {
      return (
        <div className="truncate max-w-[200px]">{row.getValue("content")}</div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Created at",
    cell: ({ row }) => {
      const date = row.getValue("created_at") as string;
      return (
        <div className="whitespace-nowrap">
          {date ? new Date(date).toLocaleDateString() : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "updated_at",
    header: "Updated at",
    cell: ({ row }) => {
      const date = row.getValue("updated_at") as string;
      return (
        <div className="whitespace-nowrap">
          {date ? new Date(date).toLocaleDateString() : "-"}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const post = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("EDIT_POST", { detail: post })
                )
              }
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("DELETE_POST", { detail: post })
                )
              }
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
