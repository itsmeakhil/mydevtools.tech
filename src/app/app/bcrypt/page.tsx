"use client"

import { useState, useEffect, useCallback } from "react"
import { Copy, Heart, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { hashString, compareStrings } from "./actions"
import type {  CompareResponse } from "./types"
import { useDebouncedCallback } from "use-debounce"

export default function BcryptPage() {
  const { toast } = useToast()
  const [string, setString] = useState("")
  const [saltRounds, setSaltRounds] = useState(10)
  const [hash, setHash] = useState("")
  const [compareString, setCompareString] = useState("")
  const [compareHash, setCompareHash] = useState("")
  const [isMatch, setIsMatch] = useState<boolean | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isHashing, setIsHashing] = useState(false)
  const [isComparing, setIsComparing] = useState(false)

  const handleHash = useCallback(async () => {
    if (!string) {
      setHash("")
      return
    }

    setIsHashing(true)
    try {
      const result = await hashString(string, saltRounds)
      if (result.success && result.hash) {
        setHash(result.hash)
      }
    } finally {
      setIsHashing(false)
    }
  }, [string, saltRounds])

  useEffect(() => {
    handleHash()
  }, [handleHash])

  const handleCompare = useCallback(async () => {
    if (!compareString || !compareHash) {
      setIsMatch(null)
      return
    }

    setIsComparing(true)
    try {
      const result: CompareResponse = await compareStrings(compareString, compareHash)
      if (result.success) {
        setIsMatch(result.isMatch || false)
      } else {
        throw new Error(result.error || "Failed to compare strings")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to compare strings",
        variant: "destructive",
      })
      setIsMatch(null)
    } finally {
      setIsComparing(false)
    }
  }, [compareString, compareHash, toast])

  const debouncedCompare = useDebouncedCallback(async () => {
    await handleCompare()
  }, 500)

  useEffect(() => {
    if (compareString && compareHash) {
      debouncedCompare()
    } else {
      setIsMatch(null)
    }
  }, [compareString, compareHash, debouncedCompare])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(hash)
      toast({
        title: "Copied",
        description: "Hash has been copied to clipboard",
      })
    } catch  {
      toast({
        title: "Error",
        description: "Failed to copy hash to clipboard",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen p-6 ">
      <div className="mx-auto max-w-3xl">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Bcrypt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold">Bcrypt</h1>
              <Button variant="ghost" size="icon" onClick={() => setIsFavorite(!isFavorite)} className="hover:text-primary">
                <Heart className={isFavorite ? "fill-current" : ""} />
              </Button>
            </div>

            <p className="text-muted-foreground">
              Hash and compare text string using bcrypt. Bcrypt is a password-hashing function based on the Blowfish cipher.
            </p>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Hash</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your string:</label>
                    <Input
                      placeholder="Your string to bcrypt..."
                      value={string}
                      onChange={(e) => setString(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Salt rounds:</label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={saltRounds}
                        onChange={(e) => setSaltRounds(Number(e.target.value))}
                        min={4}
                        max={31}
                      />
                      <Button
                        variant="outline"
                        onClick={() => setSaltRounds((prev) => Math.max(4, prev - 1))}
                        disabled={isHashing}
                      >
                        -
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSaltRounds((prev) => Math.min(31, prev + 1))}
                        disabled={isHashing}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Generated hash:</label>
                    <div className="relative">
                      <div className="rounded-md bg-muted p-3 font-mono text-sm break-all min-w-[300px] max-w-full overflow-x-auto">
                        {hash || "Hash will appear here"}
                      </div>
                      {isHashing && (
                        <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      )}
                      {hash && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="secondary" size="icon" onClick={handleCopy} className="absolute right-2 top-2">
                                <Copy className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Copy to clipboard</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Compare string with hash</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your string:</label>
                    <Input
                      placeholder="Your string to compare..."
                      value={compareString}
                      onChange={(e) => setCompareString(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your hash:</label>
                    <Input
                      placeholder="Your hash to compare..."
                      value={compareHash}
                      onChange={(e) => setCompareHash(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Do they match?</span>
                    <span className={isMatch !== null ? (isMatch ? "text-green-500" : "text-red-500") : "text-muted-foreground"}>
                      {isComparing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        isMatch !== null ? (isMatch ? "Yes" : "No") : "Enter values to compare"
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

