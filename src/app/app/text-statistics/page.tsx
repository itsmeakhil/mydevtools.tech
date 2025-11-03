"use client"

import { useState, useEffect, useMemo } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Download, Copy, Check } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tab"

interface AdvancedStats {
  charactersNoSpaces: number
  paragraphs: number
  sentences: number
  avgWordsPerSentence: number
  avgCharsPerWord: number
  longestWord: string
  shortestWord: string
  mostCommonWord: string
  readingTime: number // minutes
  speakingTime: number // minutes
}

export default function TextStatistics() {
  const [text, setText] = useState("")
  const [stats, setStats] = useState({
    characters: 0,
    words: 0,
    lines: 0,
    bytes: 0,
  })
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Calculate basic statistics
  useEffect(() => {
    const characters = text.length
    const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).filter(w => w.length > 0).length
    const lines = text === "" ? 0 : text.split(/\r\n|\r|\n/).length
    const bytes = new Blob([text]).size

    setStats({
      characters,
      words,
      lines,
      bytes,
    })
  }, [text])

  // Calculate advanced statistics
  const advancedStats: AdvancedStats | null = useMemo(() => {
    if (!text.trim()) return null

    const charactersNoSpaces = text.replace(/\s/g, '').length
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length || 1
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length
    
    const wordList = text.trim().toLowerCase().match(/\b\w+\b/g) || []
    const avgWordsPerSentence = sentences > 0 ? stats.words / sentences : 0
    const avgCharsPerWord = stats.words > 0 ? stats.characters / stats.words : 0
    
    const longestWord = wordList.reduce((a, b) => a.length > b.length ? a : b, '')
    const shortestWord = wordList.reduce((a, b) => a.length < b.length ? a : b, '')
    
    // Most common word
    const wordFreq: Record<string, number> = {}
    wordList.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1
    })
    const mostCommonWord = Object.entries(wordFreq).reduce((a, b) => 
      wordFreq[a[0]] > wordFreq[b[0]] ? a : b, ['', 0]
    )[0]

    // Reading time (average 200 words per minute)
    const readingTime = stats.words / 200

    // Speaking time (average 150 words per minute)
    const speakingTime = stats.words / 150

    return {
      charactersNoSpaces,
      paragraphs,
      sentences,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
      avgCharsPerWord: Math.round(avgCharsPerWord * 10) / 10,
      longestWord,
      shortestWord,
      mostCommonWord,
      readingTime: Math.round(readingTime * 10) / 10,
      speakingTime: Math.round(speakingTime * 10) / 10,
    }
  }, [text, stats.words, stats.characters])

  const handleExport = () => {
    const exportData = {
      text: text.substring(0, 1000), // Limit text in export
      statistics: {
        basic: stats,
        advanced: advancedStats,
      },
      timestamp: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `text-statistics-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopyStats = async () => {
    const statsText = `Text Statistics:
Characters: ${stats.characters}
Characters (no spaces): ${advancedStats?.charactersNoSpaces || 0}
Words: ${stats.words}
Lines: ${stats.lines}
Paragraphs: ${advancedStats?.paragraphs || 0}
Sentences: ${advancedStats?.sentences || 0}
Bytes: ${stats.bytes}
Reading time: ${advancedStats?.readingTime || 0} minutes
Speaking time: ${advancedStats?.speakingTime || 0} minutes`

    try {
      await navigator.clipboard.writeText(statsText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Silent fail
    }
  }

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
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyStats}
                disabled={!text.trim()}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Stats
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={!text.trim()}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>

            <Textarea
              placeholder="Enter or paste your text here to analyze..."
              className="font-mono min-h-[150px] md:min-h-[200px] resize-none"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Stats</TabsTrigger>
                <TabsTrigger value="advanced">Advanced Stats</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4 text-center border">
                    <p className="text-xs text-muted-foreground mb-1">Characters</p>
                    <p className="text-2xl md:text-3xl font-bold">{stats.characters.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {advancedStats?.charactersNoSpaces || 0} (no spaces)
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center border">
                    <p className="text-xs text-muted-foreground mb-1">Words</p>
                    <p className="text-2xl md:text-3xl font-bold">{stats.words.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Avg {advancedStats?.avgCharsPerWord || 0} chars/word
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center border">
                    <p className="text-xs text-muted-foreground mb-1">Lines</p>
                    <p className="text-2xl md:text-3xl font-bold">{stats.lines.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {advancedStats?.paragraphs || 0} paragraphs
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center border">
                    <p className="text-xs text-muted-foreground mb-1">Size</p>
                    <p className="text-2xl md:text-3xl font-bold">{stats.bytes.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">Bytes</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                {advancedStats ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-lg p-4 border">
                      <p className="text-xs text-muted-foreground mb-1">Sentences</p>
                      <p className="text-2xl font-bold">{advancedStats.sentences}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Avg {advancedStats.avgWordsPerSentence} words/sentence
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 border">
                      <p className="text-xs text-muted-foreground mb-1">Reading Time</p>
                      <p className="text-2xl font-bold">{advancedStats.readingTime} min</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        At 200 words/minute
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 border">
                      <p className="text-xs text-muted-foreground mb-1">Speaking Time</p>
                      <p className="text-2xl font-bold">{advancedStats.speakingTime} min</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        At 150 words/minute
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 border">
                      <p className="text-xs text-muted-foreground mb-1">Longest Word</p>
                      <p className="text-xl font-bold font-mono truncate">{advancedStats.longestWord || '—'}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {advancedStats.longestWord?.length || 0} characters
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 border">
                      <p className="text-xs text-muted-foreground mb-1">Shortest Word</p>
                      <p className="text-xl font-bold font-mono">{advancedStats.shortestWord || '—'}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {advancedStats.shortestWord?.length || 0} characters
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 border">
                      <p className="text-xs text-muted-foreground mb-1">Most Common Word</p>
                      <p className="text-xl font-bold font-mono">{advancedStats.mostCommonWord || '—'}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Most frequent
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Enter text to see advanced statistics
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

