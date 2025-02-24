"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Home } from "lucide-react";
import type { User } from "@supabase/supabase-js";

import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { UserAccountButton } from "@/components/UserAccountButton";
import { createClient } from "@/lib/supabase/client";

const Sidebar = () => {
  const params = useParams();
  const workspaceId = params["workspace-id"] as string;
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-gray-200 bg-white p-4 flex flex-col">
      {/* Top Section with Brand and User */}
      <div className="flex items-center justify-between mb-8 h-8">
        <span className="font-semibold text-xl">Humpback</span>
        {user && <UserAccountButton user={user} />}
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
