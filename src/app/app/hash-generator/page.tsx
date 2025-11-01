"use client"

import { useState } from "react"
import { createHash } from "crypto"
import * as CryptoJS from 'crypto-js'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CopyButton } from "@/components/tools/copy-button"
import { Fingerprint } from "lucide-react"

type HashFunction = "MD5" | "SHA1" | "SHA256" | "SHA224" | "SHA512" | "SHA384" | "RIPEMD160" | "SHA3"
type DigestEncoding = "hex" | "base64" | "binary"

export default function HashGenerator() {
  const [text, setText] = useState("")
  const [encoding, setEncoding] = useState<DigestEncoding>("hex")

  const hashFunctions: HashFunction[] = ["MD5", "SHA1", "SHA256", "SHA224", "SHA512", "SHA384", "RIPEMD160", "SHA3"]

  const generateHash = (algorithm: string) => {
    if (!text) return ""
    
    // Handle SHA3 separately using crypto-js
    if (algorithm === "SHA3") {
      return CryptoJS.SHA3(text, { outputLength: 256 }).toString(CryptoJS.enc.Hex)
    }

    // Existing crypto implementation for other algorithms
    const hash = createHash(algorithm.toLowerCase())
    hash.update(text)
    return hash.digest(encoding)
  }

  return (
    <div className="min-h-screen p-2 flex justify-center ">
    <div className="container mx-auto p-1 max-w-5xl">
      <Card className="border-2 shadow-lg w-full">
        <CardHeader>
          <div className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
              <div className="p-2 bg-primary/10 rounded-lg shadow-sm">
                <Fingerprint className="h-5 w-5 text-primary" />
              </div>
              Hash Text
            </CardTitle>
            <CardDescription className="mt-2">
              Hash a text string using the function you need: MD5, SHA1, SHA256, SHA224, SHA512, SHA384, SHA3 or RIPEMD160
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">

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
                <CopyButton
                  text={generateHash(func)}
                  variant="outline"
                  size="icon"
                  disabled={!text}
                  className="shrink-0"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  )
}

