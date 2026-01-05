"use client"

import { useState, useCallback, useRef } from "react"
import {
    IconUpload,
    IconFileImport,
    IconBrandChrome,
    IconBrandFirefox,
    IconBrandSafari,
    IconBrandEdge,
    IconCheck,
    IconAlertCircle,
    IconLoader2
} from "@tabler/icons-react"
import { useBookmarkStore } from "@/store/bookmark-store"
import { parseBookmarkHTML, parseBookmarkJSON } from "@/lib/bookmark-parser"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

type ImportMode = 'merge' | 'replace'

interface ImportPreview {
    bookmarkCount: number
    folderCount: number
}

export default function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
    const { importBookmarks, clearAll } = useBookmarkStore()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [isDragging, setIsDragging] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [importMode, setImportMode] = useState<ImportMode>('merge')
    const [preview, setPreview] = useState<ImportPreview | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isImporting, setIsImporting] = useState(false)

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const processFile = useCallback(async (file: File) => {
        setError(null)
        setSelectedFile(file)

        try {
            const content = await file.text()
            let result

            if (file.name.endsWith('.json')) {
                result = parseBookmarkJSON(content)
            } else {
                result = parseBookmarkHTML(content)
            }

            setPreview({
                bookmarkCount: result.bookmarks.length,
                folderCount: result.folders.length
            })
        } catch (err) {
            setError("Failed to parse bookmark file. Please make sure it's a valid bookmark export.")
            setPreview(null)
        }
    }, [])

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const file = e.dataTransfer.files[0]
        if (file) {
            await processFile(file)
        }
    }, [processFile])

    const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            await processFile(file)
        }
    }, [processFile])

    const handleImport = useCallback(async () => {
        if (!selectedFile) return

        setIsImporting(true)
        try {
            const content = await selectedFile.text()
            let result

            if (selectedFile.name.endsWith('.json')) {
                result = parseBookmarkJSON(content)
            } else {
                result = parseBookmarkHTML(content)
            }

            if (importMode === 'replace') {
                clearAll()
            }

            importBookmarks(result.bookmarks, result.folders)
            toast.success(`Imported ${result.bookmarks.length} bookmarks and ${result.folders.length} folders`)
            onOpenChange(false)
            resetState()
        } catch (err) {
            toast.error("Failed to import bookmarks")
        } finally {
            setIsImporting(false)
        }
    }, [selectedFile, importMode, clearAll, importBookmarks, onOpenChange])

    const resetState = useCallback(() => {
        setSelectedFile(null)
        setPreview(null)
        setError(null)
        setImportMode('merge')
    }, [])

    const handleClose = useCallback((open: boolean) => {
        if (!open) {
            resetState()
        }
        onOpenChange(open)
    }, [onOpenChange, resetState])

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>Import Bookmarks</DialogTitle>
                    <DialogDescription>
                        Import bookmarks from your browser's exported file.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Browser Export Instructions */}
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { icon: IconBrandChrome, name: 'Chrome', instruction: 'Menu → Bookmarks → Bookmark Manager → ⋮ → Export Bookmarks' },
                            { icon: IconBrandFirefox, name: 'Firefox', instruction: 'Menu → Bookmarks → Manage Bookmarks → Import and Backup → Export' },
                            { icon: IconBrandSafari, name: 'Safari', instruction: 'File → Export Bookmarks...' },
                            { icon: IconBrandEdge, name: 'Edge', instruction: 'Menu → Favorites → ⋯ → Export Favorites' },
                        ].map((browser) => (
                            <div
                                key={browser.name}
                                className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted/50 cursor-help transition-colors"
                                title={browser.instruction}
                            >
                                <browser.icon className="h-5 w-5 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{browser.name}</span>
                            </div>
                        ))}
                    </div>

                    {/* Drop Zone */}
                    <div
                        className={cn(
                            "border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer",
                            isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                            selectedFile && "border-green-500 bg-green-500/5"
                        )}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".html,.htm,.json"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        {selectedFile ? (
                            <div className="flex flex-col items-center gap-2">
                                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <IconCheck className="h-6 w-6 text-green-500" />
                                </div>
                                <p className="font-medium">{selectedFile.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    Click to select a different file
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                    <IconFileImport className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <p className="font-medium">Drop your bookmark file here</p>
                                <p className="text-sm text-muted-foreground">
                                    or click to browse (HTML or JSON)
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Error */}
                    {error && (
                        <Alert variant="destructive">
                            <IconAlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Preview */}
                    {preview && (
                        <div className="p-4 rounded-lg bg-muted/30 border">
                            <h4 className="font-medium mb-2">Import Preview</h4>
                            <div className="flex gap-4 text-sm">
                                <span>{preview.bookmarkCount} bookmarks</span>
                                <span>{preview.folderCount} folders</span>
                            </div>
                        </div>
                    )}

                    {/* Import Mode */}
                    {preview && (
                        <div className="space-y-2">
                            <Label>Import Mode</Label>
                            <RadioGroup value={importMode} onValueChange={(v) => setImportMode(v as ImportMode)}>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="merge" id="merge" />
                                    <Label htmlFor="merge" className="font-normal cursor-pointer">
                                        Merge with existing bookmarks
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="replace" id="replace" />
                                    <Label htmlFor="replace" className="font-normal cursor-pointer text-destructive">
                                        Replace all existing bookmarks
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => handleClose(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleImport}
                        disabled={!preview || isImporting}
                    >
                        {isImporting && <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Import {preview ? `${preview.bookmarkCount} Bookmarks` : ''}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
