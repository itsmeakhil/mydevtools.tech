"use client"

import * as React from "react"
import { X, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { ApiRequestState } from "./types"

interface TabBarProps {
    tabs: ApiRequestState[]
    activeTabId: string
    onTabChange: (id: string) => void
    onTabClose: (id: string) => void
    onTabAdd: () => void
}

export function TabBar({
    tabs,
    activeTabId,
    onTabChange,
    onTabClose,
    onTabAdd,
}: TabBarProps) {
    return (
        <div className="flex items-center border-b bg-muted/40">
            <ScrollArea className="flex-initial min-w-0 whitespace-nowrap border-r">
                <div className="flex w-max items-center">
                    {tabs.map((tab) => (
                        <div
                            key={tab.id}
                            className={cn(
                                "group flex items-center gap-2 border-r px-4 py-2 text-sm font-medium hover:bg-muted/60 cursor-pointer select-none min-w-[120px] max-w-[200px]",
                                activeTabId === tab.id && "bg-background text-primary border-b-2 border-b-primary"
                            )}
                            onClick={() => onTabChange(tab.id)}
                        >
                            <span className={cn(
                                "text-xs font-bold uppercase mr-1",
                                tab.method === "GET" && "text-blue-500",
                                tab.method === "POST" && "text-green-500",
                                tab.method === "PUT" && "text-orange-500",
                                tab.method === "DELETE" && "text-red-500",
                                tab.method === "PATCH" && "text-yellow-500",
                            )}>
                                {tab.method}
                            </span>
                            <span className="truncate flex-1">
                                {tab.name || "Untitled Request"}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 opacity-0 group-hover:opacity-100 hover:bg-muted-foreground/20 rounded-full"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onTabClose(tab.id)
                                }}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" className="h-2.5" />
            </ScrollArea>
            <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-none hover:bg-muted/60 shrink-0"
                onClick={onTabAdd}
            >
                <Plus className="h-4 w-4" />
            </Button>
        </div>
    )
}
