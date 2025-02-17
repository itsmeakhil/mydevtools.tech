"use client"

import * as React from "react"
import { CopyIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export function HTMLEntityConverter() {
  const [inputText, setInputText] = React.useState("")
  const [escapedText, setEscapedText] = React.useState("")
  const [unescapeInputText, setUnescapeInputText] = React.useState("")
  const [unescapedText, setUnescapedText] = React.useState("")
  const { toast } = useToast()

  // Escape HTML entities
  React.useEffect(() => {
    const escaped = inputText.replace(/[<>&"'\\]/g, (char) => {
      const entities: { [key: string]: string } = {
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&#39;",
        "\\": "&#92;",
      }
      return entities[char]
    })
    setEscapedText(escaped)
  }, [inputText])

  // Unescape HTML entities
  React.useEffect(() => {
    const unescaped = unescapeInputText.replace(/&([^;]+);/g, (entity, code) => {
      const entities: { [key: string]: string } = {
        lt: "<",
        gt: ">",
        amp: "&",
        quot: '"',
        "#39": "'",
        "#92": "\\",
      }
      return entities[code] || entity
    })
    setUnescapedText(unescaped)
  }, [unescapeInputText])

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    toast({
      description: "Copied to clipboard",
      duration: 2000,
    })
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Escape Section */}
      <Card>
        <CardHeader>
          <CardTitle>Escape html entities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Your string:</label>
            <Textarea
              placeholder="Enter text to escape..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[100px] font-mono"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Your string escaped:</label>
            <Textarea readOnly value={escapedText} className="min-h-[100px] font-mono bg-muted" />
          </div>
          <Button variant="secondary" className="w-full" onClick={() => copyToClipboard(escapedText)}>
            <CopyIcon className="w-4 h-4 mr-2" />
            Copy
          </Button>
        </CardContent>
      </Card>

      {/* Unescape Section */}
      <Card>
        <CardHeader>
          <CardTitle>Unescape html entities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Your escaped string:</label>
            <Textarea
              placeholder="Enter text to unescape..."
              value={unescapeInputText}
              onChange={(e) => setUnescapeInputText(e.target.value)}
              className="min-h-[100px] font-mono"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Your string unescaped:</label>
            <Textarea readOnly value={unescapedText} className="min-h-[100px] font-mono bg-muted" />
          </div>
          <Button variant="secondary" className="w-full" onClick={() => copyToClipboard(unescapedText)}>
            <CopyIcon className="w-4 h-4 mr-2" />
            Copy
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

