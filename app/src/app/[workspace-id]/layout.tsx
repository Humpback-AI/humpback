import Sidebar from "@/components/[workspace-id]/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <Sidebar />
      <main className="w-full px-3">{children}</main>
    </SidebarProvider>
  );
}
