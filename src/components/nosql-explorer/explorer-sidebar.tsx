"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Database, Collection } from "./types";
import { IconDatabase, IconFolder, IconChevronRight, IconChevronDown, IconRefresh, IconSearch, IconLogout } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ExplorerSidebarProps {
    databases: Database[];
    selectedDb: string | null;
    collections: Collection[];
    selectedCollection: string | null;
    onSelectDb: (dbName: string) => void;
    onSelectCollection: (collectionName: string) => void;
    onRefresh: () => void;
    onDisconnect: () => void;
}

export function ExplorerSidebar({
    databases,
    selectedDb,
    collections,
    selectedCollection,
    onSelectDb,
    onSelectCollection,
    onRefresh,
    onDisconnect,
}: ExplorerSidebarProps) {
    const [expandedDbs, setExpandedDbs] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");

    const toggleDb = (dbName: string) => {
        const newExpanded = new Set(expandedDbs);
        if (newExpanded.has(dbName)) {
            newExpanded.delete(dbName);
        } else {
            newExpanded.add(dbName);
            onSelectDb(dbName);
        }
        setExpandedDbs(newExpanded);
    };

    const filteredDatabases = databases.filter((db) =>
        db.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredCollections = collections
        .filter((col) => col.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="w-64 border-r bg-muted/10 flex flex-col h-full">
            <div className="p-4 border-b space-y-2">
                <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">Explorer</span>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onRefresh} title="Refresh">
                            <IconRefresh className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={onDisconnect} title="Disconnect">
                            <IconLogout className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="relative">
                    <IconSearch className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <Input
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                        className="h-8 pl-7 text-xs"
                    />
                </div>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {filteredDatabases.map((db) => (
                        <div key={db.name}>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "w-full justify-start gap-2 px-2 font-normal",
                                    selectedDb === db.name && "bg-accent text-accent-foreground"
                                )}
                                onClick={() => toggleDb(db.name)}
                            >
                                {expandedDbs.has(db.name) ? (
                                    <IconChevronDown className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <IconChevronRight className="h-4 w-4 text-muted-foreground" />
                                )}
                                <IconDatabase className="h-4 w-4 text-blue-500" />
                                <span className="truncate">{db.name}</span>
                            </Button>

                            {expandedDbs.has(db.name) && selectedDb === db.name && (
                                <div className="ml-6 mt-1 space-y-1 border-l pl-2">
                                    {filteredCollections.length === 0 ? (
                                        <div className="text-xs text-muted-foreground px-2 py-1">
                                            {collections.length === 0 ? "No collections" : "No matches"}
                                        </div>
                                    ) : (
                                        filteredCollections.map((col) => (
                                            <Button
                                                key={col.name}
                                                variant="ghost"
                                                size="sm"
                                                className={cn(
                                                    "w-full justify-start gap-2 px-2 h-8 font-normal text-xs",
                                                    selectedCollection === col.name && "bg-accent text-accent-foreground"
                                                )}
                                                onClick={() => onSelectCollection(col.name)}
                                            >
                                                <IconFolder className="h-3 w-3 text-yellow-500" />
                                                <span className="truncate">{col.name}</span>
                                            </Button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    {filteredDatabases.length === 0 && (
                        <div className="p-4 text-center text-xs text-muted-foreground">
                            No databases found
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
