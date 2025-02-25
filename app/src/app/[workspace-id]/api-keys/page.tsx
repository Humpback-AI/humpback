"use client";

import { Plus } from "lucide-react";
import { useParams } from "next/navigation";
import { PostgrestError } from "@supabase/supabase-js";
import { toast } from "sonner";
import { useQuery, useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createApiKey,
  fetchApiKeys,
} from "@/modules/[workspace-id]/api-keys/actions";
import Row from "@/components/[workspace-id]/[api-key]/Row";

export default function ApiKeysPage() {
  const params = useParams();
  const workspaceId = params["workspace-id"] as string;

  const {
    data: apiKeys = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [fetchApiKeys.key, workspaceId],
    queryFn: () => fetchApiKeys(workspaceId),
  });

  const { mutate: handleCreateKey, isPending: isCreating } = useMutation({
    mutationFn: () => createApiKey(workspaceId),
    onSuccess: (key) => {
      toast.success("API Key Created", {
        description: (
          <div className="mt-2 font-mono text-xs break-all">{key}</div>
        ),
      });
      refetch();
    },
    onError: (error) => {
      const message =
        error instanceof PostgrestError
          ? error.message
          : "Failed to create API key";
      toast.error("Error", { description: message });
    },
  });

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground mt-2">
            Manage your API keys to access the Humpback search API. Keep your
            API keys secure and never share them publicly.
          </p>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={() => handleCreateKey()}
            disabled={isCreating || isLoading}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Key
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60%]">API Key</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((key) => (
                <Row key={key.id} apiKey={key} />
              ))}
              {apiKeys.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    No API keys found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
