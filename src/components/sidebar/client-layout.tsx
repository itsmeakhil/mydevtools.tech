'use client'
import React from 'react';
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { NavBar } from '@/components/nav-bar';

function Layout({ children }: { children: React.ReactNode }) {
  const { state } = useSidebar();
  
  return (
    <div className="flex h-screen font-mono w-full">
      <aside className={`transition-all duration-200 ease-in-out ${state === 'collapsed' ? 'w-[var(--sidebar-width-icon)]' : 'w-[var(--sidebar-width)]'} border-r p-4 flex flex-col`}>
        <div className="flex-1">
          <AppSidebar /> 
        </div>
      </aside>

      <main className="flex-1 p-1 font-mono">
        <NavBar/>
        <div className="mx-auto w-full max-w-[1200px]">
          {children}
        </div>
      </main>
    </div>
  );
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Layout>{children}</Layout>
    </SidebarProvider>
  );
}
