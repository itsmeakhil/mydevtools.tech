"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, Link2, Sparkles, QrCode, ExternalLink, Check, History, X, Download, BarChart3, Share2, Calendar, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tab"
import { toast } from "sonner"

interface UrlHistory {
  id: string
  longUrl: string
  shortUrl: string
  createdAt: string
  clicks?: number
}

const HISTORY_STORAGE_KEY = 'url-shortener-history'
const MAX_HISTORY_ITEMS = 50

export default function UrlShortener() {
  const [longUrl, setLongUrl] = useState("")
  const [alias, setAlias] = useState("")
  const [shortUrl, setShortUrl] = useState("")
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [history, setHistory] = useState<UrlHistory[]>([])
  const [activeTab, setActiveTab] = useState("shorten")

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY)
      if (stored) {
        setHistory(JSON.parse(stored))
      }
    } catch (error) {
      console.error("Error loading history:", error)
    }
  }, [])

  // Save history to localStorage
  const saveToHistory = (longUrl: string, shortUrl: string) => {
    const newItem: UrlHistory = {
      id: Date.now().toString(),
      longUrl,
      shortUrl,
      createdAt: new Date().toISOString(),
      clicks: 0,
    }

    const updatedHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS)
    setHistory(updatedHistory)
    
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory))
    } catch (error) {
      console.error("Error saving history:", error)
    }
  }

  // Delete from history
  const deleteFromHistory = (id: string) => {
    const updatedHistory = history.filter(item => item.id !== id)
    setHistory(updatedHistory)
    
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory))
      toast.success("Removed from history")
    } catch (error) {
      console.error("Error deleting from history:", error)
    }
  }

  // Clear all history
  const clearAllHistory = () => {
    setHistory([])
    localStorage.removeItem(HISTORY_STORAGE_KEY)
    toast.success("History cleared")
  }

  // Auto-detect clipboard content
  const handlePasteDetection = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText()
      if (clipboardText && 
          !clipboardText.includes('\n') && 
          (clipboardText.startsWith('http://') || 
           clipboardText.startsWith('https://') ||
           clipboardText.includes('.'))) {
        setLongUrl(clipboardText)
        toast.info("Pasted from clipboard")
      } else {
        toast.info("No valid URL found in clipboard")
      }
    } catch (error) {
      toast.error("Could not access clipboard")
    }
  }

  // Enhanced URL validation
  const isValidUrl = (url: string): boolean => {
    try {
      // Check if it's a basic URL pattern
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
      return urlPattern.test(url) || url.startsWith('http://') || url.startsWith('https://')
    } catch {
      return false
    }
  }

  const shortenUrl = async () => {
    if (!longUrl) {
      setError("Please enter a valid URL")
      toast.error("URL is required")
      return
    }

    // Validate URL format
    if (!isValidUrl(longUrl)) {
      setError("Please enter a valid URL (e.g., example.com or https://example.com)")
      toast.error("Invalid URL format")
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
      
      // Save to history
      saveToHistory(normalizedUrl, data.short_url)
      
      // Show success toast
      toast.success("URL shortened successfully!")
      
      // Auto-focus result section
      setTimeout(() => {
        document.getElementById('shortened-result')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (error) {
      console.log(error)
      setError("The alias might be unavailable, try another one!")
      toast.error("Failed to shorten URL. Please try again.")
    } finally {
      setLoading(false)
    }
  } 

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success("Copied to clipboard!")
    } catch (err) {
      console.error(err)
      toast.error("Failed to copy URL")
    }
  }

  const copyFromHistory = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Copied to clipboard!")
    } catch (err) {
      toast.error("Failed to copy URL")
    }
  }

  const downloadQRCode = () => {
    const qrUrl = generateQRCode()
    if (!qrUrl) return
    
    const link = document.createElement('a')
    link.href = qrUrl
    link.download = `qr-code-${Date.now()}.png`
    link.click()
    toast.success("QR code downloaded!")
  }

  const generateQRCode = () => {
    if (!shortUrl) return ""
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shortUrl)}`
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      shortenUrl()
    }
    // Keyboard shortcuts for tabs
    if (e.ctrlKey || e.metaKey) {
      if (e.key === '1') {
        e.preventDefault()
        setActiveTab("shorten")
      } else if (e.key === '2') {
        e.preventDefault()
        setActiveTab("history")
      }
    }
  }

  return (
    <>
      {/* Main Form Card */}
      <Card className={`border-2 shadow-lg transition-all duration-300 ${isFocused ? 'ring-2 ring-primary/20' : ''}`}>
        <CardHeader className="text-center">
          <div className="flex items-center justify-between">
            <CardTitle className="flex-1 flex items-center justify-center gap-2 text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              <div className="p-2 bg-primary/10 rounded-lg shadow-sm">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              URL Shortener
            </CardTitle>
            {history.length > 0 && (
              <Badge variant="secondary" className="ml-4">
                <History className="w-3 h-3 mr-1" />
                {history.length}
              </Badge>
            )}
          </div>
          <CardDescription className="text-center">
            Enter a long URL and get a short, shareable link instantly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="shorten">
                Shorten URL
                <span className="hidden md:inline text-xs ml-2 opacity-50">Ctrl+1</span>
              </TabsTrigger>
              <TabsTrigger value="history">
                History {history.length > 0 && `(${history.length})`}
                <span className="hidden md:inline text-xs ml-2 opacity-50">Ctrl+2</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="shorten" className="space-y-6 mt-6">
              {/* URL Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="url" className="flex items-center gap-2">
                    <Link2 className="h-4 w-4" />
                    Long URL
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePasteDetection}
                    className="h-7 text-xs"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Auto-paste
                  </Button>
                </div>
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
                      Press Enter to shorten or try auto-paste from clipboard
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
                <div id="shortened-result" className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
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
                                QR
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>QR Code</DialogTitle>
                                <DialogDescription>
                                  Scan this QR code to open your shortened URL
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="flex items-center justify-center p-6 bg-muted rounded-lg">
                                  <Image 
                                    src={generateQRCode()} 
                                    alt="QR Code" 
                                    width={250}
                                    height={250}
                                    className="w-full max-w-[250px]"
                                  />
                                </div>
                                <Button onClick={downloadQRCode} className="w-full">
                                  <Download className="w-4 h-4 mr-2" />
                                  Download QR Code
                                </Button>
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

                      {/* Share Button */}
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={copyToClipboard}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Link
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              {history.length === 0 ? (
                <div className="text-center py-12">
                  <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No history yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your shortened URLs will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium">
                      Recent URLs ({history.length})
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllHistory}
                    >
                      Clear All
                    </Button>
                  </div>
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-lg border-2 bg-card hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-2">
                            <Link2 className="w-4 h-4 text-primary flex-shrink-0" />
                            <a
                              href={item.shortUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-mono hover:underline break-all"
                            >
                              {item.shortUrl}
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                            <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                            <p className="text-xs text-muted-foreground truncate">
                              {item.longUrl}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(item.createdAt).toLocaleDateString()}
                            </div>
                            {item.clicks !== undefined && (
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {item.clicks} clicks
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyFromHistory(item.shortUrl)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteFromHistory(item.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  )
}

