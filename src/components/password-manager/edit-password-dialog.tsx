"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RefreshCw } from "lucide-react"
import { usePasswordStore, PasswordEntry } from "@/store/password-store"
import { encryptData } from "@/lib/encryption"
import { auth, db } from "@/database/firebase"
import { doc, updateDoc } from "firebase/firestore"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface EditPasswordDialogProps {
    entry: PasswordEntry
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditPasswordDialog({ entry, open, onOpenChange }: EditPasswordDialogProps) {
    const { encryptionKey, updatePassword } = usePasswordStore()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        service: entry.service,
        username: entry.username,
        password: entry.password,
        url: entry.url || "",
        notes: entry.notes || ""
    })
    const [strength, setStrength] = useState(0)

    useEffect(() => {
        setFormData({
            service: entry.service,
            username: entry.username,
            password: entry.password,
            url: entry.url || "",
            notes: entry.notes || ""
        })
    }, [entry])

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

    const generatePassword = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+"
        let pass = ""
        for (let i = 0; i < 16; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        setFormData(prev => ({ ...prev, password: pass }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!encryptionKey || !auth.currentUser) return

        setLoading(true)
        try {
            const dataToEncrypt = JSON.stringify(formData)
            const { encrypted, iv } = await encryptData(encryptionKey, dataToEncrypt)

            const timestamp = Date.now()

            await updateDoc(doc(db, "user_passwords", auth.currentUser.uid, "entries", entry.id), {
                encryptedData: encrypted,
                iv,
                updatedAt: timestamp
            })

            const updatedEntry: PasswordEntry = {
                id: entry.id,
                ...formData,
                createdAt: entry.createdAt,
                updatedAt: timestamp
            }

            updatePassword(updatedEntry)
            onOpenChange(false)
            toast.success("Password updated successfully")
        } catch (error) {
            console.error("Failed to update password:", error)
            toast.error("Failed to update password")
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-xl">Edit Password</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-5 mt-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-service">Service Name</Label>
                            <Input
                                id="edit-service"
                                placeholder="e.g. Netflix"
                                value={formData.service}
                                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                                required
                                autoFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-username">Username / Email</Label>
                            <Input
                                id="edit-username"
                                placeholder="user@example.com"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-password">Password</Label>
                        <div className="relative">
                            <Input
                                id="edit-password"
                                type="text"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                className="pr-10 font-mono"
                                placeholder="Enter or generate password"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                onClick={generatePassword}
                                title="Generate Strong Password"
                            >
                                <RefreshCw className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                            </Button>
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
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-url">Website URL (Optional)</Label>
                        <Input
                            id="edit-url"
                            type="url"
                            placeholder="https://..."
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-notes">Notes (Optional)</Label>
                        <Textarea
                            id="edit-notes"
                            placeholder="Additional details..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="min-h-[80px]"
                        />
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Updating..." : "Update Password"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
