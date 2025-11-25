"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Copy, RefreshCw, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { calculatePasswordStrength, getStrengthColor, getStrengthLabel } from "@/lib/password-utils"
import { cn } from "@/lib/utils"

interface AdvancedGeneratorProps {
    onPasswordChange?: (password: string) => void
    initialLength?: number
    className?: string
    showInput?: boolean
}

export function AdvancedGenerator({ onPasswordChange, initialLength = 16, className, showInput = true }: AdvancedGeneratorProps) {
    const [length, setLength] = useState(initialLength)
    const [password, setPassword] = useState("")
    const [copied, setCopied] = useState(false)

    const [options, setOptions] = useState({
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
        excludeSimilar: false,
        excludeAmbiguous: false,
    })

    const generatePassword = useCallback(() => {
        const chars = {
            lowercase: "abcdefghijklmnopqrstuvwxyz",
            uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            numbers: "0123456789",
            symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
            similar: "il1Lo0O",
            ambiguous: "{}[]()/\\'\"~,;.<>",
        }

        let availableChars = ""

        if (options.lowercase) availableChars += chars.lowercase
        if (options.uppercase) availableChars += chars.uppercase
        if (options.numbers) availableChars += chars.numbers
        if (options.symbols) availableChars += chars.symbols

        if (options.excludeSimilar) {
            availableChars = availableChars.split("").filter((c) => !chars.similar.includes(c)).join("")
        }
        if (options.excludeAmbiguous) {
            availableChars = availableChars.split("").filter((c) => !chars.ambiguous.includes(c)).join("")
        }

        if (!availableChars) {
            setPassword("")
            onPasswordChange?.("")
            return
        }

        let newPassword = ""
        const array = new Uint8Array(length)
        crypto.getRandomValues(array)

        for (let i = 0; i < length; i++) {
            newPassword += availableChars[array[i] % availableChars.length]
        }

        setPassword(newPassword)
        onPasswordChange?.(newPassword)
    }, [length, options, onPasswordChange])

    useEffect(() => {
        generatePassword()
    }, [generatePassword])

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(password)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            // Silent fail
        }
    }

    const strengthScore = calculatePasswordStrength(password)

    return (
        <div className={cn("space-y-4", className)}>
            {showInput && (
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <Input
                            value={password}
                            readOnly
                            className="text-center text-sm font-mono font-semibold h-9"
                            onClick={(e) => (e.target as HTMLInputElement).select()}
                        />
                        <Button size="icon" onClick={handleCopy} variant="outline" className="h-9 w-9 shrink-0">
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                        <Button size="icon" onClick={generatePassword} variant="outline" className="h-9 w-9 shrink-0">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-medium">Strength</span>
                            <Badge variant={strengthScore < 3 ? "destructive" : strengthScore < 4 ? "secondary" : "default"} className="text-xs h-5">
                                {getStrengthLabel(strengthScore)}
                            </Badge>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5">
                            <div
                                className={cn("h-1.5 rounded-full transition-all duration-300", getStrengthColor(strengthScore))}
                                style={{ width: `${(strengthScore / 5) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="length" className="text-xs">
                        Length: {length} characters
                    </Label>
                    <Badge variant="secondary" className="text-xs h-5">
                        {length} chars
                    </Badge>
                </div>
                <Slider id="length" min={4} max={64} step={1} value={[length]} onValueChange={(value) => setLength(value[0])} />
            </div>

            <div className="space-y-3">
                <Label className="text-sm font-semibold">Character Sets</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                        { id: "uppercase", label: "Uppercase", sample: "ABC" },
                        { id: "lowercase", label: "Lowercase", sample: "abc" },
                        { id: "numbers", label: "Numbers", sample: "123" },
                        { id: "symbols", label: "Symbols", sample: "!@#" },
                    ].map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg border border-border">
                            <div className="flex items-center gap-2">
                                <div className="p-1 bg-primary/10 rounded-md">
                                    <span className="text-xs font-bold">{item.sample}</span>
                                </div>
                                <Label htmlFor={item.id} className="cursor-pointer text-xs">
                                    {item.label}
                                </Label>
                            </div>
                            <Switch
                                id={item.id}
                                checked={options[item.id as keyof typeof options]}
                                onCheckedChange={(checked) => setOptions({ ...options, [item.id]: checked })}
                                className="scale-75 origin-right"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
