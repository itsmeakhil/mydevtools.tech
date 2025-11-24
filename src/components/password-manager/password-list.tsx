
"use client"

import { useEffect, useState } from "react"
import { usePasswordStore, PasswordEntry } from "@/store/password-store"
import { decryptData } from "@/lib/encryption"
import { auth, db } from "@/database/firebase"
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Trash2, Eye, EyeOff, Search, ExternalLink, LayoutGrid, List } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export function PasswordList() {
    const { encryptionKey, passwords, setPasswords, deletePassword, isLoading, setLoading } = usePasswordStore()
    const [searchTerm, setSearchTerm] = useState("")
    const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set())
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

    useEffect(() => {
        const fetchPasswords = async () => {
            if (!encryptionKey || !auth.currentUser || passwords.length > 0) return

            setLoading(true)
            try {
                const querySnapshot = await getDocs(collection(db, "user_passwords", auth.currentUser.uid, "entries"))
                const decryptedPasswords: PasswordEntry[] = []

                for (const doc of querySnapshot.docs) {
                    const data = doc.data()
                    try {
                        const decryptedJson = await decryptData(encryptionKey, data.encryptedData, data.iv)
                        const decryptedData = JSON.parse(decryptedJson)

                        decryptedPasswords.push({
                            id: doc.id,
                            ...decryptedData,
                            createdAt: data.createdAt,
                            updatedAt: data.updatedAt
                        })
                    } catch (err) {
                        console.error(`Failed to decrypt password ${doc.id}:`, err)
                        // Maybe add a "corrupted" entry?
                    }
                }

                // Sort by service name
                decryptedPasswords.sort((a, b) => a.service.localeCompare(b.service))
                setPasswords(decryptedPasswords)
            } catch (err) {
                console.error("Error fetching passwords:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchPasswords()
    }, [encryptionKey, passwords.length, setPasswords, setLoading])

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this password?")) return
        if (!auth.currentUser) return

        try {
            await deleteDoc(doc(db, "user_passwords", auth.currentUser.uid, "entries", id))
            deletePassword(id)
            toast.success("Password deleted")
        } catch (err) {
            console.error("Failed to delete password:", err)
            toast.error("Failed to delete password")
        }
    }

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
        toast.success("Copied to clipboard")
    }

    const filteredPasswords = passwords.filter(p =>
        p.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.username.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (isLoading && passwords.length === 0) {
        return <div className="text-center py-8">Decrypting your vault...</div>
    }

    if (passwords.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <h3 className="text-lg font-semibold">Your vault is empty</h3>
                <p className="text-muted-foreground">Add your first password to get started.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search passwords..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as "grid" | "list")}>
                    <ToggleGroupItem value="grid" aria-label="Grid view">
                        <LayoutGrid className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="list" aria-label="List view">
                        <List className="h-4 w-4" />
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>

            {viewMode === "grid" ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredPasswords.map((entry) => (
                        <Card key={entry.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg font-bold truncate">{entry.service}</CardTitle>
                                    <div className="flex gap-1">
                                        {entry.url && (
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(entry.url, '_blank')}>
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(entry.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <CardDescription className="truncate">{entry.username}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
                                    <div className="flex-1 font-mono text-sm truncate">
                                        {visiblePasswords.has(entry.id) ? entry.password : "••••••••••••"}
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleVisibility(entry.id)}>
                                        {visiblePasswords.has(entry.id) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(entry.password)}>
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                                {entry.notes && (
                                    <div className="mt-2 text-xs text-muted-foreground truncate">
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
                        <Card key={entry.id} className="hover:shadow-sm transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold truncate">{entry.service}</h3>
                                            {entry.url && (
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => window.open(entry.url, '_blank')}>
                                                    <ExternalLink className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate">{entry.username}</p>
                                        {entry.notes && (
                                            <p className="text-xs text-muted-foreground mt-1 truncate">{entry.notes}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 bg-muted/50 px-3 py-1.5 rounded-md">
                                            <div className="font-mono text-sm">
                                                {visiblePasswords.has(entry.id) ? entry.password : "••••••••••••"}
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleVisibility(entry.id)}>
                                                {visiblePasswords.has(entry.id) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                            </Button>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(entry.password)}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(entry.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
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
