'use client';

import React, { useEffect, useState } from 'react';
import { useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "../../components/sidebar/app-sidebar";
import { NavBar } from '@/components/nav-bar';
import { usePathname } from 'next/navigation';

export function AppContent({ children }: { children: React.ReactNode }) {
  const { state } = useSidebar();
  const pathname = usePathname();
  const [isBookmarkRoute, setIsBookmarkRoute] = useState(false);

  // Use useEffect to set isBookmarkRoute after hydration
  useEffect(() => {
    setIsBookmarkRoute(pathname.startsWith('/app/bookmark'));
  }, [pathname]);

  return (
    <div
      style={{ "--sidebar-width": "16rem", "--sidebar-width-icon": "3rem" } as React.CSSProperties}
      className="group/sidebar-wrapper flex min-h-screen w-full has-[[data-variant=inset]]:bg-sidebar relative"
    >
      <div className="flex min-h-screen w-full">
        <aside
          className={`${state === 'collapsed' ? 'w-[var(--sidebar-width-icon)]' : 'w-[var(--sidebar-width)]'} ${
            state === 'collapsed' ? '' : 'border-r'
          } p-4 flex flex-col z-30 relative`}
        >
          <div className="flex-1">
            <AppSidebar />
          </div>
        </aside>

        <main
          className={`flex-1 font-mono flex flex-col transition-all duration-300 ease-in-out ${
            state === 'collapsed' ? 'pl-0' : ''
          }`}
        >
          <div className="sticky top-0 z-20 bg-background">
            <NavBar />
          </div>
          <div className="w-full h-full flex flex-col items-center z-10">
            <div className={`w-full ${isBookmarkRoute ? 'px-0' : 'max-w-5xl px-4'}`}>
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}