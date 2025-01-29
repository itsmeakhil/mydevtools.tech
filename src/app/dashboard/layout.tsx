import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./layout/app-sidebar";
import { ModeToggle } from "@/components/modeToggle";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        {/* Sidebar with ModeToggle */}
        <aside className="w-[var(--sidebar-width)] border-r p-4 flex flex-col">
          <div className="flex-1">
            <AppSidebar />
          </div>
          <div className="mt-auto flex justify-center">
            <ModeToggle />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}