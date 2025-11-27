'use client';

import React from 'react';
import { useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "../../components/sidebar/app-sidebar";
import { NavBar } from '@/components/nav-bar';
import { MobileNav } from '@/components/mobile-nav';

export function AppContent({ children }: { children: React.ReactNode }) {
  const { state } = useSidebar();

  return (
    <div
      style={{ "--sidebar-width": "16rem", "--sidebar-width-icon": "3rem" } as React.CSSProperties}
      className="group/sidebar-wrapper flex min-h-screen w-full has-[[data-variant=inset]]:bg-sidebar relative"
    >
      <div className="flex min-h-screen w-full">
        <aside
          className={`${state === 'collapsed' ? 'w-[var(--sidebar-width-icon)]' : 'w-[var(--sidebar-width)]'} ${state === 'collapsed' ? '' : 'border-r'
            } p-4 flex flex-col z-30 relative`}
        >
          <div className="flex-1">
            <AppSidebar />
          </div>
        </aside>

        <main
          className={`flex-1 font-mono flex flex-col transition-all duration-300 ease-in-out pb-16 md:pb-0 ${state === 'collapsed' ? 'pl-0' : ''
            }`}
        >
          <div className="sticky top-0 z-20 bg-background">
            <NavBar />
          </div>
          <div className="w-full h-full flex flex-col z-10">
            <div className="w-full">
              {children}
            </div>
          </div>
          <MobileNav />
        </main>
      </div>
    </div>
  );
}