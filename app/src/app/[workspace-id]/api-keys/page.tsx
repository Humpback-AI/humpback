"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { PostgrestError } from "@supabase/supabase-js";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Tables } from "@/lib/supabase/types";
import {
  createApiKey,
  deleteApiKey,
  fetchApiKeys,
} from "@/modules/[workspace-id]/api-keys/actions";

type ApiKey = Tables<"api_keys">;

export default function ApiKeysPage() {
  const params = useParams();
  const workspaceId = params["workspace-id"] as string;
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchKeys = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchApiKeys(workspaceId);
      setApiKeys(data);
    } catch (error) {
      const message =
        error instanceof PostgrestError
          ? error.message
          : "Failed to fetch API keys";
      toast.error("Error", { description: message });
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  async function handleCreateKey() {
    try {
      setIsLoading(true);
      const key = await createApiKey(workspaceId);

      toast.success("API Key Created", {
        description: (
          <div className="mt-2 font-mono text-xs break-all">{key}</div>
        ),
        duration: 10000,
      });

      // Refresh the list
      fetchKeys();
    } catch (error) {
      const message =
        error instanceof PostgrestError
          ? error.message
          : "Failed to create API key";
      toast.error("Error", { description: message });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteKey(id: string) {
    try {
      setIsLoading(true);
      await deleteApiKey(id);

      toast.success("API Key Deleted", {
        description: "The API key has been deleted successfully",
      });

      // Refresh the list
      fetchKeys();
    } catch (error) {
      const message =
        error instanceof PostgrestError
          ? error.message
          : "Failed to delete API key";
      toast.error("Error", { description: message });
    } finally {
      setIsLoading(false);
    }
  }

  // Fetch API keys on component mount
  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

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
          <Button onClick={handleCreateKey} disabled={isLoading}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Key
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key ID</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-mono">{key.id}</TableCell>
                  <TableCell>
                    {new Date(key.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteKey(key.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
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
