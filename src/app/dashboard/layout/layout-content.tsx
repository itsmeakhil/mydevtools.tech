'use client'
import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { NavBar } from '@/components/nav-bar';

export function LayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen font-mono w-full">
        <aside className="w-[var(--sidebar-width)] border-r p-4 flex flex-col">
          <div className="flex-1">
            <AppSidebar /> 
          </div>
        </aside>

        <main className="flex-1 p-1 font-mono ">
          <NavBar/>
          <div className="mx-auto w-full max-w-[1200px]">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
