"use client";

import { ColumnDef } from "@tanstack/react-table";

import type { Tables } from "~/supabase/types";

import { Actions } from "./Columns/Actions";

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
    header: "Actions",
    cell: ({ row, table }) => (
      <Actions
        post={row.original}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onRefetch={(table.options.meta as any)?.onRefetch as () => void}
      />
    ),
  },
];
