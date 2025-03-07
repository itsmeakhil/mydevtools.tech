"use client"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"


export default function TextStatistics() {
  const [text, setText] = useState("")
  const [stats, setStats] = useState({
    characters: 0,
    words: 0,
    lines: 0,
    bytes: 0,
  })
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [favorite, setFavorite] = useState(false)

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
    <div className="min-h-screen flex flex-col items-center m-10 p-4 transition-colors bg-background">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-4xl font-bold text-foreground">Text statistics</h1>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => setFavorite(!favorite)} className="rounded-full">
                <Heart className={`h-5 w-5 ${favorite ? "fill-primary" : ""}`} />
              </Button>
            </div>
          </div>

          <p className="text-muted-foreground mb-6">
            Get information about a text, the number of characters, the number of words, its size in bytes, ...
          </p>

          <Textarea
            placeholder="Your text..."
            className="min-h-32 mb-6 border-primary focus-visible:ring-primary"
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
  )
}

