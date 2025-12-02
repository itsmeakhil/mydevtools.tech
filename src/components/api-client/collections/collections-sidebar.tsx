"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collection, CollectionFolder, CollectionRequest } from "../types"
import { CollectionItem } from "./collection-item"
import { FolderPlus, ChevronRight, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CollectionsSidebarProps {
    collections: Collection[]
    onAddFolder: (parentId: string, name: string) => void
    onDelete: (id: string) => void
    onToggle: (id: string) => void
    onLoadRequest: (request: CollectionRequest) => void
    onCreateCollection: (name: string) => void
}

export function CollectionsSidebar({
    collections,
    onAddFolder,
    onDelete,
    onToggle,
    onLoadRequest,
    onCreateCollection,
}: CollectionsSidebarProps) {
    const [collapsed, setCollapsed] = React.useState(false)
    const [newFolderDialogOpen, setNewFolderDialogOpen] = React.useState(false)
    const [newCollectionDialogOpen, setNewCollectionDialogOpen] = React.useState(false)
    const [newFolderName, setNewFolderName] = React.useState("")
    const [newCollectionName, setNewCollectionName] = React.useState("")
    const [targetParentId, setTargetParentId] = React.useState<string | null>(null)

    const handleAddFolder = () => {
        if (newFolderName && targetParentId) {
            onAddFolder(targetParentId, newFolderName)
            setNewFolderDialogOpen(false)
            setNewFolderName("")
            setTargetParentId(null)
        }
    }

    const handleCreateCollection = () => {
        if (newCollectionName) {
            onCreateCollection(newCollectionName)
            setNewCollectionDialogOpen(false)
            setNewCollectionName("")
        }
    }

    const openAddFolderDialog = (parentId: string) => {
        setTargetParentId(parentId)
        setNewFolderDialogOpen(true)
    }

    return (
        <div
            className={cn(
                "border-l bg-muted/10 flex flex-col transition-all duration-300 ease-in-out relative",
                collapsed ? "w-[0px]" : "w-[300px]"
            )}
        >
            <Button
                variant="ghost"
                size="icon"
                className="absolute -left-3 top-2 h-6 w-6 rounded-full border bg-background shadow-sm z-10"
                onClick={() => setCollapsed(!collapsed)}
            >
                {collapsed ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </Button>

            <div className={cn("flex-1 flex flex-col min-w-[300px]", collapsed && "invisible")}>
                <div className="p-4 border-b flex items-center justify-between">
                    <h3 className="font-semibold">Collections</h3>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setNewCollectionDialogOpen(true)}>
                        <FolderPlus className="h-4 w-4" />
                    </Button>
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-2">
                        {collections.map((collection) => (
                            <div key={collection.id} className="mb-4">
                                <div className="flex items-center justify-between px-2 py-1 mb-1 group">
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        {collection.name}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5 opacity-0 group-hover:opacity-100"
                                        onClick={() => openAddFolderDialog(collection.id)}
                                    >
                                        <FolderPlus className="h-3 w-3" />
                                    </Button>
                                </div>
                                {collection.items.map((item) => (
                                    <CollectionItem
                                        key={item.id}
                                        item={item}
                                        level={0}
                                        onToggle={onToggle}
                                        onDelete={onDelete}
                                        onAddFolder={openAddFolderDialog}
                                        onLoadRequest={onLoadRequest}
                                    />
                                ))}
                                {collection.items.length === 0 && (
                                    <div className="text-xs text-muted-foreground px-2 italic">
                                        No items
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            <Dialog open={newFolderDialogOpen} onOpenChange={setNewFolderDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>New Folder</DialogTitle>
                        <DialogDescription>
                            Create a new folder to organize your requests.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="folder-name">Folder Name</Label>
                            <Input
                                id="folder-name"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                placeholder="My Folder"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAddFolder}>Create Folder</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={newCollectionDialogOpen} onOpenChange={setNewCollectionDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>New Collection</DialogTitle>
                        <DialogDescription>
                            Create a new top-level collection.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="collection-name">Collection Name</Label>
                            <Input
                                id="collection-name"
                                value={newCollectionName}
                                onChange={(e) => setNewCollectionName(e.target.value)}
                                placeholder="My Collection"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreateCollection}>Create Collection</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
