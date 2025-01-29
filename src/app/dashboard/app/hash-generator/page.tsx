"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { createHash } from "crypto"
import * as CryptoJS from 'crypto-js'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type HashFunction = "MD5" | "SHA1" | "SHA256" | "SHA224" | "SHA512" | "SHA384" | "RIPEMD160" | "SHA3"
type DigestEncoding = "hex" | "base64" | "binary"

export default function HashGenerator() {
  const [text, setText] = useState("")
  const [encoding, setEncoding] = useState<DigestEncoding>("hex")
  const [favorite, setFavorite] = useState(false)

  const hashFunctions: HashFunction[] = ["MD5", "SHA1", "SHA256", "SHA224", "SHA512", "SHA384", "RIPEMD160", "SHA3"]

  const generateHash = (algorithm: string) => {
    if (!text) return ""
    
    // Handle SHA3 separately using crypto-js
    //testing
    if (algorithm === "SHA3") {
      return CryptoJS.SHA3(text, { outputLength: 256 }).toString(CryptoJS.enc.Hex)
    }

    // Existing crypto implementation for other algorithms
    const hash = createHash(algorithm.toLowerCase())
    hash.update(text)
    return hash.digest(encoding)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error("Failed to copy text:", err)
    }
  }

  return (
    <div className="min-h-screen p-6 lg:ml-[var(--sidebar-width)] flex justify-center ">
    <div className="container mx-auto p-4 max-w-3xl">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-3xl font-bold">Hash text</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setFavorite(!favorite)} className="hover:text-primary">
            <Heart className={favorite ? "fill-current" : ""} />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Hash a text string using the function you need: MD5, SHA1, SHA256, SHA224, SHA512, SHA384, SHA3 or RIPEMD160
          </p>

          <div className="space-y-2">
            <label htmlFor="hashInput" className="text-sm font-medium">
              Your text to hash:
            </label>
            <Textarea
              id="hashInput"
              placeholder="Your string to hash..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Digest encoding</label>
            <Select value={encoding} onValueChange={(value) => setEncoding(value as DigestEncoding)}>
              <SelectTrigger>
                <SelectValue placeholder="Select encoding" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hex">Hexadecimal (base 16)</SelectItem>
                <SelectItem value="base64">Base64</SelectItem>
                <SelectItem value="binary">Binary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {hashFunctions.map((func) => (
              <div
                key={func}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2 rounded-lg border"
              >
                <div className="min-w-[100px] font-medium">{func}</div>
                <div className="flex-1 font-mono text-sm break-all">{text ? generateHash(func) : ""}</div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(generateHash(func))}
                  disabled={!text}
                  className="shrink-0"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-copy"
                  >
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  )
}

