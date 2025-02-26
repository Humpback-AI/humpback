"use client";

import { usePathname } from "next/navigation";
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
import { UserAccountButton } from "@/components/Sidebar/UserAccountButton";
import { useAuth } from "@/contexts/AuthContext";

const Sidebar = () => {
  const pathname = usePathname();
  const { userData } = useAuth();

  // Don't show sidebar on auth pages
  if (pathname.startsWith("/auth")) {
    return null;
  }

  return (
    <SidebarRoot>
      <SidebarHeader className="flex flex-col gap-4">
        <div className="flex items-center px-2">
          <span className="font-semibold text-xl">Humpback</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/"}
              tooltip="Home"
            >
              <Link href="/">
                <Home />
                <span>Home</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/posts"}
              tooltip="Posts"
            >
              <Link href="/posts">
                <FileText />
                <span>Posts</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/api-keys"}
              tooltip="API Keys"
            >
              <Link href="/api-keys">
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
