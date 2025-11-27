"use client"

import { useState } from "react"
import { usePasswordStore } from "@/store/password-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Copy, Eye, EyeOff, Trash2, ExternalLink, LayoutGrid, List, Lock, Pencil, MoreVertical } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { toast } from "sonner"
import { doc, deleteDoc } from "firebase/firestore"
import { db, auth } from "@/database/firebase"
import { clearKey } from "@/lib/key-storage"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { EditPasswordDialog } from "./edit-password-dialog"
import { PasswordEntry } from "@/store/password-store"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { calculatePasswordStrength, getStrengthColor, getFaviconUrl } from "@/lib/password-utils"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { ImportExportDialog } from "./import-export-dialog"
import { useIsMobile } from "@/components/hooks/use-mobile"

export function PasswordList() {
    const { passwords, deletePassword, lockVault, isLoading } = usePasswordStore()
    const [searchTerm, setSearchTerm] = useState("")
    const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set())
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [passwordToDelete, setPasswordToDelete] = useState<string | null>(null)
    const [editingPassword, setEditingPassword] = useState<PasswordEntry | null>(null)
    const isMobile = useIsMobile()

    // Force grid view on mobile
    if (isMobile && viewMode !== "grid") {
        setViewMode("grid")
    }

    const filteredPasswords = passwords.filter(p =>
        p.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    const toggleVisibility = (id: string) => {
        const newVisible = new Set(visiblePasswords)
        if (newVisible.has(id)) {
            newVisible.delete(id)
        } else {
            newVisible.add(id)
        }
        setVisiblePasswords(newVisible)
    }

    const copyToClipboard = (text: string, type: "Password" | "Username" = "Password") => {
        navigator.clipboard.writeText(text)
        toast.success(`${type} copied to clipboard`)
    }

    const handleDeleteClick = (id: string) => {
        setPasswordToDelete(id)
        setDeleteConfirmOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!auth.currentUser || !passwordToDelete) return

        try {
            await deleteDoc(doc(db, "user_passwords", auth.currentUser.uid, "entries", passwordToDelete))
            deletePassword(passwordToDelete)
            toast.success("Password deleted")
        } catch (error) {
            console.error("Error deleting password:", error)
            toast.error("Failed to delete password")
        } finally {
            setDeleteConfirmOpen(false)
            setPasswordToDelete(null)
        }
    }

    const handleLock = async () => {
        await clearKey()
        lockVault()
        toast.success("Vault locked")
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Loading your passwords...</p>
            </div>
        )
    }

    if (passwords.length === 0 && !searchTerm) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 border-2 border-dashed rounded-lg border-muted/50 bg-muted/10">
                <div className="p-4 bg-muted rounded-full">
                    <Lock className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Vault is Empty</h3>
                <p className="text-muted-foreground max-w-sm">
                    You haven't stored any passwords yet. Click the "Add Password" button above to get started.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search vault..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 h-10 bg-background/50 backdrop-blur-sm"
                    />
                </div>
                {!isMobile && (
                    <div className="flex items-center gap-2 border rounded-lg p-1 bg-muted/20">
                        <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as "grid" | "list")}>
                            <ToggleGroupItem value="grid" size="sm" aria-label="Grid view">
                                <LayoutGrid className="h-4 w-4" />
                            </ToggleGroupItem>
                            <ToggleGroupItem value="list" size="sm" aria-label="List view">
                                <List className="h-4 w-4" />
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                )}
                <ImportExportDialog />
                <Button variant="outline" size="icon" onClick={handleLock} title="Lock Vault" className="h-10 w-10">
                    <Lock className="h-4 w-4" />
                </Button>
            </div>

            {filteredPasswords.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    No passwords found matching "{searchTerm}"
                </div>
            ) : viewMode === "grid" ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredPasswords.map((entry) => (
                        <Card key={entry.id} className="group hover:shadow-xl transition-all duration-300 border-muted/60 hover:border-primary/20 bg-card/50 backdrop-blur-sm overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary/0 group-hover:bg-primary/50 transition-all duration-300" />
                            <CardHeader className="pb-3 relative">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary font-bold text-xl select-none shadow-sm group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                                            {entry.url && getFaviconUrl(entry.url) ? (
                                                <img
                                                    src={getFaviconUrl(entry.url)!}
                                                    alt={entry.service}
                                                    className="h-8 w-8 object-contain"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                                    }}
                                                />
                                            ) : null}
                                            <span className={cn(entry.url && getFaviconUrl(entry.url) ? "hidden" : "")}>
                                                {entry.service.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-bold truncate tracking-tight">{entry.service}</CardTitle>
                                            <div className="flex items-center gap-2 mt-1">
                                                <CardDescription className="truncate font-mono text-xs opacity-80 max-w-[150px]" title={entry.username}>
                                                    {entry.username}
                                                </CardDescription>
                                                <Button variant="ghost" size="icon" className="h-5 w-5 -ml-1 hover:bg-transparent hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(entry.username, "Username")} title="Copy Username">
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        {entry.url && (
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => window.open(entry.url, '_blank')} title="Open URL">
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setEditingPassword(entry)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleDeleteClick(entry.id)} className="text-destructive focus:text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-1">
                                    {entry.tags?.map(tag => (
                                        <Badge key={tag} variant="secondary" className="text-[10px] h-5 px-1.5 bg-muted/50 text-muted-foreground">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 bg-muted/40 p-2.5 rounded-lg border border-border/50 group-hover:border-primary/10 transition-colors">
                                    <div className="flex-1 font-mono text-sm truncate tracking-wider">
                                        {visiblePasswords.has(entry.id) ? entry.password : "••••••••••••"}
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-background hover:text-primary" onClick={() => toggleVisibility(entry.id)}>
                                            {visiblePasswords.has(entry.id) ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-background hover:text-primary" onClick={() => copyToClipboard(entry.password)}>
                                            <Copy className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full transition-all duration-300", getStrengthColor(calculatePasswordStrength(entry.password)))}
                                            style={{ width: `${(calculatePasswordStrength(entry.password) / 5) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">
                                        {formatDistanceToNow(entry.updatedAt, { addSuffix: true })}
                                    </span>
                                </div>
                                {entry.notes && (
                                    <div className="mt-3 text-xs text-muted-foreground line-clamp-2 bg-muted/20 p-2.5 rounded-lg border border-border/30 italic">
                                        {entry.notes}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="rounded-md border bg-card/50 backdrop-blur-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[250px]">Service</TableHead>
                                <TableHead className="w-[200px]">Username</TableHead>
                                <TableHead className="w-[250px]">Password</TableHead>
                                <TableHead>URL</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPasswords.map((entry) => (
                                <TableRow key={entry.id} className="group hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm select-none overflow-hidden">
                                                {entry.url && getFaviconUrl(entry.url) ? (
                                                    <img
                                                        src={getFaviconUrl(entry.url)!}
                                                        alt={entry.service}
                                                        className="h-5 w-5 object-contain"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                                        }}
                                                    />
                                                ) : null}
                                                <span className={cn(entry.url && getFaviconUrl(entry.url) ? "hidden" : "")}>
                                                    {entry.service.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="truncate font-medium">{entry.service}</span>
                                                {entry.tags && entry.tags.length > 0 && (
                                                    <div className="flex gap-1 mt-0.5">
                                                        {entry.tags.slice(0, 2).map(tag => (
                                                            <span key={tag} className="text-[10px] text-muted-foreground bg-muted px-1 rounded">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        <div className="flex items-center gap-2 group/username">
                                            {entry.username}
                                            <Button variant="ghost" size="icon" className="h-4 w-4 opacity-0 group-hover/username:opacity-100 transition-opacity" onClick={() => copyToClipboard(entry.username, "Username")}>
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 max-w-[200px]">
                                            <div className="font-mono text-sm truncate flex-1 bg-muted/30 px-2 py-1 rounded border border-border/50">
                                                {visiblePasswords.has(entry.id) ? entry.password : "••••••••••••"}
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-background shrink-0" onClick={() => toggleVisibility(entry.id)}>
                                                {visiblePasswords.has(entry.id) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-background shrink-0" onClick={() => copyToClipboard(entry.password)}>
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                            <div className={cn("w-1.5 h-1.5 rounded-full", getStrengthColor(calculatePasswordStrength(entry.password)))} title="Password Strength" />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {entry.url ? (
                                            <a href={entry.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate max-w-[150px] block">
                                                {entry.url.replace(/^https?:\/\//, '')}
                                            </a>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setEditingPassword(entry)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleDeleteClick(entry.id)} className="text-destructive focus:text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Password</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this password? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {editingPassword && (
                <EditPasswordDialog
                    entry={editingPassword}
                    open={!!editingPassword}
                    onOpenChange={(open) => !open && setEditingPassword(null)}
                />
            )}
        </div>
    )
}
