"use client"

import * as React from "react"
import { ChevronRight, ChevronDown, Folder, FileCode, MoreHorizontal, Trash2, FolderPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { CollectionFolder, CollectionRequest } from "../types"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface CollectionItemProps {
    item: CollectionFolder | CollectionRequest
    level: number
    onToggle: (id: string) => void
    onDelete: (id: string) => void
    onAddFolder: (parentId: string) => void
    onLoadRequest: (request: CollectionRequest) => void
}

export function CollectionItem({
    item,
    level,
    onToggle,
    onDelete,
    onAddFolder,
    onLoadRequest,
}: CollectionItemProps) {
    const isFolder = "type" in item && item.type === "folder"
    const paddingLeft = `${level * 12 + 12}px`

    return (
        <div>
            <div
                className={cn(
                    "group flex items-center gap-2 py-1 pr-2 text-sm hover:bg-muted/50 cursor-pointer select-none",
                    !isFolder && "hover:text-primary"
                )}
                style={{ paddingLeft }}
                onClick={() => {
                    if (isFolder) {
                        onToggle(item.id)
                    } else {
                        onLoadRequest(item as CollectionRequest)
                    }
                }}
            >
                {isFolder ? (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        {item.isOpen ? (
                            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                        ) : (
                            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                        <Folder className="h-4 w-4 shrink-0 text-blue-500 fill-blue-500/20" />
                        <span className="truncate font-medium">{item.name}</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className={cn(
                            "text-[10px] font-bold uppercase w-8 text-right shrink-0",
                            (item as CollectionRequest).method === "GET" && "text-blue-500",
                            (item as CollectionRequest).method === "POST" && "text-green-500",
                            (item as CollectionRequest).method === "PUT" && "text-orange-500",
                            (item as CollectionRequest).method === "DELETE" && "text-red-500",
                            (item as CollectionRequest).method === "PATCH" && "text-yellow-500",
                        )}>
                            {(item as CollectionRequest).method}
                        </span>
                        <span className="truncate text-muted-foreground group-hover:text-foreground">
                            {item.name}
                        </span>
                    </div>
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MoreHorizontal className="h-3 w-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {isFolder && (
                            <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation()
                                onAddFolder(item.id)
                            }}>
                                <FolderPlus className="h-4 w-4 mr-2" />
                                New Folder
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => {
                                e.stopPropagation()
                                onDelete(item.id)
                            }}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {isFolder && (item as CollectionFolder).isOpen && (
                <div>
                    {(item as CollectionFolder).items.map((child) => (
                        <CollectionItem
                            key={child.id}
                            item={child}
                            level={level + 1}
                            onToggle={onToggle}
                            onDelete={onDelete}
                            onAddFolder={onAddFolder}
                            onLoadRequest={onLoadRequest}
                        />
                    ))}
                    {(item as CollectionFolder).items.length === 0 && (
                        <div className="text-xs text-muted-foreground py-1" style={{ paddingLeft: `${(level + 1) * 12 + 32}px` }}>
                            Empty folder
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
