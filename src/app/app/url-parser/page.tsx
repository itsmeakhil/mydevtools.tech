"use client"

import * as React from "react"
import { Link2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

interface ParsedUrl {
  protocol: string
  username: string
  password: string
  hostname: string
  port: string
  path: string
  params: string
  paramPairs: { key: string; value: string }[]
}

export default function UrlParser() {
  const [url, setUrl] = React.useState("https://me:pwd@it-tools.tech:3000/url-parser?key1=value&key2=value2#the-hash")
  const [parsedUrl, setParsedUrl] = React.useState<ParsedUrl>({
    protocol: "",
    username: "",
    password: "",
    hostname: "",
    port: "",
    path: "",
    params: "",
    paramPairs: [],
  })

  const parseUrl = React.useCallback((urlString: string) => {
    try {
      const url = new URL(urlString)
      const [username, password] = url.username ? [url.username, url.password] : ["", ""]
      const params = url.search.substring(1)
      const paramPairs = params
        .split("&")
        .filter(Boolean)
        .map((pair) => {
          const [key, value] = pair.split("=")
          return { key: key || "", value: value || "" }
        })

      setParsedUrl({
        protocol: url.protocol.replace(":", ""),
        username,
        password,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        params,
        paramPairs,
      })
    } catch {
      toast.error("Invalid URL format")
    }
  }, [])

  React.useEffect(() => {
    parseUrl(url)
  }, [url, parseUrl])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <div className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
                <div className="p-2 bg-primary/10 rounded-lg shadow-sm">
                  <Link2 className="h-5 w-5 text-primary" />
                </div>
                URL Parser
              </CardTitle>
              <CardDescription className="mt-2">
                Parse a URL into its separate constituent parts (protocol, origin, params, port, username-password, ...)
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="url">Your url to parse:</Label>
              <Input id="url" value={url} onChange={(e) => setUrl(e.target.value)} className="font-mono" />
            </div>

            {Object.entries(parsedUrl).map(([key, value]) => {
              if (key === "paramPairs") return null
              return (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key} className="capitalize">
                    {key}
                  </Label>
                  <div className="flex gap-2">
                    <Input id={key} value={value} readOnly className="font-mono bg-muted" />
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(value)}>
                      <span className="sr-only">Copy {key}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                      </svg>
                    </Button>
                  </div>
                </div>
              )
            })}

            {parsedUrl.paramPairs.length > 0 && (
              <div className="space-y-4">
                {parsedUrl.paramPairs.map((pair, index) => (
                  <div key={index} className="grid grid-cols-2 items-center gap-2">
                    <div className="flex gap-2">
                      <Input value={pair.key} readOnly className="font-mono bg-muted" />
                      <Button variant="outline" size="icon" onClick={() => copyToClipboard(pair.key)}>
                        <span className="sr-only">Copy key</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                        </svg>
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Input value={pair.value} readOnly className="font-mono bg-muted" />
                      <Button variant="outline" size="icon" onClick={() => copyToClipboard(pair.value)}>
                        <span className="sr-only">Copy value</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

