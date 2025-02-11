import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "../dashboard/layout/app-sidebar";
import { ModeToggle } from "@/components/modeToggle";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div style={{ "--sidebar-width": "16rem", "--sidebar-width-icon": "3rem" } as React.CSSProperties} 
           className="group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar">
        <div className="flex h-screen font-mono w-full">
          <aside className="w-[var(--sidebar-width)] border-r p-4 flex flex-col">
            <div className="flex-1">
              <AppSidebar />
            </div>
            <div className="mt-auto flex justify-center">
              <ModeToggle />
            </div>
          </aside>

          <main className="flex-1 p-4 font-mono flex flex-col">
            <div className="max-w-6xl mx-auto w-full h-full flex flex-col">
              <div className="flex-1 flex flex-col gap-4">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
