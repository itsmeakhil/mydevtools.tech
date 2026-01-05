"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    IconFolder,
    IconFolderOpen,
    IconChevronRight,
    IconBookmarks,
    IconInbox,
    IconClock,
    IconDotsVertical,
    IconTrash,
    IconEdit,
    IconFolderPlus
} from "@tabler/icons-react"
import { useBookmarkStore, useChildFolders, useFolderBookmarkCount, BookmarkFolder } from "@/store/bookmark-store"
import { cn } from "@/lib/utils"
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import EditFolderDialog from "./edit-folder-dialog"
import AddFolderDialog from "./add-folder-dialog"

interface FolderTreeProps {
    onSelectFolder: (id: string | null) => void
}

export default function FolderTree({ onSelectFolder }: FolderTreeProps) {
    const { selectedFolderId, bookmarks, folders } = useBookmarkStore()
    const [deleteConfirmFolder, setDeleteConfirmFolder] = useState<BookmarkFolder | null>(null)
    const [editingFolder, setEditingFolder] = useState<BookmarkFolder | null>(null)
    const [addingToFolder, setAddingToFolder] = useState<string | null>(null)

    const totalBookmarks = bookmarks.length
    const uncategorizedCount = bookmarks.filter(b => b.folderId === null).length
    const recentCount = bookmarks.filter(b => Date.now() - b.createdAt < 7 * 24 * 60 * 60 * 1000).length

    return (
        <div className="space-y-1">
            {/* All Bookmarks */}
            <FolderItem
                icon={IconBookmarks}
                label="All Bookmarks"
                count={totalBookmarks}
                isSelected={selectedFolderId === null}
                onClick={() => onSelectFolder(null)}
            />

            {/* Uncategorized */}
            <FolderItem
                icon={IconInbox}
                label="Uncategorized"
                count={uncategorizedCount}
                isSelected={selectedFolderId === 'uncategorized'}
                onClick={() => onSelectFolder('uncategorized')}
            />

            {/* Recently Added */}
            <FolderItem
                icon={IconClock}
                label="Recently Added"
                count={recentCount}
                isSelected={false}
                onClick={() => onSelectFolder(null)}
            />

            {/* Separator */}
            <div className="h-px bg-border my-2" />

            {/* User Folders */}
            <RootFolders onSelectFolder={onSelectFolder} />

            {/* Delete Confirmation */}
            <DeleteFolderDialog
                folder={deleteConfirmFolder}
                onOpenChange={(open: boolean) => !open && setDeleteConfirmFolder(null)}
            />

            {/* Edit Folder Dialog */}
            <EditFolderDialog
                folder={editingFolder}
                onOpenChange={(open: boolean) => !open && setEditingFolder(null)}
            />

            {/* Add Subfolder Dialog */}
            <AddFolderDialog
                open={addingToFolder !== null}
                onOpenChange={(open: boolean) => !open && setAddingToFolder(null)}
                parentFolderId={addingToFolder || undefined}
            />
        </div>
    )
}

function RootFolders({ onSelectFolder }: { onSelectFolder: (id: string | null) => void }) {
    const rootFolders = useChildFolders(null)

    return (
        <div className="space-y-0.5">
            {rootFolders.map(folder => (
                <FolderNode
                    key={folder.id}
                    folder={folder}
                    depth={0}
                    onSelectFolder={onSelectFolder}
                />
            ))}
        </div>
    )
}

interface FolderNodeProps {
    folder: BookmarkFolder
    depth: number
    onSelectFolder: (id: string | null) => void
}

function FolderNode({ folder, depth, onSelectFolder }: FolderNodeProps) {
    const { selectedFolderId, toggleFolderExpanded, deleteFolder } = useBookmarkStore()
    const childFolders = useChildFolders(folder.id)
    const bookmarkCount = useFolderBookmarkCount(folder.id)
    const hasChildren = childFolders.length > 0
    const isSelected = selectedFolderId === folder.id
    const isExpanded = folder.isExpanded

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [addSubfolderOpen, setAddSubfolderOpen] = useState(false)

    const handleDelete = () => {
        deleteFolder(folder.id)
        setDeleteConfirmOpen(false)
    }

    return (
        <>
            <ContextMenu>
                <ContextMenuTrigger>
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                            "group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors",
                            isSelected
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-muted/50"
                        )}
                        style={{ paddingLeft: `${(depth * 12) + 8}px` }}
                        onClick={() => onSelectFolder(folder.id)}
                    >
                        {/* Expand/Collapse Arrow */}
                        <button
                            className={cn(
                                "h-4 w-4 flex items-center justify-center transition-transform",
                                !hasChildren && "invisible"
                            )}
                            onClick={(e) => {
                                e.stopPropagation()
                                toggleFolderExpanded(folder.id)
                            }}
                        >
                            <IconChevronRight
                                className={cn(
                                    "h-3 w-3 transition-transform",
                                    isExpanded && "rotate-90"
                                )}
                            />
                        </button>

                        {/* Folder Icon */}
                        {isExpanded ? (
                            <IconFolderOpen className="h-4 w-4 text-primary/70" />
                        ) : (
                            <IconFolder className="h-4 w-4 text-muted-foreground" />
                        )}

                        {/* Folder Name */}
                        <span className="flex-1 truncate text-sm">{folder.name}</span>

                        {/* Bookmark Count */}
                        <span className="text-xs text-muted-foreground">
                            {bookmarkCount}
                        </span>
                    </motion.div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                    <ContextMenuItem onClick={() => setAddSubfolderOpen(true)}>
                        <IconFolderPlus className="h-4 w-4 mr-2" />
                        Add Subfolder
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => setEditDialogOpen(true)}>
                        <IconEdit className="h-4 w-4 mr-2" />
                        Rename
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteConfirmOpen(true)}
                    >
                        <IconTrash className="h-4 w-4 mr-2" />
                        Delete
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>

            {/* Child Folders */}
            <AnimatePresence>
                {isExpanded && hasChildren && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {childFolders.map(child => (
                            <FolderNode
                                key={child.id}
                                folder={child}
                                depth={depth + 1}
                                onSelectFolder={onSelectFolder}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation */}
            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete folder "{folder.name}"?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will delete the folder and all its subfolders.
                            Bookmarks in these folders will be moved to Uncategorized.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Edit Dialog */}
            <EditFolderDialog
                folder={editDialogOpen ? folder : null}
                onOpenChange={(open: boolean) => !open && setEditDialogOpen(false)}
            />

            {/* Add Subfolder Dialog */}
            <AddFolderDialog
                open={addSubfolderOpen}
                onOpenChange={setAddSubfolderOpen}
                parentFolderId={folder.id}
            />
        </>
    )
}

interface FolderItemProps {
    icon: React.ElementType
    label: string
    count?: number
    isSelected: boolean
    onClick: () => void
}

function FolderItem({ icon: Icon, label, count, isSelected, onClick }: FolderItemProps) {
    return (
        <div
            className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors",
                isSelected
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted/50"
            )}
            onClick={onClick}
        >
            <Icon className="h-4 w-4" />
            <span className="flex-1 text-sm">{label}</span>
            {count !== undefined && (
                <span className="text-xs text-muted-foreground">{count}</span>
            )}
        </div>
    )
}

interface DeleteFolderDialogProps {
    folder: BookmarkFolder | null
    onOpenChange: (open: boolean) => void
}

function DeleteFolderDialog({ folder, onOpenChange }: DeleteFolderDialogProps) {
    const { deleteFolder } = useBookmarkStore()

    const handleDelete = () => {
        if (folder) {
            deleteFolder(folder.id)
            onOpenChange(false)
        }
    }

    return (
        <AlertDialog open={folder !== null} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete folder "{folder?.name}"?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will delete the folder and all its subfolders.
                        Bookmarks in these folders will be moved to Uncategorized.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
