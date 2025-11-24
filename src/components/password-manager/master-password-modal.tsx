
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, KeyRound, AlertTriangle } from "lucide-react"
import { usePasswordStore } from "@/store/password-store"
import { deriveKey, generateSalt, createKeyVerifier, verifyKey } from "@/lib/encryption"
import { auth, db } from "@/database/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"

export function MasterPasswordModal() {
    const { isUnlocked, setKey } = usePasswordStore()
    const [isOpen, setIsOpen] = useState(true)
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [mode, setMode] = useState<"loading" | "setup" | "unlock">("loading")
    const [vaultSalt, setVaultSalt] = useState<string | null>(null)
    const [verifier, setVerifier] = useState<{ encrypted: string; iv: string } | null>(null)
    const [userId, setUserId] = useState<string | null>(null)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid)
                await checkVaultStatus(user.uid)
            } else {
                setUserId(null)
                setMode("loading")
            }
        })
        return () => unsubscribe()
    }, [])

    useEffect(() => {
        // Keep dialog open if not unlocked
        setIsOpen(!isUnlocked)
    }, [isUnlocked])

    const checkVaultStatus = async (uid: string) => {
        try {
            const docRef = doc(db, "user_settings", uid, "security", "vault")
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                const data = docSnap.data()
                setVaultSalt(data.salt)
                setVerifier(data.verifier)
                setMode("unlock")
            } else {
                setMode("setup")
            }
        } catch (err) {
            console.error("Error checking vault status:", err)
            setError("Failed to connect to server.")
        }
    }

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!password || !vaultSalt || !verifier) return

        setLoading(true)
        setError("")

        try {
            const key = await deriveKey(password, vaultSalt)
            const isValid = await verifyKey(key, verifier.encrypted, verifier.iv)

            if (isValid) {
                setKey(key)
                setIsOpen(false)
                setPassword("")
            } else {
                setError("Incorrect Master Password")
            }
        } catch (err) {
            console.error(err)
            setError("Failed to unlock vault")
        } finally {
            setLoading(false)
        }
    }

    const handleSetup = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!password || !userId) return
        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters")
            return
        }

        setLoading(true)
        setError("")

        try {
            const salt = await generateSalt()
            const key = await deriveKey(password, salt)
            const verifierData = await createKeyVerifier(key)

            // Save salt and key verification data
            await setDoc(doc(db, "user_settings", userId, "security", "vault"), {
                salt,
                verifier: verifierData,
                createdAt: Date.now()
            })

            setKey(key)
            setIsOpen(false)
            setPassword("")
            setConfirmPassword("")
        } catch (err) {
            console.error(err)
            setError("Failed to setup vault")
        } finally {
            setLoading(false)
        }
    }

    if (isUnlocked) return null

    return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {mode === "setup" ? <KeyRound className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                        {mode === "setup" ? "Create Master Password" : "Unlock Password Vault"}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === "setup"
                            ? "Set a strong Master Password. This password encrypts your data locally. If you lose it, your data is lost forever."
                            : "Enter your Master Password to decrypt your vault."}
                    </DialogDescription>
                </DialogHeader>

                {mode === "loading" ? (
                    <div className="flex justify-center py-8">Loading vault status...</div>
                ) : (
                    <form onSubmit={mode === "setup" ? handleSetup : handleUnlock} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="password">Master Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter master password"
                                autoFocus
                            />
                        </div>

                        {mode === "setup" && (
                            <div className="space-y-2">
                                <Label htmlFor="confirm">Confirm Password</Label>
                                <Input
                                    id="confirm"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm master password"
                                />
                            </div>
                        )}

                        <DialogFooter>
                            <Button type="submit" disabled={loading} className="w-full">
                                {loading ? "Processing..." : (mode === "setup" ? "Create Vault" : "Unlock Vault")}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
