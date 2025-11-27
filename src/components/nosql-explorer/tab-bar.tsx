"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { IconX, IconDatabase } from "@tabler/icons-react";
import { ExplorerTab } from "./types";

interface TabBarProps {
    tabs: ExplorerTab[];
    activeTabId: string | null;
    onTabChange: (id: string) => void;
    onTabClose: (id: string) => void;
}

export function TabBar({
    tabs,
    activeTabId,
    onTabChange,
    onTabClose,
}: TabBarProps) {
    if (tabs.length === 0) return null;

    return (
        <div className="flex items-center border-b bg-muted/40 h-10">
            <ScrollArea className="flex-1 min-w-0 whitespace-nowrap border-r h-full" horizontal>
                <div className="flex h-full items-center w-max">
                    {tabs.map((tab) => (
                        <div
                            key={tab.id}
                            className={cn(
                                "group flex items-center gap-2 border-r px-4 h-full text-xs font-medium hover:bg-muted/60 cursor-pointer select-none min-w-[150px] max-w-[250px]",
                                activeTabId === tab.id && "bg-background text-primary border-b-2 border-b-primary"
                            )}
                            onClick={() => onTabChange(tab.id)}
                            title={`${tab.dbName} - ${tab.collectionName}`}
                        >
                            <IconDatabase className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className="truncate flex-1">
                                {tab.dbName} - {tab.collectionName}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 opacity-0 group-hover:opacity-100 hover:bg-muted-foreground/20 rounded-full shrink-0"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onTabClose(tab.id);
                                }}
                            >
                                <IconX className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
