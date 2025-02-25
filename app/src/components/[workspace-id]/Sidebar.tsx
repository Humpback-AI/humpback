"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Home } from "lucide-react";
import type { User } from "@supabase/supabase-js";

import { UserAccountButton } from "@/components/[workspace-id]/Sidebar/UserAccountButton";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { WorkspaceSwitcher } from "./Sidebar/WorkspaceSwitcher";

const Sidebar = () => {
  const params = useParams();
  const pathname = usePathname();
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
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                pathname === `/${workspaceId}` &&
                  "bg-accent text-accent-foreground"
              )}
              asChild
            >
              <Link
                href={`/${workspaceId}`}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 text-gray-700"
              >
                <Home />
                <span>Home</span>
              </Link>
            </Button>
          </li>
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto"></div>
    </aside>
  );
};

export default Sidebar;
