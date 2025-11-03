"use client"

import * as React from "react"
import { Copy, Link, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"

export default function URLEncoder() {
  const [inputText, setInputText] = React.useState("")
  const [decodedInputText, setDecodedInputText] = React.useState("")
  const [encodedText, setEncodedText] = React.useState("")
  const [decodedText, setDecodedText] = React.useState("")
  const [encodeError, setEncodeError] = React.useState<string | null>(null)
  const [decodeError, setDecodeError] = React.useState<string | null>(null)
  const { toast } = useToast()

  // Handle encoding
  const handleEncode = (text: string) => {
    setInputText(text)
    setEncodeError(null)
    
    if (!text.trim()) {
      setEncodedText("")
      return
    }

    try {
      const encoded = encodeURIComponent(text)
      setEncodedText(encoded)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Encoding failed"
      setEncodeError(`Failed to encode: ${errorMsg}`)
      setEncodedText("")
      console.error("Encoding error:", error)
    }
  }

  // Handle decoding
  const handleDecode = (text: string) => {
    setDecodeError(null)
    
    if (!text.trim()) {
      setDecodedText("")
      return
    }

    try {
      // Validate URL-encoded format
      const urlEncodedPattern = /%[0-9A-Fa-f]{2}/g
      const percentEncodedChars = text.match(urlEncodedPattern)
      
      // Check if it looks like URL-encoded text
      if (percentEncodedChars && percentEncodedChars.length === 0 && text.includes('%')) {
        throw new Error("String contains '%' but not in valid percent-encoding format (e.g., %20)")
      }

      const decoded = decodeURIComponent(text)
      setDecodedText(decoded)
    } catch (error) {
      const errorMsg = error instanceof Error 
        ? error.message 
        : "Decoding failed. The string may not be valid URL-encoded text."
      
      if (errorMsg.includes("URI malformed")) {
        setDecodeError("Invalid URL-encoded string. Check for incomplete percent-encoded sequences (e.g., % without two hex digits).")
      } else {
        setDecodeError(errorMsg)
      }
      setDecodedText("")
      console.error("Decoding error:", error)
    }
  }

  // Copy text to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        description: "Copied to clipboard",
        duration: 2000,
      })
    } catch (error) {
      console.error("Copy failed:", error)
      toast({
        variant: "destructive",
        description: "Failed to copy text",
        duration: 2000,
      })
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
                  <Link className="h-5 w-5 text-primary" />
                </div>
                Encode/Decode URL-formatted Strings
              </CardTitle>
              <CardDescription className="mt-2">
                Encode text to URL-encoded format (also known as &quot;percent-encoded&quot;), or decode from it.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Encode Section */}
              <div className="space-y-4">
                <h3 className="font-semibold">Encode</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="input">Your string:</Label>
                    <Textarea
                      id="input"
                      placeholder="Enter text to encode..."
                      value={inputText}
                      onChange={(e) => handleEncode(e.target.value)}
                      className="min-h-[100px] md:min-h-[150px] resize-none"
                    />
                  </div>
                  
                  {encodeError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{encodeError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="encoded">Your string encoded:</Label>
                    <div className="relative">
                      <Textarea 
                        id="encoded" 
                        value={encodedText} 
                        readOnly 
                        className="min-h-[100px] md:min-h-[150px] resize-none pr-12 font-mono" 
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-2 top-2"
                        onClick={() => copyToClipboard(encodedText)}
                        disabled={!encodedText}
                      >
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy encoded text</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decode Section */}
              <div className="space-y-4">
                <h3 className="font-semibold">Decode</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="encoded-input">Your encoded string:</Label>
                    <Textarea
                      id="encoded-input"
                      placeholder="Enter URL-encoded text (e.g., Hello%20World)..."
                      value={decodedInputText}
                      onChange={(e) => {
                        setDecodedInputText(e.target.value)
                        handleDecode(e.target.value)
                      }}
                      className="min-h-[100px] md:min-h-[150px] resize-none font-mono"
                    />
                  </div>
                  
                  {decodeError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{decodeError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="decoded">Your string decoded:</Label>
                    <div className="relative">
                      <Textarea 
                        id="decoded" 
                        value={decodedText} 
                        readOnly 
                        className="min-h-[100px] md:min-h-[150px] resize-none pr-12" 
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-2 top-2"
                        onClick={() => copyToClipboard(decodedText)}
                        disabled={!decodedText}
                      >
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy decoded text</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

