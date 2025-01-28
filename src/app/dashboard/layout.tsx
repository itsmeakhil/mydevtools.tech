import { SidebarProvider,  } from "@/components/ui/sidebar"
import { AppSidebar } from "./layout/app-sidebar"
import { ModeToggle } from "@/components/modeToggle"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="mt-2">
      <ModeToggle />
      </div>
      

        {children}

    </SidebarProvider>
  )
}
