"use client"

import { useState, useCallback, useEffect } from "react"
import { IconFolder } from "@tabler/icons-react"
import { useBookmarkStore, BookmarkFolder } from "@/store/bookmark-store"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface EditFolderDialogProps {
    folder: BookmarkFolder | null
    onOpenChange: (open: boolean) => void
}

export default function EditFolderDialog({ folder, onOpenChange }: EditFolderDialogProps) {
    const { updateFolder } = useBookmarkStore()

    const [name, setName] = useState("")

    useEffect(() => {
        if (folder) {
            setName(folder.name)
        }
    }, [folder])

    const handleSubmit = useCallback(() => {
        if (!folder) return

        if (!name.trim()) {
            toast.error("Please enter a folder name")
            return
        }

        updateFolder({
            ...folder,
            name: name.trim()
        })

        toast.success("Folder renamed")
        onOpenChange(false)
    }, [folder, name, updateFolder, onOpenChange])

    return (
        <Dialog open={folder !== null} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Rename Folder</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="editFolderName">Folder Name</Label>
                        <div className="relative">
                            <IconFolder className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="editFolderName"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                placeholder="Folder name"
                                className="pl-9"
                                autoFocus
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
