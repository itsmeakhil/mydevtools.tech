"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import {
    IconExternalLink,
    IconCopy,
    IconEdit,
    IconTrash,
    IconDotsVertical,
    IconTag,
    IconFolder
} from "@tabler/icons-react"
import { Bookmark, useBookmarkStore, useFolderById } from "@/store/bookmark-store"
import { getFaviconUrl, getDomainFromUrl } from "@/lib/favicon-utils"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { toast } from "sonner"

interface BookmarkCardProps {
    bookmark: Bookmark
    viewMode: 'grid' | 'list'
    onEdit: (id: string) => void
    index: number
}

export default function BookmarkCard({ bookmark, viewMode, onEdit, index }: BookmarkCardProps) {
    const { deleteBookmark, folders } = useBookmarkStore()
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [imageError, setImageError] = useState(false)

    const folder = folders.find(f => f.id === bookmark.folderId)
    const faviconUrl = bookmark.favicon || getFaviconUrl(bookmark.url)
    const domain = getDomainFromUrl(bookmark.url)

    const handleOpenLink = useCallback(() => {
        window.open(bookmark.url, '_blank', 'noopener,noreferrer')
    }, [bookmark.url])

    const handleCopyUrl = useCallback(() => {
        navigator.clipboard.writeText(bookmark.url)
        toast.success('URL copied to clipboard')
    }, [bookmark.url])

    const handleDelete = useCallback(() => {
        deleteBookmark(bookmark.id)
        setDeleteConfirmOpen(false)
        toast.success('Bookmark deleted')
    }, [bookmark.id, deleteBookmark])

    if (viewMode === 'list') {
        return (
            <>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className={cn(
                        "group flex items-center gap-4 p-3 rounded-lg border border-border/50",
                        "hover:border-primary/30 hover:bg-muted/30 transition-all cursor-pointer"
                    )}
                    onClick={handleOpenLink}
                >
                    {/* Favicon */}
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                        {!imageError ? (
                            <img
                                src={faviconUrl}
                                alt=""
                                className="h-5 w-5"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <span className="text-xs font-bold text-muted-foreground">
                                {bookmark.title.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate text-sm">{bookmark.title}</h3>
                        <p className="text-xs text-muted-foreground truncate">{domain}</p>
                    </div>

                    {/* Tags */}
                    <div className="hidden sm:flex items-center gap-1">
                        {bookmark.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                            </Badge>
                        ))}
                        {bookmark.tags.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                                +{bookmark.tags.length - 2}
                            </span>
                        )}
                    </div>

                    {/* Folder */}
                    {folder && (
                        <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
                            <IconFolder className="h-3 w-3" />
                            <span className="truncate max-w-[100px]">{folder.name}</span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => { e.stopPropagation(); handleCopyUrl() }}
                        >
                            <IconCopy className="h-3.5 w-3.5" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <IconDotsVertical className="h-3.5 w-3.5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEdit(bookmark.id)}>
                                    <IconEdit className="h-4 w-4 mr-2" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => setDeleteConfirmOpen(true)}
                                >
                                    <IconTrash className="h-4 w-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </motion.div>

                <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete bookmark?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete "{bookmark.title}".
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
            </>
        )
    }

    // Grid View
    return (
        <>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className={cn(
                    "group relative flex flex-col p-3 sm:p-4 rounded-xl border border-border/50",
                    "bg-gradient-to-br from-background to-muted/20",
                    "hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5",
                    "transition-all duration-200 cursor-pointer"
                )}
                onClick={handleOpenLink}
            >
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                    {/* Favicon */}
                    <div className="h-10 w-10 rounded-xl bg-muted/80 flex items-center justify-center overflow-hidden shrink-0 ring-1 ring-border/50">
                        {!imageError ? (
                            <img
                                src={faviconUrl}
                                alt=""
                                className="h-6 w-6"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <span className="text-sm font-bold text-muted-foreground">
                                {bookmark.title.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>

                    {/* Title & Domain */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate text-sm leading-tight">
                            {bookmark.title}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {domain}
                        </p>
                    </div>

                    {/* Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                            >
                                <IconDotsVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleCopyUrl}>
                                <IconCopy className="h-4 w-4 mr-2" />
                                Copy URL
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(bookmark.id)}>
                                <IconEdit className="h-4 w-4 mr-2" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteConfirmOpen(true)}
                            >
                                <IconTrash className="h-4 w-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Description */}
                {bookmark.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {bookmark.description}
                    </p>
                )}

                {/* Tags */}
                {bookmark.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-auto">
                        {bookmark.tags.slice(0, 3).map(tag => (
                            <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs px-1.5 py-0"
                            >
                                {tag}
                            </Badge>
                        ))}
                        {bookmark.tags.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                                +{bookmark.tags.length - 3}
                            </span>
                        )}
                    </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </motion.div>

            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete bookmark?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete "{bookmark.title}".
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
        </>
    )
}
