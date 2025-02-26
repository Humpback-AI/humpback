"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronsUpDown, Plus } from "lucide-react";
import { usePathname } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import { getColorFromName } from "./WorkspaceSwitcher/lib";

interface Workspace {
  id: string;
  name: string;
}

interface WorkspaceSwitcherProps {
  currentWorkspaceId: string;
}

export function WorkspaceSwitcher({
  currentWorkspaceId,
}: WorkspaceSwitcherProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(
    null
  );
  const pathname = usePathname();

  // Function to get path after workspace ID
  const getPathAfterWorkspaceId = () => {
    if (!pathname) return "";
    const parts = pathname.split("/");
    // Remove first empty string and workspace ID
    if (parts.length > 2) {
      return "/" + parts.slice(2).join("/");
    }
    return "";
  };

  useEffect(() => {
    const fetchWorkspaces = async () => {
      const supabase = createClient();

      // Get user's workspaces through workspace_roles
      const { data: workspaceRoles, error } = await supabase
        .from("workspace_roles")
        .select("workspace_id, workspaces(id, name)")
        .order("created_at", { ascending: false });

      if (!error && workspaceRoles) {
        const uniqueWorkspaces = workspaceRoles.reduce(
          (acc: Workspace[], role) => {
            const workspace = role.workspaces as Workspace;
            if (workspace && !acc.some((w) => w.id === workspace.id)) {
              acc.push(workspace);
            }
            return acc;
          },
          []
        );

        setWorkspaces(uniqueWorkspaces);
        setCurrentWorkspace(
          uniqueWorkspaces.find((w) => w.id === currentWorkspaceId) || null
        );
      }
    };

    fetchWorkspaces();
  }, [currentWorkspaceId]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 w-full h-12"
        >
          <div
            className={`w-8 h-8 ${
              currentWorkspace?.name
                ? getColorFromName(currentWorkspace.name)
                : "bg-gray-600"
            } rounded-full flex items-center justify-center`}
          >
            <span className="text-white text-sm font-medium">
              {currentWorkspace?.name.substring(0, 2).toUpperCase() || "WS"}
            </span>
          </div>
          <div className="flex flex-col text-left flex-1">
            <span className="text-sm font-medium">
              {currentWorkspace?.name || "--"}
            </span>
          </div>
          <ChevronsUpDown className="text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64"
        align="start"
        side="right"
        sideOffset={8}
      >
        <DropdownMenuLabel className="text-xs font-medium">
          Workspaces
        </DropdownMenuLabel>
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            asChild
            className="cursor-pointer"
          >
            <Link
              href={`/${workspace.id}${getPathAfterWorkspaceId()}`}
              className="flex items-center gap-2"
            >
              <div
                className={`w-8 h-8 ${getColorFromName(
                  workspace.name
                )} rounded-full flex items-center justify-center`}
              >
                <span className="text-white text-sm font-medium">
                  {workspace.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <span>{workspace.name}</span>
            </Link>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/workspaces/create" className="flex items-center gap-2">
            <Plus />
            <span>Create new workspace</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
