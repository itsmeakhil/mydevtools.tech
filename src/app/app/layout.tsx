import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "../dashboard/layout/app-sidebar";
import { ModeToggle } from "@/components/modeToggle";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen font-mono">
        <aside className="w-[var(--sidebar-width)] border-r p-4 flex flex-col">
          <div className="flex-1">
            <AppSidebar />
          </div>
          <div className="mt-auto flex justify-center">
            <ModeToggle />
          </div>
        </aside>

        <main className="flex-1">
          <div className="min-h-full w-full p-4">
            <div className="w-full max-w-6xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
