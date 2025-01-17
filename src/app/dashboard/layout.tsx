import { SidebarProvider,  } from "@/components/ui/sidebar"
import { AppSidebar } from "./layout/app-sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
        {/* <SidebarTrigger /> */}
        {children}
      </main>
    </SidebarProvider>
  )
}
