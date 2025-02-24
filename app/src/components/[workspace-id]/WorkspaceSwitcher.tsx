"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 mb-6 w-full">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {currentWorkspace?.name.substring(0, 2).toUpperCase() || "WS"}
            </span>
          </div>
          <div className="flex flex-col text-left flex-1">
            <span className="text-sm font-medium">
              {currentWorkspace?.name || "--"}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-500 px-2">
            Workspaces
          </div>
          {workspaces.map((workspace) => (
            <Link
              key={workspace.id}
              href={`/${workspace.id}`}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 text-sm"
            >
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {workspace.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <span>{workspace.name}</span>
            </Link>
          ))}
          <div className="border-t my-2" />
          <Link
            href="/workspaces/create"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 text-sm text-blue-600"
          >
            Create new workspace
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
