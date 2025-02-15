import { SidebarProvider } from "@/components/ui/sidebar";
import { AppContent } from "./app-content";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppContent>{children}</AppContent>
    </SidebarProvider>
  );
}
