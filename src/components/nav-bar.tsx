"use client";

import Link from "next/link";
import { Github } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
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
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 md:h-9 md:w-9"
              asChild
            >
              <Link
                href="https://github.com/itsmeakhil/mydevtools.tech"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4 md:h-5 md:w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
            </Button>
            <ModeToggle />
          </div>
        </div>
      </header>
    </>
  );
}