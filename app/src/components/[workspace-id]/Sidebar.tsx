"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Home, Key, FileText } from "lucide-react";
import type { User } from "@supabase/supabase-js";

import {
  Sidebar as SidebarRoot,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { UserAccountButton } from "@/components/[workspace-id]/Sidebar/UserAccountButton";
import { createClient } from "@/lib/supabase/client";

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
    <SidebarRoot>
      <SidebarHeader className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <span className="font-semibold text-xl">Humpback</span>
          {user && <UserAccountButton user={user} />}
        </div>
        <WorkspaceSwitcher currentWorkspaceId={workspaceId} />
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === `/${workspaceId}`}
              tooltip="Home"
            >
              <Link href={`/${workspaceId}`}>
                <Home />
                <span>Home</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === `/${workspaceId}/posts`}
              tooltip="Posts"
            >
              <Link href={`/${workspaceId}/posts`}>
                <FileText />
                <span>Posts</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === `/${workspaceId}/api-keys`}
              tooltip="API Keys"
            >
              <Link href={`/${workspaceId}/api-keys`}>
                <Key />
                <span>API Keys</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </SidebarRoot>
  );
};

export default Sidebar;
