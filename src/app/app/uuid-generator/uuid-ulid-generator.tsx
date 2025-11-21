"use client"

import * as React from "react"
import { useCallback, useEffect } from 'react'
import { useState } from "react"
import { Copy, RefreshCw, CheckCircle, XCircle, Fingerprint } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tab"
import { useToast } from "../../../hooks/use-toast"
import { useULID } from "./hooks/use-ulid"
import { Badge } from "@/components/ui/badge"
import { v1, v3, v4, v5, v6, v7, validate as validateUUID, version as getUUIDVersion } from "uuid"

type UUIDVersion = "NIL" | "v1" | "v3" | "v4" | "v5" | "v6" | "v7"
type Namespace = "DNS" | "URL" | "OID" | "X500"

const NAMESPACE_UUIDS = {
  DNS: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  URL: "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
  OID: "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
  X500: "6ba7b814-9dad-11d1-80b4-00c04fd430c8",
}

interface UUIDULIDGeneratorProps {
  defaultType?: "uuid" | "ulid"
}

export function UUIDULIDGenerator({ defaultType = "uuid" }: UUIDULIDGeneratorProps = {}) {
  const { toast } = useToast()
  const [generatorType, setGeneratorType] = useState<"uuid" | "ulid">(defaultType)

  // UUID State
  const [uuidVersion, setUuidVersion] = useState<UUIDVersion>("v4")
  const [uuidQuantity, setUuidQuantity] = useState(2)
  const [namespace, setNamespace] = useState<Namespace>("URL")
  const [name, setName] = useState("")
  const [uuids, setUuids] = useState<string[]>([])
  const [uuidValidateInput, setUuidValidateInput] = useState("")
  const [uuidIsValid, setUuidIsValid] = useState<boolean | null>(null)
  const [detectedVersion, setDetectedVersion] = useState<string | null>(null)

  // ULID State
  const { format, quantity, setFormat, setQuantity, generateIds, getFormattedOutput } = useULID(1)
  const [ulidValidateInput, setUlidValidateInput] = useState("")
  const [ulidIsValid, setUlidIsValid] = useState<boolean | null>(null)
  const [decodedInfo, setDecodedInfo] = useState<{
    timestamp: Date | null;
    timestampMs: number | null;
  } | null>(null)

  // UUID Functions
  const generateUUID = useCallback((version: UUIDVersion): string => {
    switch (version) {
      case "NIL":
        return "00000000-0000-0000-0000-000000000000"
      case "v1":
        return v1()
      case "v3":
        return v3(name, NAMESPACE_UUIDS[namespace])
      case "v4":
        return v4()
      case "v5":
        return v5(name, NAMESPACE_UUIDS[namespace])
      case "v6":
        return v6()
      case "v7":
        return v7()
      default:
        return v4()
    }
  }, [name, namespace])

  const handleGenerateUUID = useCallback(() => {
    const newUUIDs = Array(uuidQuantity)
      .fill(0)
      .map(() => generateUUID(uuidVersion))
    setUuids(newUUIDs)
  }, [uuidQuantity, uuidVersion, generateUUID])

  useEffect(() => {
    if (generatorType === "uuid") {
      handleGenerateUUID()
    } else {
      generateIds()
    }
  }, [generatorType, handleGenerateUUID, generateIds])

  const uuidText = uuids.join("\n")

  const handleValidateUUID = () => {
    if (!uuidValidateInput.trim()) {
      setUuidIsValid(null)
      setDetectedVersion(null)
      return
    }

    const valid = validateUUID(uuidValidateInput)
    setUuidIsValid(valid)

    if (valid) {
      try {
        const ver = getUUIDVersion(uuidValidateInput)
        setDetectedVersion(`v${ver}`)
      } catch {
        setDetectedVersion(null)
      }
    } else {
      setDetectedVersion(null)
    }
  }

  const handleCopyUUID = async () => {
    await navigator.clipboard.writeText(uuidText)
    toast({
      description: "Copied to clipboard",
      duration: 2000,
    })
  }

  // ULID Functions
  const handleCopyULID = async () => {
    await navigator.clipboard.writeText(getFormattedOutput())
    toast({
      description: "Copied to clipboard",
      duration: 2000,
    })
  }

  const validateULID = (ulid: string) => {
    const ulidPattern = /^[0-9A-HJKMNP-TV-Z]{26}$/
    return ulidPattern.test(ulid)
  }

  const decodeULID = (ulid: string) => {
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

  const handleValidateULID = () => {
    if (!ulidValidateInput.trim()) {
      setUlidIsValid(null)
      setDecodedInfo(null)
      return
    }

    const valid = validateULID(ulidValidateInput)
    setUlidIsValid(valid)

    if (valid) {
      try {
        const info = decodeULID(ulidValidateInput)
        setDecodedInfo(info)
      } catch {
        setDecodedInfo(null)
      }
    } else {
      setDecodedInfo(null)
    }
  }

  return (
    <Card className="border-2 shadow-lg w-full max-w-5xl mx-auto">
      <CardHeader>
        <div className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
            <div className="p-2 bg-primary/10 rounded-lg shadow-sm">
              <Fingerprint className="h-5 w-5 text-primary" />
            </div>
            ID Generator & Validator
          </CardTitle>
          <CardDescription>
            Generate and validate unique identifiers for your projects
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>ID Type</Label>
          <ToggleGroup
            type="single"
            value={generatorType}
            onValueChange={(value) => value && setGeneratorType(value as "uuid" | "ulid")}
            className="justify-start"
          >
            <ToggleGroupItem value="uuid" aria-label="UUID">
              UUID
            </ToggleGroupItem>
            <ToggleGroupItem value="ulid" aria-label="ULID">
              ULID
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="validate">Validate</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4">
            {generatorType === "uuid" ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">UUID version</label>
                  <div className="flex flex-wrap gap-2">
                    {(["NIL", "v1", "v3", "v4", "v5", "v6", "v7"] as const).map((ver) => (
                      <Button
                        key={ver}
                        variant={uuidVersion === ver ? "default" : "outline"}
                        size="sm"
                        onClick={() => setUuidVersion(ver)}
                      >
                        {ver}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="uuid-quantity">Quantity</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setUuidQuantity(Math.max(1, uuidQuantity - 1))}
                      disabled={uuidQuantity <= 1}
                    >
                      -
                    </Button>
                    <Input
                      id="uuid-quantity"
                      type="number"
                      min="1"
                      value={uuidQuantity}
                      onChange={(e) => setUuidQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                      className="w-20 text-center"
                    />
                    <Button variant="outline" size="icon" onClick={() => setUuidQuantity(uuidQuantity + 1)}>
                      +
                    </Button>
                  </div>
                </div>

                {(uuidVersion === "v3" || uuidVersion === "v5") && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Namespace</label>
                      <div className="flex flex-wrap gap-2">
                        {(["DNS", "URL", "OID", "X500"] as const).map((ns) => (
                          <Button
                            key={ns}
                            variant={namespace === ns ? "default" : "outline"}
                            size="sm"
                            onClick={() => setNamespace(ns)}
                          >
                            {ns}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="uuid-name">Name</Label>
                      <Input
                        id="uuid-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter a name for v3 or v5 UUID"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Generated UUID{uuidQuantity > 1 ? "s" : ""}</Label>
                    <div className="space-x-2">
                      <Button variant="secondary" size="sm" onClick={handleGenerateUUID} className="h-8">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                      </Button>
                      <Button variant="secondary" size="sm" onClick={handleCopyUUID} className="h-8">
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                  </div>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="font-mono text-sm whitespace-pre-wrap break-all">{uuidText || "Generated UUIDs will appear here..."}</pre>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="ulid-quantity">Quantity</Label>
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
                      id="ulid-quantity"
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
                      <Button variant="secondary" size="sm" onClick={handleCopyULID} className="h-8">
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
              </>
            )}
          </TabsContent>

          <TabsContent value="validate" className="space-y-6">
            {generatorType === "uuid" ? (
              <>
                <div className="space-y-3">
                  <Label htmlFor="validate-uuid">UUID to Validate</Label>
                  <div className="flex gap-2">
                    <Input
                      id="validate-uuid"
                      value={uuidValidateInput}
                      onChange={(e) => setUuidValidateInput(e.target.value)}
                      placeholder="Enter UUID to validate (e.g., 550e8400-e29b-41d4-a716-446655440000)"
                      className="font-mono"
                    />
                    <Button onClick={handleValidateUUID} size="default">
                      Validate
                    </Button>
                  </div>
                </div>

                {uuidIsValid !== null && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 rounded-lg border-2 bg-muted/50">
                      {uuidIsValid ? (
                        <>
                          <CheckCircle className="h-6 w-6 text-green-600" />
                          <div>
                            <p className="font-semibold text-green-600">Valid UUID</p>
                            {detectedVersion && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Detected version: <Badge variant="secondary">{detectedVersion}</Badge>
                              </p>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-6 w-6 text-red-600" />
                          <div>
                            <p className="font-semibold text-red-600">Invalid UUID</p>
                            <p className="text-sm text-muted-foreground">
                              The entered string is not a valid UUID format
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="space-y-3">
                  <Label htmlFor="validate-ulid">ULID to Validate</Label>
                  <div className="flex gap-2">
                    <Input
                      id="validate-ulid"
                      value={ulidValidateInput}
                      onChange={(e) => setUlidValidateInput(e.target.value)}
                      placeholder="Enter ULID to validate (e.g., 01ARZ3NDEKTSV4RRFFQ69G5FAV)"
                      className="font-mono"
                    />
                    <Button onClick={handleValidateULID} size="default">
                      Validate
                    </Button>
                  </div>
                </div>

                {ulidIsValid !== null && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 rounded-lg border-2 bg-muted/50">
                      {ulidIsValid ? (
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
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

