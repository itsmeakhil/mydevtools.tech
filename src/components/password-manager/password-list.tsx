"use client"

import { useState } from "react"
import { usePasswordStore } from "@/store/password-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Copy, Eye, EyeOff, Trash2, ExternalLink, LayoutGrid, List, Lock } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { toast } from "sonner"
import { doc, deleteDoc } from "firebase/firestore"
import { db, auth } from "@/database/firebase"

export function PasswordList() {
    const { passwords, deletePassword, lockVault } = usePasswordStore()
    const [searchTerm, setSearchTerm] = useState("")
    const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set())
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

    const filteredPasswords = passwords.filter(p =>
        p.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.username.toLowerCase().includes(searchTerm.toLowerCase())
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

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success("Password copied to clipboard")
    }

    const handleDelete = async (id: string) => {
        if (!auth.currentUser) return
        if (!confirm("Are you sure you want to delete this password?")) return

        try {
            await deleteDoc(doc(db, "user_settings", auth.currentUser.uid, "passwords", id))
            deletePassword(id)
            toast.success("Password deleted")
        } catch (error) {
            console.error("Error deleting password:", error)
            toast.error("Failed to delete password")
        }
    }

    const handleLock = () => {
        lockVault()
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
                        <Card key={entry.id} className="group hover:shadow-lg transition-all duration-300 border-muted/60 hover:border-primary/20 bg-card/50 backdrop-blur-sm">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg select-none">
                                        {entry.service.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        {entry.url && (
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(entry.url, '_blank')} title="Open URL">
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(entry.id)} title="Delete">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <CardTitle className="text-lg font-bold truncate">{entry.service}</CardTitle>
                                    <CardDescription className="truncate font-mono text-xs mt-1">{entry.username}</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-md border border-border/50 group-hover:border-primary/10 transition-colors">
                                    <div className="flex-1 font-mono text-sm truncate tracking-wider">
                                        {visiblePasswords.has(entry.id) ? entry.password : "••••••••••••"}
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-background" onClick={() => toggleVisibility(entry.id)}>
                                            {visiblePasswords.has(entry.id) ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-background" onClick={() => copyToClipboard(entry.password)}>
                                            <Copy className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                                {entry.notes && (
                                    <div className="mt-3 text-xs text-muted-foreground line-clamp-2 bg-muted/20 p-2 rounded border border-border/30">
                                        {entry.notes}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredPasswords.map((entry) => (
                        <Card key={entry.id} className="group hover:shadow-md transition-all duration-200 border-muted/60">
                            <CardContent className="p-3">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0 select-none">
                                        {entry.service.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                        <div>
                                            <h3 className="font-semibold truncate">{entry.service}</h3>
                                            <p className="text-xs text-muted-foreground truncate font-mono">{entry.username}</p>
                                        </div>

                                        <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-md border border-border/50 max-w-[200px]">
                                            <div className="font-mono text-sm truncate flex-1">
                                                {visiblePasswords.has(entry.id) ? entry.password : "••••••••••••"}
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-background shrink-0" onClick={() => toggleVisibility(entry.id)}>
                                                {visiblePasswords.has(entry.id) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-background shrink-0" onClick={() => copyToClipboard(entry.password)}>
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>

                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {entry.url && (
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(entry.url, '_blank')}>
                                                    <ExternalLink className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(entry.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
