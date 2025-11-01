"use client"

import { useState } from "react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, Link2, Sparkles, QrCode, ExternalLink, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function UrlShortener() {
  const [longUrl, setLongUrl] = useState("")
  const [alias, setAlias] = useState("")
  const [shortUrl, setShortUrl] = useState("")
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const shortenUrl = async () => {
    if (!longUrl) {
      setError("Please enter a valid URL")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Normalize URL - add https:// if missing
      let normalizedUrl = longUrl.trim()
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl
      }

      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ long_url: normalizedUrl, alias }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error("The alias might be unavailable, try another one!")
      }

      setShortUrl(data.short_url)
      setError("")
    } catch (error) {
      console.log(error)
      setError("The alias might be unavailable, try another one!")      
    } finally {
      setLoading(false)
    }
  } 

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error(err)
      setError("Failed to copy URL")
    }
  }

  const generateQRCode = () => {
    if (!shortUrl) return ""
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shortUrl)}`
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      shortenUrl()
    }
  }

  return (
    <>
      {/* Main Form Card */}
      <Card className={`border-2 shadow-lg transition-all duration-300 ${isFocused ? 'ring-2 ring-primary/20' : ''}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            Shorten Your URL
          </CardTitle>
          <CardDescription>
            Enter a long URL and get a short, shareable link instantly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="url" className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Long URL
            </Label>
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com/very/long/url"
                  value={longUrl}
                  onChange={(e) => {
                    setLongUrl(e.target.value)
                    setError("")
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyDown={handleKeyDown}
                  className="text-base h-12 border-2 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <p className="text-xs text-muted-foreground mt-1 ml-1">
                  Press Enter to shorten
                </p>
              </div>
            </div>
          </div>

          {/* Alias Input */}
          <div className="space-y-2">
            <Label htmlFor="alias" className="text-sm font-medium">
              Custom Alias <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="alias"
              placeholder="my-custom-link"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-12 border-2"
            />
            <p className="text-xs text-muted-foreground ml-1">
              Create a memorable shortened link
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="animate-in fade-in-50">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Shorten Button */}
          <Button 
            onClick={shortenUrl}
            disabled={loading || !longUrl.trim()}
            size="lg"
            className="w-full h-12 shadow-md hover:shadow-lg transition-all duration-200"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Shortening...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Shorten URL
              </>
            )}
          </Button>

          {/* Result Section */}
          {shortUrl && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="border-t pt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="gap-2">
                      <Check className="h-3.5 w-3.5" />
                      Success!
                    </Badge>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={copyToClipboard}>
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                          </>
                        )}
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <QrCode className="w-4 h-4 mr-2" />
                            QR Code
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>QR Code</DialogTitle>
                            <DialogDescription>
                              Scan this QR code to open your shortened URL
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex items-center justify-center p-6 bg-muted rounded-lg">
                            <Image 
                              src={generateQRCode()} 
                              alt="QR Code" 
                              width={250}
                              height={250}
                              className="w-full max-w-[250px]"
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {/* Original URL */}
                  <div className="p-4 bg-muted/50 rounded-lg border border-border">
                    <div className="flex items-start gap-3">
                      <ExternalLink className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">Original URL</p>
                        <p className="text-sm break-all line-clamp-2">{longUrl}</p>
                      </div>
                    </div>
                  </div>

                  {/* Shortened URL */}
                  <div className="p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
                    <div className="flex items-center gap-3">
                      <Link2 className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-primary mb-1">Shortened URL</p>
                        <a
                          href={shortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-base font-mono break-all hover:underline block"
                        >
                          {shortUrl}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

