"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "./modeToggle";

export function NavBar() {
  return (
    <>
      <header className="sticky top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-20">
        <div className="flex h-14 items-center pr-4 pl-4">
          <div className="flex items-center gap-2 md:gap-4">
            <SidebarTrigger className="hidden md:flex h-8 w-8 md:h-9 md:w-9" />
          </div>

          <div className="flex flex-1 items-center justify-center px-2">
            {/* Search removed as per user request */}
          </div>

          <div className="flex items-center gap-2">
            {/* Theme toggle - hidden on mobile (available in bottom nav) */}
            <div className="hidden md:block">
              <ModeToggle />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}