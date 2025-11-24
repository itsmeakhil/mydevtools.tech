
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Wand2 } from "lucide-react"
import { usePasswordStore, PasswordEntry } from "@/store/password-store"
import { encryptData } from "@/lib/encryption"
import { auth, db } from "@/database/firebase"
import { collection, addDoc } from "firebase/firestore"

export function AddPasswordDialog() {
    const { encryptionKey, addPassword } = usePasswordStore()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        service: "",
        username: "",
        password: "",
        url: "",
        notes: ""
    })

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
            // Encrypt the whole payload as a JSON string
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
            setFormData({ service: "", username: "", password: "", url: "", notes: "" })
        } catch (error) {
            console.error("Failed to add password:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Password
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Password</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="service">Service / Website</Label>
                        <Input
                            id="service"
                            placeholder="e.g. Google, Netflix"
                            value={formData.service}
                            onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                            required
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
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="flex gap-2">
                            <Input
                                id="password"
                                type="text" // Show password by default when adding? Or toggle? Let's keep it text for visibility during creation or password type.
                                // Actually, usually you want to see what you type when creating.
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                            <Button type="button" variant="outline" size="icon" onClick={generatePassword} title="Generate Password">
                                <Wand2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="url">URL (Optional)</Label>
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
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Encrypting & Saving..." : "Save Password"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
