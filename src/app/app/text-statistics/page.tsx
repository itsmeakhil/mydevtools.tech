"use client"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"



export default function TextStatistics() {
  const [text, setText] = useState("")
  const [stats, setStats] = useState({
    characters: 0,
    words: 0,
    lines: 0,
    bytes: 0,
  })
 
  const [mounted, setMounted] = useState(false)

  // Calculate statistics whenever text changes
  useEffect(() => {
    const characters = text.length
    const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length
    const lines = text === "" ? 0 : text.split(/\r\n|\r|\n/).length
    const bytes = new Blob([text]).size

    setStats({
      characters,
      words,
      lines,
      bytes,
    })
  }, [text])

  // Handle theme mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <div className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
                <div className="p-2 bg-primary/10 rounded-lg shadow-sm">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                Text Statistics
              </CardTitle>
              <CardDescription className="mt-2">
                Get information about a text, the number of characters, the number of words, its size in bytes, ...
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">

          <Textarea
            placeholder="Your text..."
            className="min-h-32 border-primary focus-visible:ring-primary"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-muted-foreground">Character count</p>
              <p className="text-2xl font-medium">{stats.characters}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Word count</p>
              <p className="text-2xl font-medium">{stats.words}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Line count</p>
              <p className="text-2xl font-medium">{stats.lines}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Byte size</p>
              <p className="text-2xl font-medium">{stats.bytes} Bytes</p>
            </div>
          </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

