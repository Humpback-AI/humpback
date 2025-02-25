"use client";

import { useEffect, useState } from "react";
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
import { createClient } from "@/lib/supabase/client";
import { Tables } from "@/lib/supabase/types";

type ApiKey = Tables<"api_keys">;

export default function ApiKeysPage() {
  const params = useParams();
  const workspaceId = params["workspace-id"] as string;
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  async function createApiKey() {
    try {
      setIsLoading(true);
      const key = crypto.randomUUID();
      const hashedKey = await crypto.subtle
        .digest("SHA-256", new TextEncoder().encode(key))
        .then((hash) =>
          Array.from(new Uint8Array(hash))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("")
        );

      const { error } = await supabase.from("api_keys").insert([
        {
          hashed_key: hashedKey,
          workspace_id: workspaceId,
        },
      ]);

      if (error) throw error;

      toast.success("API Key Created", {
        description: `Your new API key is: ${key}\nPlease save this key as it won't be shown again.`,
      });

      // Refresh the list
      fetchApiKeys();
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

  async function deleteApiKey(id: string) {
    try {
      setIsLoading(true);
      const { error } = await supabase.from("api_keys").delete().eq("id", id);

      if (error) throw error;

      toast.success("API Key Deleted", {
        description: "The API key has been deleted successfully",
      });

      // Refresh the list
      fetchApiKeys();
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

  async function fetchApiKeys() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setApiKeys(data || []);
    } catch (error) {
      const message =
        error instanceof PostgrestError
          ? error.message
          : "Failed to fetch API keys";
      toast.error("Error", { description: message });
    } finally {
      setIsLoading(false);
    }
  }

  // Fetch API keys on component mount
  useEffect(() => {
    fetchApiKeys();
  }, []);

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
          <Button onClick={createApiKey} disabled={isLoading}>
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
                      onClick={() => deleteApiKey(key.id)}
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
