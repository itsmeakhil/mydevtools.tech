"use client"

import { Bookmark } from "@/store/bookmark-store"
import BookmarkCard from "./bookmark-card"
import { motion } from "framer-motion"
import { IconBookmarkOff } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

interface BookmarkGridProps {
    bookmarks: Bookmark[]
    viewMode: 'grid' | 'list'
    onEdit: (id: string) => void
}

export default function BookmarkGrid({ bookmarks, viewMode, onEdit }: BookmarkGridProps) {
    if (bookmarks.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center"
            >
                <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <IconBookmarkOff className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-1">No bookmarks yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                    Add your first bookmark or import from your browser to get started.
                </p>
            </motion.div>
        )
    }

    return (
        <div
            className={cn(
                viewMode === 'grid'
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    : "flex flex-col gap-2"
            )}
        >
            {bookmarks.map((bookmark, index) => (
                <BookmarkCard
                    key={bookmark.id}
                    bookmark={bookmark}
                    viewMode={viewMode}
                    onEdit={onEdit}
                    index={index}
                />
            ))}
        </div>
    )
}
