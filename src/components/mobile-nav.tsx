"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, LayoutGrid, Menu, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/components/ui/sidebar"

export function MobileNav() {
    const pathname = usePathname()
    const { toggleSidebar, openMobile } = useSidebar()

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-background/80 px-4 backdrop-blur-lg md:hidden pb-[env(safe-area-inset-bottom)]">
            <Link
                href="/dashboard"
                className={cn(
                    "flex flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary",
                    pathname === "/dashboard" && "text-primary"
                )}
            >
                <Home className="h-5 w-5" />
                <span>Home</span>
            </Link>

            <button
                onClick={() => toggleSidebar()}
                className={cn(
                    "flex flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary",
                    openMobile && "text-primary"
                )}
            >
                <LayoutGrid className="h-5 w-5" />
                <span>Tools</span>
            </button>

            <Link
                href="/settings"
                className={cn(
                    "flex flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary",
                    pathname === "/settings" && "text-primary"
                )}
            >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
            </Link>
        </div>
    )
}
