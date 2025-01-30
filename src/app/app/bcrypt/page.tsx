"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
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
  const [hashState, setHashState] = useState<{
    string: string;
    saltRounds: number;
    hash: string | undefined;
  }>({
    string: "",
    saltRounds: 10,
    hash: undefined
  })
  
  const [compareState, setCompareState] = useState({
    string: "",
    hash: "",
    isMatch: null as boolean | null
  })

  const [uiState, setUiState] = useState({
    isFavorite: false,
    isHashing: false,
    isComparing: false
  })

  const showHashLoader = useMemo(() => 
    uiState.isHashing && hashState.string.length > 0, 
    [uiState.isHashing, hashState.string]
  )

  const handleHash = useDebouncedCallback(async (string: string, saltRounds: number) => {
    if (!string) {
      setHashState(prev => ({ ...prev, hash: undefined }))
      return
    }

    setUiState(prev => ({ ...prev, isHashing: true }))
    try {
      const result = await hashString(string, saltRounds)
      if (result.success && result.hash) {
        setHashState(prev => ({ ...prev, hash: result.hash }))
      }
    } finally {
      setUiState(prev => ({ ...prev, isHashing: false }))
    }
  }, 500)

  useEffect(() => {
    handleHash(hashState.string, hashState.saltRounds)
  }, [hashState.string, hashState.saltRounds, handleHash])

  const handleHashChange = (field: keyof typeof hashState, value: string | number) => {
    setHashState(prev => ({ ...prev, [field]: value }))
  }

  const handleCompareChange = (field: keyof typeof compareState, value: string) => {
    setCompareState(prev => ({ ...prev, [field]: value }))
  }

  const handleCompare = useCallback(async () => {
    if (!compareState.string || !compareState.hash) {
      setCompareState(prev => ({ ...prev, isMatch: null }))
      return
    }

    setUiState(prev => ({ ...prev, isComparing: true }))
    try {
      const result: CompareResponse = await compareStrings(compareState.string, compareState.hash)
      if (result.success) {
        setCompareState(prev => ({ ...prev, isMatch: result.isMatch || false }))
      } else {
        throw new Error(result.error || "Failed to compare strings")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to compare strings",
        variant: "destructive",
      })
      setCompareState(prev => ({ ...prev, isMatch: null }))
    } finally {
      setUiState(prev => ({ ...prev, isComparing: false }))
    }
  }, [compareState.string, compareState.hash, toast])

  const debouncedCompare = useDebouncedCallback(async () => {
    await handleCompare()
  }, 500)

  useEffect(() => {
    if (compareState.string && compareState.hash) {
      debouncedCompare()
    } else {
      setCompareState(prev => ({ ...prev, isMatch: null }))
    }
  }, [compareState.string, compareState.hash, debouncedCompare])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(hashState.hash || "")
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

  const SaltRoundsInput = () => (
    <div className="flex items-center space-x-2">
      <Input
        type="number"
        value={hashState.saltRounds}
        onChange={(e) => handleHashChange('saltRounds', Number(e.target.value))}
        min={4}
        max={31}
      />
      <Button
        variant="outline"
        onClick={() => handleHashChange('saltRounds', Math.max(4, hashState.saltRounds - 1))}
        disabled={uiState.isHashing}
      >
        -
      </Button>
      <Button
        variant="outline"
        onClick={() => handleHashChange('saltRounds', Math.min(31, hashState.saltRounds + 1))}
        disabled={uiState.isHashing}
      >
        +
      </Button>
    </div>
  )

  return (
    <div className="min-h-screen p-6 lg:ml-[var(--sidebar-width)]">
      <div className="mx-auto max-w-3xl">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Bcrypt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold">Bcrypt</h1>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setUiState(prev => ({ ...prev, isFavorite: !prev.isFavorite }))}
                className="hover:text-primary"
              >
                <Heart className={uiState.isFavorite ? "fill-current" : ""} />
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
                      value={hashState.string}
                      onChange={(e) => handleHashChange('string', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Salt rounds:</label>
                    <SaltRoundsInput />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Generated hash:</label>
                    <div className="relative">
                      <div className="rounded-md bg-muted p-3 font-mono text-sm break-all min-w-[300px] max-w-full overflow-x-auto">
                        {hashState.hash || "Hash will appear here"}
                      </div>
                      {showHashLoader && (
                        <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      )}
                      {hashState.hash && (
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
                      value={compareState.string}
                      onChange={(e) => handleCompareChange('string', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your hash:</label>
                    <Input
                      placeholder="Your hash to compare..."
                      value={compareState.hash}
                      onChange={(e) => handleCompareChange('hash', e.target.value)}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Do they match?</span>
                    <span className={compareState.isMatch !== null ? (compareState.isMatch ? "text-green-500" : "text-red-500") : "text-muted-foreground"}>
                      {uiState.isComparing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        compareState.isMatch !== null ? (compareState.isMatch ? "Yes" : "No") : "Enter values to compare"
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

