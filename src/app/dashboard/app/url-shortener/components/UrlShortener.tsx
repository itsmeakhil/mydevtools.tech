"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CopyIcon } from "lucide-react"

export default function UrlShortener() {
  const [longUrl, setLongUrl] = useState("")
  const [alias, setAlias] = useState("")
  const [shortUrl, setShortUrl] = useState("")
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const shortenUrl = async () => {
    if (!longUrl) {
      setError("Please enter a valid URL")
      return
    }

    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ long_url: longUrl, alias }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Modify data.error to your custom message
        const customErrorMessage = "The alias might be unavailable, try another one!";

  
        throw new Error(customErrorMessage)
      }

      setShortUrl(data.short_url)
      setError("")
    } catch (error) {
      setError(error.message)
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

  return (
    <Card className="max-w-xl mx-auto">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="url">Enter your URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://your-long-url.com"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="alias">Custom alias (optional)</Label>
            <Input id="alias" placeholder="Custom alias" value={alias} onChange={(e) => setAlias(e.target.value)} />
          </div>
          <Button onClick={shortenUrl} className="w-full">
            Shorten
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {shortUrl && (
            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                  Your shortened URL
                </span>
                <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                  <CopyIcon className="w-4 h-4 mr-2" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 break-all"
              >
                {shortUrl}
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

