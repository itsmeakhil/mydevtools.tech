"use client"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    IconSearch,
    IconPlus,
    IconLayoutGrid,
    IconList,
    IconUpload,
    IconDownload,
    IconFolderPlus,
    IconX
} from "@tabler/icons-react"
import { useBookmarkStore, useFilteredBookmarks, useAllTags } from "@/store/bookmark-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useIsMobile } from "@/components/hooks/use-mobile"
import FolderTree from "./folder-tree"
import BookmarkGrid from "./bookmark-grid"
import AddBookmarkDialog from "./add-bookmark-dialog"
import ImportDialog from "./import-dialog"
import AddFolderDialog from "./add-folder-dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { exportBookmarksToHTML, exportBookmarksToJSON } from "@/lib/bookmark-parser"

export default function BookmarksManager() {
    const isMobile = useIsMobile()
    const [showSidebar, setShowSidebar] = useState(!isMobile)
    const [isAddBookmarkOpen, setIsAddBookmarkOpen] = useState(false)
    const [isImportOpen, setIsImportOpen] = useState(false)
    const [isAddFolderOpen, setIsAddFolderOpen] = useState(false)
    const [editingBookmark, setEditingBookmark] = useState<string | null>(null)

    const {
        searchQuery,
        setSearchQuery,
        viewMode,
        setViewMode,
        bookmarks,
        folders,
        selectedFolderId,
        setSelectedFolder
    } = useBookmarkStore()

    const filteredBookmarks = useFilteredBookmarks()
    const allTags = useAllTags()

    const handleExportHTML = useCallback(() => {
        const html = exportBookmarksToHTML(bookmarks, folders)
        const blob = new Blob([html], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'bookmarks.html'
        a.click()
        URL.revokeObjectURL(url)
    }, [bookmarks, folders])

    const handleExportJSON = useCallback(() => {
        const json = exportBookmarksToJSON(bookmarks, folders)
        const blob = new Blob([json], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'bookmarks.json'
        a.click()
        URL.revokeObjectURL(url)
    }, [bookmarks, folders])

    const handleEditBookmark = useCallback((id: string) => {
        setEditingBookmark(id)
        setIsAddBookmarkOpen(true)
    }, [])

    const handleCloseAddBookmark = useCallback(() => {
        setIsAddBookmarkOpen(false)
        setEditingBookmark(null)
    }, [])

    const selectedFolderName = selectedFolderId === null
        ? 'All Bookmarks'
        : selectedFolderId === 'uncategorized'
            ? 'Uncategorized'
            : folders.find(f => f.id === selectedFolderId)?.name || 'Unknown'

    return (
        <div className="flex h-full w-full overflow-hidden bg-background">
            {/* Sidebar */}
            <AnimatePresence mode="wait">
                {(showSidebar || !isMobile) && (
                    <motion.div
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className={`
                            ${isMobile ? 'absolute inset-y-0 left-0 z-50' : 'relative'}
                            w-64 border-r border-border/50 bg-background/80 backdrop-blur-xl
                            flex flex-col
                        `}
                    >
                        {/* Sidebar Header */}
                        <div className="p-4 flex items-center justify-between border-b border-border/50">
                            <h2 className="font-semibold text-lg">Folders</h2>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setIsAddFolderOpen(true)}
                                >
                                    <IconFolderPlus className="h-4 w-4" />
                                </Button>
                                {isMobile && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => setShowSidebar(false)}
                                    >
                                        <IconX className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Folder Tree */}
                        <ScrollArea className="flex-1 p-2">
                            <FolderTree
                                onSelectFolder={(id) => {
                                    setSelectedFolder(id)
                                    if (isMobile) setShowSidebar(false)
                                }}
                            />
                        </ScrollArea>

                        {/* Tags Section */}
                        {allTags.length > 0 && (
                            <>
                                <Separator />
                                <div className="p-4">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Tags</h3>
                                    <div className="flex flex-wrap gap-1">
                                        {allTags.slice(0, 10).map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => setSearchQuery(`#${tag}`)}
                                                className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                            >
                                                #{tag}
                                            </button>
                                        ))}
                                        {allTags.length > 10 && (
                                            <span className="text-xs text-muted-foreground">
                                                +{allTags.length - 10} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile sidebar overlay */}
            {isMobile && showSidebar && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 z-40"
                    onClick={() => setShowSidebar(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row gap-3">
                    {/* Left side - Search and mobile menu */}
                    <div className="flex items-center gap-2 flex-1">
                        {isMobile && (
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setShowSidebar(true)}
                            >
                                <IconList className="h-4 w-4" />
                            </Button>
                        )}
                        <div className="relative flex-1 max-w-md">
                            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search bookmarks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 bg-background/50"
                            />
                            {searchQuery && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                                    onClick={() => setSearchQuery('')}
                                >
                                    <IconX className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Right side - Actions */}
                    <div className="flex items-center gap-2">
                        {/* View Toggle */}
                        <div className="flex items-center border rounded-lg overflow-hidden">
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                size="icon"
                                className="h-9 w-9 rounded-none"
                                onClick={() => setViewMode('grid')}
                            >
                                <IconLayoutGrid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'ghost'}
                                size="icon"
                                className="h-9 w-9 rounded-none"
                                onClick={() => setViewMode('list')}
                            >
                                <IconList className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Import */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsImportOpen(true)}
                        >
                            <IconUpload className="h-4 w-4 mr-2" />
                            Import
                        </Button>

                        {/* Export */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <IconDownload className="h-4 w-4 mr-2" />
                                    Export
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleExportHTML}>
                                    Export as HTML
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleExportJSON}>
                                    Export as JSON
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Add Bookmark */}
                        <Button onClick={() => setIsAddBookmarkOpen(true)}>
                            <IconPlus className="h-4 w-4 mr-2" />
                            Add Bookmark
                        </Button>
                    </div>
                </div>

                {/* Content Header */}
                <div className="px-4 pt-4 pb-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-semibold">{selectedFolderName}</h1>
                            <p className="text-sm text-muted-foreground">
                                {filteredBookmarks.length} bookmark{filteredBookmarks.length !== 1 ? 's' : ''}
                                {searchQuery && ` matching "${searchQuery}"`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bookmarks Grid/List */}
                <ScrollArea className="flex-1 p-4">
                    <BookmarkGrid
                        bookmarks={filteredBookmarks}
                        viewMode={viewMode}
                        onEdit={handleEditBookmark}
                    />
                </ScrollArea>
            </div>

            {/* Dialogs */}
            <AddBookmarkDialog
                open={isAddBookmarkOpen}
                onOpenChange={handleCloseAddBookmark}
                editingId={editingBookmark}
            />
            <ImportDialog
                open={isImportOpen}
                onOpenChange={setIsImportOpen}
            />
            <AddFolderDialog
                open={isAddFolderOpen}
                onOpenChange={setIsAddFolderOpen}
            />
        </div>
    )
}
