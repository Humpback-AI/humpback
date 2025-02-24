"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { useParams } from "next/navigation";

const Sidebar = () => {
  const params = useParams();
  const workspaceId = params["workspace-id"] as string;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-gray-200 bg-white p-4 flex flex-col">
      {/* Brand Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold">H</span>
        </div>
        <span className="font-semibold text-xl">Humpback</span>
      </div>

      {/* Workspace Switcher */}
      <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 mb-6">
        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">PE</span>
        </div>
        <div className="flex flex-col text-left">
          <span className="text-sm font-medium">Personal</span>
          <span className="text-xs text-gray-500">Free</span>
        </div>
      </button>

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
