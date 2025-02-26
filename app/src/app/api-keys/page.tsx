"use client";

import { useQuery } from "@tanstack/react-query";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchApiKeys } from "@/modules/api-keys/actions";
import Row from "@/components/[api-key]/Row";
import { CreateKeyAction } from "@/components/[api-key]/CreateKeyAction";
import type { Tables } from "~/supabase/types";

export default function ApiKeysPage() {
  const { data: apiKeys = [], refetch } = useQuery<Tables<"api_keys">[]>({
    queryKey: [fetchApiKeys.key],
    queryFn: () => fetchApiKeys(),
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">API Keys</h1>
        <p className="text-muted-foreground mt-2">
          Manage your API keys to access the Humpback search API. Keep your API
          keys secure and never share them publicly.
        </p>
      </div>

      <div className="flex justify-end">
        <CreateKeyAction onRefetch={refetch} />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Name</TableHead>
              <TableHead className="w-[50%]">API Key</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiKeys.map((key) => (
              <Row key={key.id} apiKey={key} onDelete={refetch} />
            ))}
            {apiKeys.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No API keys found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
