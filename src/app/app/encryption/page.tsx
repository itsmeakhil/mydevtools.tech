"use client"

import { useState, useEffect, useCallback } from "react"
import * as CryptoJS from "crypto-js"
import { Copy, Loader2, Shield, LockKeyhole, Fingerprint } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tab"
import { hashString, compareStrings } from "./actions"
import type { CompareResponse } from "./types"
import { useDebouncedCallback } from "use-debounce"

type Algorithm = "AES" | "TripleDES" | "Rabbit" | "RC4"

export default function EncryptionPage() {
    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="mx-auto max-w-5xl space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
                        <Shield className="h-8 w-8" />
                        Encryption & Hashing
                    </h1>
                    <p className="text-muted-foreground">
                        Securely encrypt text and generate hashes using industry-standard algorithms.
                    </p>
                </div>

                <Tabs defaultValue="encryption" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="encryption">Text Encryption</TabsTrigger>
                        <TabsTrigger value="bcrypt">Bcrypt</TabsTrigger>
                    </TabsList>

                    <TabsContent value="encryption">
                        <EncryptionTab />
                    </TabsContent>

                    <TabsContent value="bcrypt">
                        <BcryptTab />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

function EncryptionTab() {
    const defaultText = "Lorem ipsum dolor sit amet"
    const defaultKey = "my secret key"

    const [plainText, setPlainText] = useState(defaultText)
    const [encryptKey, setEncryptKey] = useState(defaultKey)
    const [encryptedText, setEncryptedText] = useState("")
    const [textToDecrypt, setTextToDecrypt] = useState("")
    const [decryptKey, setDecryptKey] = useState(defaultKey)
    const [decryptedText, setDecryptedText] = useState("")
    const [encryptAlgo, setEncryptAlgo] = useState<Algorithm>("AES")
    const [decryptAlgo, setDecryptAlgo] = useState<Algorithm>("AES")

    useEffect(() => {
        const encrypted = CryptoJS.AES.encrypt(defaultText, defaultKey).toString()
        setEncryptedText(encrypted)
        setTextToDecrypt(encrypted)

        const decrypted = CryptoJS.AES.decrypt(encrypted, defaultKey)
        const result = decrypted.toString(CryptoJS.enc.Utf8)
        setDecryptedText(result || "Your string hash")
    }, [])

    useEffect(() => {
        const adjustTextarea = (textarea: HTMLTextAreaElement) => {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        };

        const encryptedTextarea = document.querySelector('textarea[name="encrypted"]') as HTMLTextAreaElement;
        const decryptTextarea = document.querySelector('textarea[name="decrypt"]') as HTMLTextAreaElement;

        if (encryptedTextarea) adjustTextarea(encryptedTextarea);
        if (decryptTextarea) adjustTextarea(decryptTextarea);
    }, [encryptedText, textToDecrypt]);

    const encrypt = (text: string, key: string, algorithm: Algorithm) => {
        try {
            let encrypted
            switch (algorithm) {
                case "AES":
                    encrypted = CryptoJS.AES.encrypt(text, key).toString()
                    break
                case "TripleDES":
                    encrypted = CryptoJS.TripleDES.encrypt(text, key).toString()
                    break
                case "Rabbit":
                    encrypted = CryptoJS.Rabbit.encrypt(text, key).toString()
                    break
                case "RC4":
                    encrypted = CryptoJS.RC4.encrypt(text, key).toString()
                    break
                default:
                    encrypted = ""
            }
            setEncryptedText(encrypted)
        } catch (error) {
            console.error("Encryption error:", error)
            setEncryptedText("Encryption failed")
        }
    }

    const decrypt = (encrypted: string, key: string, algorithm: Algorithm) => {
        try {
            let decrypted
            switch (algorithm) {
                case "AES":
                    decrypted = CryptoJS.AES.decrypt(encrypted, key)
                    break
                case "TripleDES":
                    decrypted = CryptoJS.TripleDES.decrypt(encrypted, key)
                    break
                case "Rabbit":
                    decrypted = CryptoJS.Rabbit.decrypt(encrypted, key)
                    break
                case "RC4":
                    decrypted = CryptoJS.RC4.decrypt(encrypted, key)
                    break
                default:
                    decrypted = ""
                    return
            }

            if (decrypted.sigBytes > 0) {
                try {
                    const result = decrypted.toString(CryptoJS.enc.Utf8)
                    if (result) {
                        setDecryptedText(result)
                        return
                    }
                } catch {
                    setDecryptedText("Your string hash")
                    return
                }
            }
            setDecryptedText("Your string hash")
        } catch (error) {
            console.error("Decryption error:", error)
            setDecryptedText("Your string hash")
        }
    }

    return (
        <Card className="border-2 shadow-lg w-full">
            <CardHeader>
                <div className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
                        <div className="p-2 bg-primary/10 rounded-lg shadow-sm">
                            <LockKeyhole className="h-5 w-5 text-primary" />
                        </div>
                        Encrypt / Decrypt Text
                    </CardTitle>
                    <CardDescription className="mt-2">
                        Encrypt clear text and decrypt ciphertext using crypto algorithms like AES, TripleDES, Rabbit or RC4.
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid gap-6 md:grid-cols-2 mt-2">
                    {/* Encrypt Section */}
                    <Card className="bg-transparent border-gray-200">
                        <CardHeader>
                            <CardTitle>Encrypt</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Your text:</Label>
                                <Textarea
                                    value={plainText}
                                    onChange={(e) => {
                                        setPlainText(e.target.value)
                                        encrypt(e.target.value, encryptKey, encryptAlgo)
                                    }}
                                    placeholder="Enter text to encrypt"
                                    className="font-sans bg-transparent border-gray-200"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Your secret key:</Label>
                                <Input
                                    value={encryptKey}
                                    onChange={(e) => {
                                        setEncryptKey(e.target.value)
                                        encrypt(plainText, e.target.value, encryptAlgo)
                                    }}
                                    placeholder="Enter secret key"
                                    className="font-sans bg-transparent border-gray-200"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Encryption algorithm:</Label>
                                <Select
                                    value={encryptAlgo}
                                    onValueChange={(value: Algorithm) => {
                                        setEncryptAlgo(value)
                                        encrypt(plainText, encryptKey, value)
                                    }}
                                >
                                    <SelectTrigger className="bg-transparent border-gray-200">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="AES">AES</SelectItem>
                                        <SelectItem value="TripleDES">TripleDES</SelectItem>
                                        <SelectItem value="Rabbit">Rabbit</SelectItem>
                                        <SelectItem value="RC4">RC4</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Your text encrypted:</Label>
                                <Textarea
                                    name="encrypted"
                                    value={encryptedText}
                                    readOnly
                                    className="font-sans text-sm leading-relaxed bg-transparent border-gray-200 min-h-[100px] resize-none overflow-hidden"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Decrypt Section */}
                    <Card className="bg-transparent border-gray-200">
                        <CardHeader>
                            <CardTitle>Decrypt</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Your encrypted text:</Label>
                                <Textarea
                                    name="decrypt"
                                    value={textToDecrypt}
                                    onChange={(e) => {
                                        setTextToDecrypt(e.target.value)
                                        decrypt(e.target.value, decryptKey, decryptAlgo)
                                    }}
                                    placeholder="Enter text to decrypt"
                                    className="font-sans text-sm leading-relaxed bg-transparent border-gray-200 min-h-[100px] resize-none overflow-hidden"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Your secret key:</Label>
                                <Input
                                    value={decryptKey}
                                    onChange={(e) => {
                                        setDecryptKey(e.target.value)
                                        decrypt(textToDecrypt, e.target.value, decryptAlgo)
                                    }}
                                    placeholder="Enter secret key"
                                    className="font-sans bg-transparent border-gray-200"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Encryption algorithm:</Label>
                                <Select
                                    value={decryptAlgo}
                                    onValueChange={(value: Algorithm) => {
                                        setDecryptAlgo(value)
                                        decrypt(textToDecrypt, decryptKey, value)
                                    }}
                                >
                                    <SelectTrigger className="bg-transparent border-gray-200">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="AES">AES</SelectItem>
                                        <SelectItem value="TripleDES">TripleDES</SelectItem>
                                        <SelectItem value="Rabbit">Rabbit</SelectItem>
                                        <SelectItem value="RC4">RC4</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Your decrypted text:</Label>
                                <Textarea value={decryptedText} readOnly className="font-sans bg-transparent border-gray-200" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </CardContent>
        </Card>
    )
}

function BcryptTab() {
    const { toast } = useToast()
    const [string, setString] = useState("")
    const [saltRounds, setSaltRounds] = useState(10)
    const [hash, setHash] = useState("")
    const [compareString, setCompareString] = useState("")
    const [compareHash, setCompareHash] = useState("")
    const [isMatch, setIsMatch] = useState<boolean | null>(null)
    const [isHashing, setIsHashing] = useState(false)
    const [isComparing, setIsComparing] = useState(false)

    const handleHash = useCallback(async () => {
        if (!string) {
            setHash("")
            return
        }

        setIsHashing(true)
        try {
            const result = await hashString(string, saltRounds)
            if (result.success && result.hash) {
                setHash(result.hash)
            }
        } finally {
            setIsHashing(false)
        }
    }, [string, saltRounds])

    useEffect(() => {
        handleHash()
    }, [handleHash])

    const handleCompare = useCallback(async () => {
        if (!compareString || !compareHash) {
            setIsMatch(null)
            return
        }

        setIsComparing(true)
        try {
            const result: CompareResponse = await compareStrings(compareString, compareHash)
            if (result.success) {
                setIsMatch(result.isMatch || false)
            } else {
                throw new Error(result.error || "Failed to compare strings")
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to compare strings",
                variant: "destructive",
            })
            setIsMatch(null)
        } finally {
            setIsComparing(false)
        }
    }, [compareString, compareHash, toast])

    const debouncedCompare = useDebouncedCallback(async () => {
        await handleCompare()
    }, 500)

    useEffect(() => {
        if (compareString && compareHash) {
            debouncedCompare()
        } else {
            setIsMatch(null)
        }
    }, [compareString, compareHash, debouncedCompare])

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(hash)
            toast({
                title: "Copied",
                description: "Hash has been copied to clipboard",
            })
        } catch {
            toast({
                title: "Error",
                description: "Failed to copy hash to clipboard",
                variant: "destructive",
            })
        }
    }

    return (
        <Card className="border-2 shadow-lg w-full">
            <CardHeader>
                <div className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
                        <div className="p-2 bg-primary/10 rounded-lg shadow-sm">
                            <Fingerprint className="h-5 w-5 text-primary" />
                        </div>
                        Bcrypt
                    </CardTitle>
                    <CardDescription className="mt-2">
                        Hash and compare text string using bcrypt. Bcrypt is a password-hashing function based on the Blowfish cipher.
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Hash</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Your string:</label>
                                <Input
                                    placeholder="Your string to bcrypt..."
                                    value={string}
                                    onChange={(e) => setString(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Salt rounds:</label>
                                <div className="flex items-center space-x-2">
                                    <Input
                                        type="number"
                                        value={saltRounds}
                                        onChange={(e) => setSaltRounds(Number(e.target.value))}
                                        min={4}
                                        max={31}
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={() => setSaltRounds((prev) => Math.max(4, prev - 1))}
                                        disabled={isHashing}
                                    >
                                        -
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setSaltRounds((prev) => Math.min(31, prev + 1))}
                                        disabled={isHashing}
                                    >
                                        +
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Generated hash:</label>
                                <div className="relative">
                                    <div className="rounded-md bg-muted p-3 font-mono text-sm break-all min-w-[300px] max-w-full overflow-x-auto">
                                        {hash || "Hash will appear here"}
                                    </div>
                                    {isHashing && (
                                        <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                        </div>
                                    )}
                                    {hash && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="secondary" size="icon" onClick={handleCopy} className="absolute right-2 top-2">
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Copy to clipboard</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Compare string with hash</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Your string:</label>
                                <Input
                                    placeholder="Your string to compare..."
                                    value={compareString}
                                    onChange={(e) => setCompareString(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Your hash:</label>
                                <Input
                                    placeholder="Your hash to compare..."
                                    value={compareHash}
                                    onChange={(e) => setCompareHash(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium">Do they match?</span>
                                <span className={isMatch !== null ? (isMatch ? "text-green-500" : "text-red-500") : "text-muted-foreground"}>
                                    {isComparing ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        isMatch !== null ? (isMatch ? "Yes" : "No") : "Enter values to compare"
                                    )}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </CardContent>
        </Card>
    )
}
