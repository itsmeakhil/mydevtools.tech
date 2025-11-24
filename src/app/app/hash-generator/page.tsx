"use client"

import { useState } from "react"
import * as CryptoJS from 'crypto-js'
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CopyButton } from "@/components/tools/copy-button"
import { Fingerprint, Hash, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"

type HashFunction = "MD5" | "SHA1" | "SHA256" | "SHA224" | "SHA512" | "SHA384" | "RIPEMD160" | "SHA3"
type DigestEncoding = "hex" | "base64" | "binary"

const hashCategories = {
  recommended: [
    { name: "SHA256" as HashFunction, desc: "256-bit, Most widely used", security: "high" },
    { name: "SHA512" as HashFunction, desc: "512-bit, Extra secure", security: "high" },
    { name: "SHA3" as HashFunction, desc: "Latest standard (Keccak)", security: "high" },
  ],
  legacy: [
    { name: "SHA1" as HashFunction, desc: "160-bit, Deprecated", security: "low" },
    { name: "MD5" as HashFunction, desc: "128-bit, Not secure", security: "low" },
  ],
  other: [
    { name: "SHA224" as HashFunction, desc: "224-bit variant", security: "medium" },
    { name: "SHA384" as HashFunction, desc: "384-bit variant", security: "high" },
    { name: "RIPEMD160" as HashFunction, desc: "Used in Bitcoin", security: "medium" },
  ]
}

export default function HashGenerator() {
  const [text, setText] = useState("")
  const [encoding, setEncoding] = useState<DigestEncoding>("hex")

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

  const renderHashCard = (hashInfo: { name: HashFunction; desc: string; security: string }) => {
    const hashValue = generateHash(hashInfo.name)
    const securityColor = {
      high: "text-green-500",
      medium: "text-yellow-500",
      low: "text-red-500"
    }[hashInfo.security]

    return (
      <Card key={hashInfo.name} className="group hover:shadow-md transition-all duration-200 hover:border-primary/50">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Hash className={`h-4 w-4 ${securityColor}`} />
                <h3 className="font-semibold text-lg">{hashInfo.name}</h3>
              </div>
              <p className="text-xs text-muted-foreground">{hashInfo.desc}</p>
            </div>
            <CopyButton
              text={hashValue}
              variant="ghost"
              size="icon"
              disabled={!hashValue}
              className="shrink-0 h-8 w-8"
            />
          </div>

          <div className="font-mono text-xs break-all bg-muted/50 p-3 rounded-md min-h-[60px] flex items-center">
            {hashValue || <span className="text-muted-foreground italic">Enter text to generate hash...</span>}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Fingerprint className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">Hash Generator</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Generate cryptographic hashes from your text using industry-standard algorithms
        </p>
      </div>

      {/* Input Section */}
      <Card className="border-2">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="hashInput" className="text-sm font-medium">
                Input Text
              </label>
              <Badge variant="secondary" className="font-mono">
                {text.length} characters
              </Badge>
            </div>
            <Textarea
              id="hashInput"
              placeholder="Enter your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="font-mono min-h-[120px] md:min-h-[140px] resize-none text-sm"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Output Encoding</label>
              <Select value={encoding} onValueChange={(value) => setEncoding(value as DigestEncoding)}>
                <SelectTrigger className="w-full sm:w-[280px]">
                  <SelectValue placeholder="Select encoding" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hex">Hexadecimal (base 16)</SelectItem>
                  <SelectItem value="base64">Base64</SelectItem>
                  <SelectItem value="binary">Binary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hash Results with Tabs */}
      <Tabs defaultValue="recommended" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
          <TabsTrigger value="legacy">Legacy</TabsTrigger>
        </TabsList>

        <TabsContent value="recommended" className="space-y-4">
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
            <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-sm text-green-800 dark:text-green-200">
              These are the recommended secure hash algorithms for modern applications
            </AlertDescription>
          </Alert>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hashCategories.recommended.map(renderHashCard)}
          </div>
        </TabsContent>

        <TabsContent value="other" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hashCategories.other.map(renderHashCard)}
          </div>
        </TabsContent>

        <TabsContent value="legacy" className="space-y-4">
          <Alert variant="destructive" className="bg-red-50 dark:bg-red-950/20">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              ⚠️ These algorithms are deprecated for security. Use for compatibility only.
            </AlertDescription>
          </Alert>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hashCategories.legacy.map(renderHashCard)}
          </div>
        </TabsContent>
      </Tabs>

      {/* Info Section */}
      <Card className="bg-muted/50 border-dashed">
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Hash Function Guide
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span><strong>SHA256/384/512:</strong> Recommended for new projects</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span><strong>SHA3:</strong> Latest cryptographic standard</span>
              </li>
            </ul>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-0.5">⚠</span>
                <span><strong>SHA1:</strong> Deprecated, use only for compatibility</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">✗</span>
                <span><strong>MD5:</strong> Broken, not suitable for security</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

