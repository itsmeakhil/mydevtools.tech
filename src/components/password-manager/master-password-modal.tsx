"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, KeyRound, AlertTriangle, Unlock, ShieldCheck } from "lucide-react"
import { usePasswordStore } from "@/store/password-store"
import { deriveKey, generateSalt, createKeyVerifier, verifyKey } from "@/lib/encryption"
import { auth, db } from "@/database/firebase"
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { loadKey, saveKey } from "@/lib/key-storage"
import { decryptData } from "@/lib/encryption"
import { PasswordEntry } from "@/store/password-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function VaultLockScreen() {
    const { isUnlocked, setKey, setPasswords, setLoading: setPasswordsLoading } = usePasswordStore()
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [mode, setMode] = useState<"loading" | "setup" | "unlock">("loading")
    const [vaultSalt, setVaultSalt] = useState<string | null>(null)
    const [verifier, setVerifier] = useState<{ encrypted: string; iv: string } | null>(null)
    const [userId, setUserId] = useState<string | null>(null)
    const [shake, setShake] = useState(false)

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

    const fetchAndSetPasswords = async (uid: string, key: CryptoKey) => {
        try {
            setPasswordsLoading(true)
            const querySnapshot = await getDocs(collection(db, "user_passwords", uid, "entries"))


            const decryptionPromises = querySnapshot.docs.map(async (doc) => {
                const data = doc.data()
                try {
                    const decryptedData = await decryptData(key, data.encryptedData, data.iv)
                    const parsedData = JSON.parse(decryptedData)

                    return {
                        id: doc.id,
                        ...parsedData,
                        createdAt: data.createdAt,
                        updatedAt: data.updatedAt
                    } as PasswordEntry
                } catch (e) {
                    console.error(`Failed to decrypt password ${doc.id}:`, e)
                    return null
                }
            })

            const results = await Promise.all(decryptionPromises)
            const loadedPasswords = results.filter((p): p is PasswordEntry => p !== null)

            setPasswords(loadedPasswords)
        } catch (error) {
            console.error("Failed to fetch passwords:", error)
            toast.error("Failed to load passwords")
        } finally {
            setPasswordsLoading(false)
        }
    }

    const checkVaultStatus = async (uid: string) => {
        try {
            const docRef = doc(db, "user_settings", uid, "security", "vault")
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                const data = docSnap.data()
                setVaultSalt(data.salt)
                setVerifier(data.verifier)
                setMode("unlock")

                // Try to auto-unlock
                try {
                    const savedKey = await loadKey()
                    if (savedKey) {
                        const isValid = await verifyKey(savedKey, data.verifier.encrypted, data.verifier.iv)
                        if (isValid) {
                            setKey(savedKey)
                            await fetchAndSetPasswords(uid, savedKey)
                            return
                        }
                    }
                } catch (e) {
                    console.error("Auto-unlock failed:", e)
                }
            } else {
                setMode("setup")
            }
        } catch (err) {
            console.error("Error checking vault status:", err)
            setError("Failed to connect to server.")
        }
    }

    const triggerShake = () => {
        setShake(true)
        setTimeout(() => setShake(false), 500)
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
                await saveKey(key)
                if (userId) {
                    await fetchAndSetPasswords(userId, key)
                }
                setPassword("")
            } else {
                setError("Incorrect Master Password")
                triggerShake()
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
            triggerShake()
            return
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters")
            triggerShake()
            return
        }

        setLoading(true)
        setError("")

        try {
            const salt = await generateSalt()
            const key = await deriveKey(password, salt)
            const verifierData = await createKeyVerifier(key)

            await setDoc(doc(db, "user_settings", userId, "security", "vault"), {
                salt,
                verifier: verifierData,
                createdAt: Date.now()
            })

            setKey(key)
            await saveKey(key)
            setPassword("")
            setConfirmPassword("")
        } catch (err) {
            console.error(err)
            setError("Failed to setup vault")
        } finally {
            setLoading(false)
        }
    }

    if (mode === "loading") {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="flex min-h-[80vh] items-center justify-center p-4">
            <Card className={cn(
                "w-full max-w-md border-muted/40 shadow-xl transition-all duration-300",
                shake && "animate-in fade-in slide-in-from-bottom-4 duration-500"
            )} style={shake ? { animation: "shake 0.5s cubic-bezier(.36,.07,.19,.97) both" } : {}}>
                <style jsx>{`
          @keyframes shake {
            10%, 90% { transform: translate3d(-1px, 0, 0); }
            20%, 80% { transform: translate3d(2px, 0, 0); }
            30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
            40%, 60% { transform: translate3d(4px, 0, 0); }
          }
        `}</style>
                <CardHeader className="space-y-4 text-center pb-2">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-2">
                        {mode === "setup" ? (
                            <ShieldCheck className="h-8 w-8 text-primary" />
                        ) : (
                            <Lock className="h-8 w-8 text-primary" />
                        )}
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        {mode === "setup" ? "Setup Password Vault" : "Unlock Vault"}
                    </CardTitle>
                    <CardDescription className="text-base">
                        {mode === "setup"
                            ? "Create a master password to secure your credentials. This password is never stored and cannot be recovered."
                            : "Enter your master password to access your secured credentials."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={mode === "setup" ? handleSetup : handleUnlock} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Master Password</Label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter master password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-9"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {mode === "setup" && (
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm Password</Label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="confirm-password"
                                        type="password"
                                        placeholder="Confirm master password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        )}

                        {error && (
                            <Alert variant="destructive" className="py-2">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Button type="submit" className="w-full" size="lg" disabled={loading}>
                            {loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : mode === "setup" ? (
                                <Unlock className="mr-2 h-4 w-4" />
                            ) : (
                                <Unlock className="mr-2 h-4 w-4" />
                            )}
                            {mode === "setup" ? "Create Vault" : "Unlock Vault"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
