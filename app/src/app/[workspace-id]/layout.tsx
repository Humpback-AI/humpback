import Sidebar from "@/components/[workspace-id]/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TinybirdProvider } from "@/contexts/TinybirdContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <TinybirdProvider>
        <Sidebar />
        <main className="w-full px-3 py-10">
          <div className="container mx-auto max-w-screen-xl">{children}</div>
        </main>
      </TinybirdProvider>
    </SidebarProvider>
  );
}
