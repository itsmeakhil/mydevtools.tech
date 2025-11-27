import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, LayoutGrid, LogOut, User as UserIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import useAuth from "@/utils/useAuth"
import { signOut as firebaseSignOut } from "firebase/auth"
import { auth } from "@/database/firebase"
import { usePasswordStore } from "@/store/password-store"

export function MobileNav() {
    const pathname = usePathname()
    const router = useRouter()
    const { toggleSidebar, openMobile } = useSidebar()
    const { user } = useAuth()
    const { lockVault } = usePasswordStore()

    const handleSignOut = async () => {
        try {
            lockVault() // Clear in-memory state immediately

            // Clear encryption key from IndexedDB
            if (typeof window !== 'undefined' && window.indexedDB) {
                await new Promise<void>((resolve) => {
                    const req = window.indexedDB.open("PasswordManagerDB", 1)
                    req.onsuccess = (e: any) => {
                        const db = e.target.result
                        if (db.objectStoreNames.contains("keys")) {
                            const tx = db.transaction("keys", "readwrite")
                            tx.objectStore("keys").delete("vaultKey")
                            tx.oncomplete = () => resolve()
                            tx.onerror = () => resolve()
                        } else {
                            resolve()
                        }
                    }
                    req.onerror = () => resolve()
                })
            }

            await firebaseSignOut(auth);
            router.push('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

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

            {user ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className={cn(
                            "flex flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary",
                            "focus:outline-none"
                        )}>
                            <Avatar className="h-5 w-5">
                                <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
                                <AvatarFallback className="text-[10px]">{user.displayName?.[0] || "U"}</AvatarFallback>
                            </Avatar>
                            <span>Profile</span>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" side="top" className="w-56">
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user.displayName}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <Link
                    href="/login"
                    className={cn(
                        "flex flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary",
                        pathname === "/login" && "text-primary"
                    )}
                >
                    <UserIcon className="h-5 w-5" />
                    <span>Login</span>
                </Link>
            )}
        </div>
    )
}
