"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Home } from "lucide-react";

import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

const Sidebar = () => {
  const params = useParams();
  const workspaceId = params["workspace-id"] as string;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-gray-200 bg-white p-4 flex flex-col">
      {/* Brand Logo */}
      <div className="flex items-center gap-2 mb-8">
        <span className="font-semibold text-xl">Humpback</span>
      </div>

      {/* Workspace Switcher */}
      <WorkspaceSwitcher currentWorkspaceId={workspaceId} />

      {/* Navigation Links */}
      <nav className="flex-1">
        <ul className="space-y-2">
          <li>
            <Link
              href={`/${workspaceId}`}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 text-gray-700"
            >
              <Home size={20} />
              <span>Overview</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto"></div>
    </aside>
  );
};

export default Sidebar;
