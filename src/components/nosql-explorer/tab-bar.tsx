"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { IconX, IconDatabase } from "@tabler/icons-react";
import { ExplorerTab } from "./types";

interface TabBarProps {
    tabs: ExplorerTab[];
    activeTabId: string | null;
    onTabChange: (tabId: string) => void;
    onTabClose: (tabId: string) => void;
    onCloseAll?: () => void;
}

export function TabBar({ tabs, activeTabId, onTabChange, onTabClose, onCloseAll }: TabBarProps) {
    return (
        <div className="flex items-center border-b bg-muted/10">
            <ScrollArea className="flex-1 w-full whitespace-nowrap">
                <div className="flex items-center px-1">
                    {tabs.map((tab) => (
                        <div
                            key={tab.id}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 text-sm border-r cursor-pointer hover:bg-background/50 transition-colors min-w-[120px] max-w-[200px]",
                                activeTabId === tab.id ? "bg-background font-medium border-b-2 border-b-primary" : "text-muted-foreground"
                            )}
                            onClick={() => onTabChange(tab.id)}
                        >
                            <span
                                className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap [direction:rtl] text-left"
                                title={`${tab.connectionName} - ${tab.dbName} - ${tab.collectionName}`}
                            >
                                {`${tab.connectionName} - ${tab.dbName} - ${tab.collectionName}`}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 hover:bg-muted rounded-full"
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
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
            {tabs.length > 0 && onCloseAll && (
                <div className="border-l px-2">
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-destructive" onClick={onCloseAll}>
                        Close All
                    </Button>
                </div>
            )}
        </div>
    );
}
