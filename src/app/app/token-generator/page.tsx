"use client"

import { useState, useCallback, useEffect } from "react"
import { Copy, RefreshCw } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"

interface CharacterSet {
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
}

export default function TokenGenerator() {
  const [length, setLength] = useState<number>(65)
  const [token, setToken] = useState<string>("")
  const [chars, setChars] = useState<CharacterSet>({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  })

  const generateToken = useCallback(() => {
    const charset = {
      uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      lowercase: "abcdefghijklmnopqrstuvwxyz",
      numbers: "0123456789",
      symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
    }

    let availableChars = ""
    Object.entries(chars).forEach(([key, value]) => {
      if (value) {
        availableChars += charset[key as keyof typeof charset]
      }
    })

    if (!availableChars) {
      setTimeout(() => toast.error("Please select at least one character type"), 0)
      return
    }

    let result = ""
    const charactersLength = availableChars.length
    for (let i = 0; i < length; i++) {
      result += availableChars.charAt(Math.floor(Math.random() * charactersLength))
    }

    setToken(result)
  }, [chars, length])

  const copyToClipboard = async () => {
    if (!token) {
      setTimeout(() => toast.error("Generate a token first"), 0)
      return
    }

    try {
      await navigator.clipboard.writeText(token)
      setTimeout(() => toast.success("Token copied to clipboard"), 0)
    } catch {
      setTimeout(() => toast.error("Failed to copy token"), 0)
    }
  }

  useEffect(() => {
    generateToken()
  }, [generateToken])

  return (
    <div className="p-2 flex justify-center">
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl font-bold mx-auto w-fit">Token generator</CardTitle>
        <CardDescription className="mx-auto w-fit">
          Generate random string with the chars you want, uppercase or lowercase letters, numbers and/or symbols.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between max-w-[250px] ml-16">
            <label htmlFor="uppercase" className="text-sm font-medium">
              Uppercase (ABC...)
            </label>
            <Switch
              id="uppercase"
              checked={chars.uppercase}
              onCheckedChange={(checked) => setChars((prev) => ({ ...prev, uppercase: checked }))}
            />
          </div>
          <div className="flex items-center justify-between max-w-[250px] ml-16">
            <label htmlFor="numbers" className="text-sm font-medium">
              Numbers (123...)
            </label>
            <Switch
              id="numbers"
              checked={chars.numbers}
              onCheckedChange={(checked) => setChars((prev) => ({ ...prev, numbers: checked }))}
            />
          </div>
          <div className="flex items-center justify-between max-w-[250px] ml-16">
            <label htmlFor="lowercase" className="text-sm font-medium">
              Lowercase (abc...)
            </label>
            <Switch
              id="lowercase"
              checked={chars.lowercase}
              onCheckedChange={(checked) => setChars((prev) => ({ ...prev, lowercase: checked }))}
            />
          </div>
          <div className="flex items-center justify-between max-w-[250px] ml-16">
            <label htmlFor="symbols" className="text-sm font-medium">
              Symbols (!-;...)
            </label>
            <Switch
              id="symbols"
              checked={chars.symbols}
              onCheckedChange={(checked) => setChars((prev) => ({ ...prev, symbols: checked }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Length ({length})</label>
          </div>
          <Slider
            value={[length]}
            onValueChange={([value]) => setLength(value)}
            max={128}
            min={1}
            step={1}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <div className="relative">
            <textarea
              readOnly
              value={token}
              className="w-full min-h-[80px] p-3 rounded-md border bg-muted/50 font-mono text-sm"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={generateToken}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  )
}

