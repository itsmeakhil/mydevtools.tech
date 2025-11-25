"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Wand2, RefreshCw, Check, Copy, ChevronDown, ChevronUp } from "lucide-react"
import { usePasswordStore, PasswordEntry } from "@/store/password-store"
import { AdvancedGenerator } from "./advanced-generator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { encryptData } from "@/lib/encryption"
import { auth, db } from "@/database/firebase"
import { collection, addDoc } from "firebase/firestore"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function AddPasswordDialog() {
    const { encryptionKey, addPassword } = usePasswordStore()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        service: "",
        username: "",
        password: "",
        url: "",
        notes: "",
        tags: [] as string[]
    })
    const [tagInput, setTagInput] = useState("")
    const [showGenerator, setShowGenerator] = useState(false)
    const [strength, setStrength] = useState(0)

    useEffect(() => {
        calculateStrength(formData.password)
    }, [formData.password])

    const calculateStrength = (pass: string) => {
        if (!pass) {
            setStrength(0)
            return
        }
        let score = 0
        if (pass.length >= 8) score += 1
        if (pass.length >= 12) score += 1
        if (/[A-Z]/.test(pass)) score += 1
        if (/[0-9]/.test(pass)) score += 1
        if (/[^A-Za-z0-9]/.test(pass)) score += 1
        setStrength(score)
    }

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            const tag = tagInput.trim()
            if (tag && !formData.tags.includes(tag)) {
                setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }))
            }
            setTagInput("")
        }
    }

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!encryptionKey || !auth.currentUser) return

        setLoading(true)
        try {
            const dataToEncrypt = JSON.stringify(formData)
            const { encrypted, iv } = await encryptData(encryptionKey, dataToEncrypt)

            const timestamp = Date.now()

            const docRef = await addDoc(collection(db, "user_passwords", auth.currentUser.uid, "entries"), {
                encryptedData: encrypted,
                iv,
                createdAt: timestamp,
                updatedAt: timestamp
            })

            const newEntry: PasswordEntry = {
                id: docRef.id,
                ...formData,
                createdAt: timestamp,
                updatedAt: timestamp
            }

            addPassword(newEntry)
            setOpen(false)
            setFormData({ service: "", username: "", password: "", url: "", notes: "", tags: [] })
            setTagInput("")
            setShowGenerator(false)
            toast.success("Password saved successfully")
        } catch (error) {
            console.error("Failed to add password:", error)
            toast.error("Failed to save password")
        } finally {
            setLoading(false)
        }
    }

    const getStrengthColor = (score: number) => {
        if (score === 0) return "bg-muted"
        if (score <= 2) return "bg-red-500"
        if (score <= 3) return "bg-yellow-500"
        return "bg-green-500"
    }

    const getStrengthLabel = (score: number) => {
        if (score === 0) return ""
        if (score <= 2) return "Weak"
        if (score <= 3) return "Medium"
        return "Strong"
    }

    const handlePasswordChange = useCallback((pass: string) => {
        setFormData(prev => ({ ...prev, password: pass }))
    }, [])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="shadow-lg hover:shadow-xl transition-all">
                    <Plus className="mr-2 h-4 w-4" /> Add Password
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-xl">Add New Password</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-5 mt-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="service">Service Name</Label>
                            <Input
                                id="service"
                                placeholder="e.g. Netflix"
                                value={formData.service}
                                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                                required
                                autoFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="username">Username / Email</Label>
                            <Input
                                id="username"
                                placeholder="user@example.com"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type="text"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                className="font-mono"
                                placeholder="Enter or generate password"
                            />
                        </div>

                        {formData.password && (
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">Strength</span>
                                    <span className={cn("font-medium",
                                        strength <= 2 ? "text-red-500" :
                                            strength <= 3 ? "text-yellow-500" : "text-green-500"
                                    )}>
                                        {getStrengthLabel(strength)}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={cn("h-full transition-all duration-300", getStrengthColor(strength))}
                                        style={{ width: `${(strength / 5) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        <Collapsible open={showGenerator} onOpenChange={setShowGenerator} className="border rounded-lg p-2 bg-muted/30">
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="w-full flex justify-between items-center text-xs text-muted-foreground hover:text-primary">
                                    <span className="flex items-center gap-2"><Wand2 className="h-3 w-3" /> Advanced Generator</span>
                                    {showGenerator ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pt-2">
                                <AdvancedGenerator
                                    showInput={false}
                                    onPasswordChange={handlePasswordChange}
                                    className="p-2 bg-background rounded-md border shadow-sm"
                                />
                            </CollapsibleContent>
                        </Collapsible>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="url">Website URL (Optional)</Label>
                        <Input
                            id="url"
                            type="url"
                            placeholder="https://..."
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Additional details..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="min-h-[80px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags</Label>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                            {formData.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                                    {tag}
                                    <span className="cursor-pointer hover:text-destructive" onClick={() => removeTag(tag)}>×</span>
                                </Badge>
                            ))}
                        </div>
                        <Input
                            id="tags"
                            placeholder="Add tags (press Enter or comma)"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleAddTag}
                        />
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save Password"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
