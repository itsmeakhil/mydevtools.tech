"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Upload, Download, FileJson, AlertTriangle } from "lucide-react"
import { usePasswordStore, PasswordEntry } from "@/store/password-store"
import { toast } from "sonner"
import { auth, db } from "@/database/firebase"
import { collection, addDoc } from "firebase/firestore"
import { encryptData } from "@/lib/encryption"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ImportExportDialogProps {
    children?: React.ReactNode
}

export function ImportExportDialog({ children }: ImportExportDialogProps) {
    const { passwords, encryptionKey, addPassword } = usePasswordStore()
    const [open, setOpen] = useState(false)
    const [importData, setImportData] = useState("")
    const [loading, setLoading] = useState(false)

    const handleExport = () => {
        try {
            const exportData = JSON.stringify(passwords.map(p => ({
                service: p.service,
                username: p.username,
                password: p.password,
                url: p.url,
                notes: p.notes,
                tags: p.tags
            })), null, 2)

            const blob = new Blob([exportData], { type: "application/json" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `password-vault-export-${new Date().toISOString().split('T')[0]}.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
            toast.success("Vault exported successfully")
        } catch (error) {
            console.error("Export failed:", error)
            toast.error("Failed to export vault")
        }
    }

    const handleImport = async () => {
        if (!importData.trim()) return
        if (!encryptionKey || !auth.currentUser) return

        setLoading(true)
        try {
            const parsed = JSON.parse(importData)
            if (!Array.isArray(parsed)) throw new Error("Invalid format: expected an array")

            let successCount = 0

            for (const item of parsed) {
                if (!item.service || !item.username || !item.password) continue

                const timestamp = Date.now()
                const entryData = {
                    service: item.service,
                    username: item.username,
                    password: item.password,
                    url: item.url || "",
                    notes: item.notes || "",
                    tags: item.tags || []
                }

                const dataToEncrypt = JSON.stringify(entryData)
                const { encrypted, iv } = await encryptData(encryptionKey, dataToEncrypt)

                const docRef = await addDoc(collection(db, "user_passwords", auth.currentUser.uid, "entries"), {
                    encryptedData: encrypted,
                    iv,
                    createdAt: timestamp,
                    updatedAt: timestamp
                })

                const newEntry: PasswordEntry = {
                    id: docRef.id,
                    ...entryData,
                    createdAt: timestamp,
                    updatedAt: timestamp
                }

                addPassword(newEntry)
                successCount++
            }

            toast.success(`Successfully imported ${successCount} passwords`)
            setOpen(false)
            setImportData("")
        } catch (error) {
            console.error("Import failed:", error)
            toast.error("Failed to import: Invalid JSON format")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="outline" className="gap-2">
                        <FileJson className="h-4 w-4" /> Import / Export
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Import / Export Vault</DialogTitle>
                    <DialogDescription>
                        Manage your password data. You can export your vault to JSON or import from a JSON file.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="export" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="export">Export</TabsTrigger>
                        <TabsTrigger value="import">Import</TabsTrigger>
                    </TabsList>

                    <TabsContent value="export" className="space-y-4 py-4">
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Warning</AlertTitle>
                            <AlertDescription>
                                Exported files contain your passwords in PLAIN TEXT. Keep this file safe and delete it after use.
                            </AlertDescription>
                        </Alert>

                        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg bg-muted/10">
                            <FileJson className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-sm text-muted-foreground text-center mb-6 max-w-xs">
                                Download your entire vault as a JSON file. This includes all services, usernames, passwords, and notes.
                            </p>
                            <Button onClick={handleExport} className="w-full max-w-xs">
                                <Download className="mr-2 h-4 w-4" /> Download JSON Export
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="import" className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Paste JSON Data</Label>
                            <Textarea
                                placeholder='[{"service": "Example", "username": "user", "password": "123", ...}]'
                                className="h-[200px] font-mono text-xs"
                                value={importData}
                                onChange={(e) => setImportData(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Paste the content of a previously exported JSON file here.
                            </p>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleImport} disabled={loading || !importData}>
                                {loading ? "Importing..." : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" /> Import Passwords
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
