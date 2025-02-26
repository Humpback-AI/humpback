"use client";

import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Key, FileText } from "lucide-react";

import {
  Sidebar as SidebarRoot,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { UserAccountButton } from "@/components/[workspace-id]/Sidebar/UserAccountButton";
import { useAuth } from "@/contexts/AuthContext";

import { WorkspaceSwitcher } from "./Sidebar/WorkspaceSwitcher";

const Sidebar = () => {
  const params = useParams();
  const pathname = usePathname();
  const workspaceId = params["workspace-id"] as string;
  const { userData } = useAuth();

  return (
    <SidebarRoot>
      <SidebarHeader className="flex flex-col gap-4">
        <div className="flex items-center px-2">
          <span className="font-semibold text-xl">Humpback</span>
        </div>
        <WorkspaceSwitcher currentWorkspaceId={workspaceId} />
      </SidebarHeader>

      <SidebarContent className="p-2">
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

      {userData && (
        <SidebarFooter>
          <UserAccountButton user={userData} />
        </SidebarFooter>
      )}
    </SidebarRoot>
  );
};

export default Sidebar;
