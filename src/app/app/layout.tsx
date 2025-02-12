"use client"
import React from 'react';
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "../dashboard/layout/app-sidebar";
import { ModeToggle } from "@/components/modeToggle";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { state } = useSidebar();

  return (
    <div style={{ "--sidebar-width": "16rem", "--sidebar-width-icon": "3rem" } as React.CSSProperties} 
         className="group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar">
      <div className="flex h-screen font-mono w-full">
        <aside className={`${state === 'collapsed' ? 'w-[var(--sidebar-width-icon)]' : 'w-[var(--sidebar-width)]'} ${state === 'collapsed' ? '' : 'border-r'} p-4 flex flex-col`}>
          <div className="flex-1">
            <AppSidebar />
          </div>
          <div className="mt-auto flex justify-center">
            <ModeToggle />
          </div>
        </aside>

        <main className={`flex-1 pt-4 font-mono flex flex-col transition-all duration-300 ease-in-out ${state === 'collapsed' ? 'pl-0' : ''}`}>
          <div className="w-full h-full flex flex-col items-center">
            <div className="w-full max-w-4xl px-4">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}
