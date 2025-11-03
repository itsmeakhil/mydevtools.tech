"use client"

import { useState } from "react"
import * as CryptoJS from 'crypto-js'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CopyButton } from "@/components/tools/copy-button"
import { Fingerprint } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type HashFunction = "MD5" | "SHA1" | "SHA256" | "SHA224" | "SHA512" | "SHA384" | "RIPEMD160" | "SHA3"
type DigestEncoding = "hex" | "base64" | "binary"

export default function HashGenerator() {
  const [text, setText] = useState("")
  const [encoding, setEncoding] = useState<DigestEncoding>("hex")

  const hashFunctions: HashFunction[] = ["MD5", "SHA1", "SHA256", "SHA224", "SHA512", "SHA384", "RIPEMD160", "SHA3"]

  const generateHash = (algorithm: string): string => {
    if (!text.trim()) return ""
    
    try {
      let hash: CryptoJS.lib.WordArray;

      switch (algorithm.toLowerCase()) {
        case "md5":
          hash = CryptoJS.MD5(text)
          break
        case "sha1":
          hash = CryptoJS.SHA1(text)
          break
        case "sha224":
          hash = CryptoJS.SHA224(text)
          break
        case "sha256":
          hash = CryptoJS.SHA256(text)
          break
        case "sha384":
          hash = CryptoJS.SHA384(text)
          break
        case "sha512":
          hash = CryptoJS.SHA512(text)
          break
        case "ripemd160":
          hash = CryptoJS.RIPEMD160(text)
          break
        case "sha3":
          hash = CryptoJS.SHA3(text, { outputLength: 256 })
          break
        default:
          return ""
      }

      // Convert to desired encoding
      switch (encoding) {
        case "hex":
          return hash.toString(CryptoJS.enc.Hex)
        case "base64":
          return hash.toString(CryptoJS.enc.Base64)
        case "binary":
          return hash.toString(CryptoJS.enc.Latin1)
        default:
          return hash.toString(CryptoJS.enc.Hex)
      }
    } catch (error) {
      console.error(`Error generating ${algorithm} hash:`, error)
      return ""
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <div className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
                <div className="p-2 bg-primary/10 rounded-lg shadow-sm">
                  <Fingerprint className="h-5 w-5 text-primary" />
                </div>
                Hash Generator
              </CardTitle>
              <CardDescription className="mt-2">
                Hash a text string using various algorithms: MD5, SHA1, SHA256, SHA224, SHA512, SHA384, SHA3 or RIPEMD160
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="hashInput" className="text-sm font-medium">
                  Your text to hash:
                </label>
                <Badge variant="secondary">{text.length} chars</Badge>
              </div>
              <Textarea
                id="hashInput"
                placeholder="Enter text to hash..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="font-mono min-h-[100px] md:min-h-[120px] resize-none"
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
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Hash Results</h3>
                <Badge variant="secondary">
                  {hashFunctions.length} algorithms
                </Badge>
              </div>
              {hashFunctions.map((func) => {
                const hashValue = generateHash(func)
                return (
                  <div
                    key={func}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-[120px] font-medium text-sm">{func}</div>
                    <div className="flex-1 font-mono text-sm break-all text-muted-foreground">
                      {hashValue || (text ? "Calculating..." : "—")}
                    </div>
                    <CopyButton
                      text={hashValue}
                      variant="outline"
                      size="icon"
                      disabled={!hashValue}
                      className="shrink-0"
                    />
                  </div>
                )
              })}
            </div>

            {/* Info Section */}
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <h3 className="text-sm font-semibold mb-2">About Hash Functions</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>MD5</strong>: 128-bit hash (not recommended for security)</li>
                <li>• <strong>SHA1</strong>: 160-bit hash (deprecated for security)</li>
                <li>• <strong>SHA256/384/512</strong>: Secure hash algorithms (recommended)</li>
                <li>• <strong>RIPEMD160</strong>: 160-bit hash, used in Bitcoin</li>
                <li>• <strong>SHA3</strong>: Latest secure hash standard</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

