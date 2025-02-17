"use client"

import * as React from "react"
import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

export default function URLEncoder() {
  const [inputText, setInputText] = React.useState("")
  const [decodedInputText, setDecodedInputText] = React.useState("")
  const [encodedText, setEncodedText] = React.useState("")
  const [decodedText, setDecodedText] = React.useState("")
  const { toast } = useToast()

  // Handle encoding
  const handleEncode = (text: string) => {
    setInputText(text)
    try {
      const encoded = encodeURIComponent(text)
      setEncodedText(encoded)
    } catch (error) {
      console.error("Encoding error:", error)
    }
  }

  // Handle decoding
  const handleDecode = (text: string) => {
    try {
      const decoded = decodeURIComponent(text)
      setDecodedText(decoded)
    } catch (error) {
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
    <div className="border rounded-lg shadow-sm mt-3">
      <div className="container mx-auto p-4 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter">Encode/decode URL-formatted strings</h1>
          <p className="text-muted-foreground">
            Encode text to URL-encoded format (also known as &quot;percent-encoded&quot;), or decode from it.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Encode Section */}
          <Card>
            <CardHeader>
              <CardTitle>Encode</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="input">Your string:</Label>
                <Textarea
                  id="input"
                  placeholder="Enter text to encode..."
                  value={inputText}
                  onChange={(e) => handleEncode(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="encoded">Your string encoded:</Label>
                <div className="relative">
                  <Textarea id="encoded" value={encodedText} readOnly className="min-h-[100px] resize-none pr-12" />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-2 top-2"
                    onClick={() => copyToClipboard(encodedText)}
                  >
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">Copy encoded text</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Decode Section */}
          <Card>
            <CardHeader>
              <CardTitle>Decode</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="encoded-input">Your encoded string:</Label>
                <Textarea
                  id="encoded-input"
                  placeholder="Enter URL-encoded text..."
                  value={decodedInputText}
                  onChange={(e) => {
                    setDecodedInputText(e.target.value)
                    handleDecode(e.target.value)
                  }}
                  className="min-h-[100px] resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="decoded">Your string decoded:</Label>
                <div className="relative">
                  <Textarea id="decoded" value={decodedText} readOnly className="min-h-[100px] resize-none pr-12" />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-2 top-2"
                    onClick={() => copyToClipboard(decodedText)}
                  >
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">Copy decoded text</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

