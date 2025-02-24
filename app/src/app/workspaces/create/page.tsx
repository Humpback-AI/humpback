"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/ui/icons";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Define the form schema
const workspaceFormSchema = z.object({
  workspaceName: z
    .string()
    .min(3, "Workspace name must be at least 3 characters")
    .max(50, "Workspace name must be less than 50 characters"),
});

type WorkspaceFormValues = z.infer<typeof workspaceFormSchema>;

export default function CreateWorkspacePage() {
  const router = useRouter();
  const [error, setError] = useState<string>("");

  const form = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceFormSchema),
    defaultValues: {
      workspaceName: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: WorkspaceFormValues) {
    setError("");

    try {
      const supabase = createClient();

      // Create the workspace and automatically assign the creator as owner
      const { data: workspaceId, error: workspaceError } = await supabase.rpc(
        "create_workspace_with_owner",
        { workspace_name: values.workspaceName }
      );

      if (workspaceError) throw workspaceError;

      // Redirect to the workspace's overview page
      router.push(`/${workspaceId}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while creating the workspace"
      );
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Create a Workspace</CardTitle>
          <CardDescription>
            Create a new workspace to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workspaceName">Workspace Name</Label>
              <Input
                id="workspaceName"
                placeholder="Enter workspace name"
                disabled={isSubmitting}
                {...form.register("workspaceName")}
              />
              {form.formState.errors.workspaceName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.workspaceName.message}
                </p>
              )}
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Workspace
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
