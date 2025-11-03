"use client"

import * as React from "react"
import { CopyIcon, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

export function HTMLEntityConverter() {
  const [inputText, setInputText] = React.useState("")
  const [escapedText, setEscapedText] = React.useState("")
  const [unescapeInputText, setUnescapeInputText] = React.useState("")
  const [unescapedText, setUnescapedText] = React.useState("")
  const [copied, setCopied] = React.useState<'escape' | 'unescape' | null>(null)
  const [escapeError, setEscapeError] = React.useState<string | null>(null)
  const [unescapeError, setUnescapeError] = React.useState<string | null>(null)
  const { toast } = useToast()

  // Comprehensive HTML entity map
  const htmlEntities: Record<string, string> = {
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&#39;',
    '\\': '&#92;',
    '©': '&copy;',
    '®': '&reg;',
    '™': '&trade;',
    '€': '&euro;',
    '£': '&pound;',
    '¥': '&yen;',
    '°': '&deg;',
    '±': '&plusmn;',
    '×': '&times;',
    '÷': '&divide;',
    '¼': '&frac14;',
    '½': '&frac12;',
    '¾': '&frac34;',
    '¡': '&iexcl;',
    '¿': '&iquest;',
  }

  const htmlEntityReverse: Record<string, string> = {
    'lt': '<',
    'gt': '>',
    'amp': '&',
    'quot': '"',
    'apos': "'",
    '#39': "'",
    '#92': '\\',
    'copy': '©',
    'reg': '®',
    'trade': '™',
    'euro': '€',
    'pound': '£',
    'yen': '¥',
    'deg': '°',
    'plusmn': '±',
    'times': '×',
    'divide': '÷',
    'frac14': '¼',
    'frac12': '½',
    'frac34': '¾',
    'iexcl': '¡',
    'iquest': '¿',
  }

  // Escape HTML entities with comprehensive support
  React.useEffect(() => {
    setEscapeError(null)
    if (!inputText.trim()) {
      setEscapedText("")
      return
    }

    try {
      // Use DOM API for comprehensive entity escaping
      const tempDiv = document.createElement('div')
      tempDiv.textContent = inputText
      const escaped = tempDiv.innerHTML
      
      // Also handle special characters manually for better control
      const manuallyEscaped = escaped
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
      
      setEscapedText(manuallyEscaped)
    } catch (error) {
      setEscapeError('Failed to escape HTML entities')
      console.error('Escape error:', error)
    }
  }, [inputText])

  // Unescape HTML entities with better error handling
  React.useEffect(() => {
    setUnescapeError(null)
    if (!unescapeInputText.trim()) {
      setUnescapedText("")
      return
    }

    try {
      // Use DOM API for comprehensive unescaping
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = unescapeInputText
      let unescaped = tempDiv.textContent || tempDiv.innerText || ''
      
      // Fallback: manual unescaping for edge cases
      if (!unescaped || unescaped === unescapeInputText) {
        unescaped = unescapeInputText.replace(/&([^;]+);/g, (entity, code) => {
          // Try numeric entities
          if (code.startsWith('#')) {
            const num = code.startsWith('#x') 
              ? parseInt(code.slice(2), 16)
              : parseInt(code.slice(1), 10)
            if (!isNaN(num)) {
              return String.fromCharCode(num)
            }
          }
          // Try named entities
          return htmlEntityReverse[code.toLowerCase()] || entity
        })
      }
      
      setUnescapedText(unescaped)
    } catch (error) {
      setUnescapeError('Invalid HTML entity format. Check for malformed entities.')
      setUnescapedText("")
      console.error('Unescape error:', error)
    }
  }, [unescapeInputText])

  const copyToClipboard = async (text: string, type: 'escape' | 'unescape') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
      toast({
        description: "Copied to clipboard",
        duration: 2000,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to copy to clipboard",
        duration: 2000,
      })
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Escape Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Escape HTML Entities</CardTitle>
            <Badge variant="secondary">{inputText.length} chars</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Your string:</label>
            <Textarea
              placeholder="Enter text to escape (e.g., <div>Hello</div>)..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[120px] md:min-h-[150px] font-mono resize-none"
            />
          </div>
          
          {escapeError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{escapeError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Your string escaped:</label>
              <Badge variant="secondary">{escapedText.length} chars</Badge>
            </div>
            <div className="relative">
              <Textarea 
                readOnly 
                value={escapedText} 
                className="min-h-[120px] md:min-h-[150px] font-mono bg-muted resize-none pr-12" 
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2"
                onClick={() => copyToClipboard(escapedText, 'escape')}
                disabled={!escapedText}
              >
                {copied === 'escape' ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <CopyIcon className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            💡 Auto-escapes as you type. Converts &lt;, &gt;, &amp;, &quot;, and more to HTML entities.
          </p>
        </CardContent>
      </Card>

      {/* Unescape Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Unescape HTML Entities</CardTitle>
            <Badge variant="secondary">{unescapeInputText.length} chars</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Your escaped string:</label>
            <Textarea
              placeholder="Enter HTML entities to unescape (e.g., &lt;div&gt;Hello&lt;/div&gt;)..."
              value={unescapeInputText}
              onChange={(e) => setUnescapeInputText(e.target.value)}
              className="min-h-[120px] md:min-h-[150px] font-mono resize-none"
            />
          </div>
          
          {unescapeError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{unescapeError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Your string unescaped:</label>
              <Badge variant="secondary">{unescapedText.length} chars</Badge>
            </div>
            <div className="relative">
              <Textarea 
                readOnly 
                value={unescapedText} 
                className="min-h-[120px] md:min-h-[150px] font-mono bg-muted resize-none pr-12" 
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2"
                onClick={() => copyToClipboard(unescapedText, 'unescape')}
                disabled={!unescapedText}
              >
                {copied === 'unescape' ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <CopyIcon className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            💡 Auto-unescapes as you type. Supports named entities (&amp;lt;) and numeric entities (&#60;).
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

