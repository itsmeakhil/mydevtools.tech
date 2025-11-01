"use client"

import * as React from "react"
import { Copy, RefreshCw, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tab"
import { useToast } from "../../../hooks/use-toast"
import { useULID } from "./hooks/use-ulid"
import type { ULIDGeneratorProps } from "./types/ulid"
import { Badge } from "@/components/ui/badge"

export default function ULIDGenerator({ initialQuantity = 1 }: ULIDGeneratorProps) {
  const { toast } = useToast()
  const { format, quantity, setFormat, setQuantity, generateIds, getFormattedOutput } = useULID(initialQuantity)
  
  // Validator state
  const [validateInput, setValidateInput] = React.useState("")
  const [isValid, setIsValid] = React.useState<boolean | null>(null)
  const [decodedInfo, setDecodedInfo] = React.useState<{
    timestamp: Date | null;
    timestampMs: number | null;
  } | null>(null)

  React.useEffect(() => {
    generateIds()
  }, [generateIds])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getFormattedOutput())
    toast({
      description: "Copied to clipboard",
      duration: 2000,
    })
  }

  const validateULID = (ulid: string) => {
    // ULID is 26 characters, base32 encoded
    const ulidPattern = /^[0-9A-HJKMNP-TV-Z]{26}$/
    return ulidPattern.test(ulid)
  }

  const decodeULID = (ulid: string) => {
    // ULID structure: 48 bits timestamp + 80 bits randomness
    // First 10 characters are timestamp (48 bits)
    const timestampChars = ulid.substring(0, 10)
    const base32Chars = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
    
    let timestamp = 0
    for (let i = 0; i < 10; i++) {
      const charValue = base32Chars.indexOf(timestampChars[i])
      timestamp = (timestamp * 32) + charValue
    }
    
    return {
      timestamp: new Date(timestamp),
      timestampMs: timestamp
    }
  }

  const handleValidate = () => {
    if (!validateInput.trim()) {
      setIsValid(null)
      setDecodedInfo(null)
      return
    }

    const valid = validateULID(validateInput)
    setIsValid(valid)
    
    if (valid) {
      try {
        const info = decodeULID(validateInput)
        setDecodedInfo(info)
      } catch {
        setDecodedInfo(null)
      }
    } else {
      setDecodedInfo(null)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="justify-center items-center">
        <CardTitle className="text-3xl font-bold tracking-tight">ULID Generator & Validator</CardTitle>
        <CardDescription>
          Generate and validate random Universally Unique Lexicographically Sortable Identifier (ULID).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="validate">Validate</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate" className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              -
            </Button>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
              className="w-20 text-center"
            />
            <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
              +
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Format</Label>
          <ToggleGroup
            type="single"
            value={format}
            onValueChange={(value) => value && setFormat(value as "raw" | "json")}
            className="justify-start"
          >
            <ToggleGroupItem value="raw" aria-label="Raw format">
              Raw
            </ToggleGroupItem>
            <ToggleGroupItem value="json" aria-label="JSON format">
              JSON
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Generated ULID{quantity > 1 ? "s" : ""}</Label>
            <div className="space-x-2">
              <Button variant="secondary" size="sm" onClick={generateIds} className="h-8">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="secondary" size="sm" onClick={handleCopy} className="h-8">
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
          </div>
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <pre className="font-mono text-sm whitespace-pre-wrap break-all">{getFormattedOutput()}</pre>
            </CardContent>
          </Card>
        </div>
          </TabsContent>
          
          <TabsContent value="validate" className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="validate-ulid">ULID to Validate</Label>
              <div className="flex gap-2">
                <Input
                  id="validate-ulid"
                  value={validateInput}
                  onChange={(e) => setValidateInput(e.target.value)}
                  placeholder="Enter ULID to validate (e.g., 01ARZ3NDEKTSV4RRFFQ69G5FAV)"
                  className="font-mono"
                />
                <Button onClick={handleValidate} size="default">
                  Validate
                </Button>
              </div>
            </div>

            {isValid !== null && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 rounded-lg border-2 bg-muted/50">
                  {isValid ? (
                    <>
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <div className="space-y-1">
                        <p className="font-semibold text-green-600">Valid ULID</p>
                        {decodedInfo && decodedInfo.timestamp && (
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>
                              Generated: <Badge variant="secondary">{decodedInfo.timestamp.toLocaleString()}</Badge>
                            </p>
                            <p>
                              Timestamp: <Badge variant="secondary">{decodedInfo.timestampMs} ms</Badge>
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-6 w-6 text-red-600" />
                      <div>
                        <p className="font-semibold text-red-600">Invalid ULID</p>
                        <p className="text-sm text-muted-foreground">
                          The entered string is not a valid ULID format (26 characters, Crockford's base32)
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

