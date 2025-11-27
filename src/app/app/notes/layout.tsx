"use client";

import { NotesProvider } from "./context/NotesContext";
import NotesSidebar from "@/components/notes/NotesSidebar";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotesLayout({ children }: { children: React.ReactNode }) {
    const isDesktop = useMediaQuery("(min-width: 768px)");

    return (
        <NotesProvider>
            <div className="flex h-screen overflow-hidden bg-background">
                {isDesktop && <NotesSidebar />}

                <main className="flex-1 overflow-hidden relative flex flex-col">
                    {!isDesktop && (
                        <div className="absolute top-4 left-4 z-50">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8"><Menu className="h-4 w-4" /></Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="p-0 w-72">
                                    <SheetHeader className="sr-only">
                                        <SheetTitle>Notes Navigation</SheetTitle>
                                    </SheetHeader>
                                    <NotesSidebar />
                                </SheetContent>
                            </Sheet>
                        </div>
                    )}
                    {children}
                </main>
            </div>
        </NotesProvider>
    );
}
