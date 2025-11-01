"use client"

import { useCallback, useEffect } from 'react'
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CopyButton } from "@/components/tools/copy-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tab"
import { v1, v3, v4, v5, v6, v7, validate as validateUUID, version as getUUIDVersion } from "uuid"
import { CheckCircle, XCircle, Fingerprint, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type UUIDVersion = "NIL" | "v1" | "v3" | "v4" | "v5" | "v6" | "v7"
type Namespace = "DNS" | "URL" | "OID" | "X500"

const NAMESPACE_UUIDS = {
  DNS: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  URL: "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
  OID: "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
  X500: "6ba7b814-9dad-11d1-80b4-00c04fd430c8",
}

export function UUIDGenerator() {
  const [version, setVersion] = useState<UUIDVersion>("v4")
  const [quantity, setQuantity] = useState(2)
  const [namespace, setNamespace] = useState<Namespace>("URL")
  const [name, setName] = useState("")
  const [uuids, setUuids] = useState<string[]>([])
  
  // Validator state
  const [validateInput, setValidateInput] = useState("")
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [detectedVersion, setDetectedVersion] = useState<string | null>(null)

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

  const handleGenerate = useCallback(() => {
    const newUUIDs = Array(quantity)
      .fill(0)
      .map(() => generateUUID(version))
    setUuids(newUUIDs)
  }, [quantity, version, generateUUID])

  // Add useEffect to generate UUIDs on mount
  useEffect(() => {
    handleGenerate()
  }, [handleGenerate])

  const uuidText = uuids.join("\n")

  const handleValidate = () => {
    if (!validateInput.trim()) {
      setIsValid(null)
      setDetectedVersion(null)
      return
    }

    const valid = validateUUID(validateInput)
    setIsValid(valid)
    
    if (valid) {
      try {
        const ver = getUUIDVersion(validateInput)
        setDetectedVersion(`v${ver}`)
      } catch {
        setDetectedVersion(null)
      }
    } else {
      setDetectedVersion(null)
    }
  }

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Fingerprint className="h-5 w-5 text-primary" />
          </div>
          Generator & Validator
        </CardTitle>
        <CardDescription className="mt-2">
          Choose your preferred version and generate unique identifiers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generate">Generate</TabsTrigger>
              <TabsTrigger value="validate">Validate</TabsTrigger>
            </TabsList>
            
            <TabsContent value="generate" className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">UUID version</label>
            <div className="flex flex-wrap gap-2">
              {(["NIL", "v1", "v3", "v4", "v5", "v6", "v7"] as const).map((ver) => (
                <Button
                  key={ver}
                  variant={version === ver ? "default" : "outline"}
                  size="sm"
                  onClick={() => setVersion(ver)}
                >
                  {ver}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Quantity</label>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                -
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="text-center"
              />
              <Button variant="outline" size="sm" onClick={() => setQuantity(quantity + 1)}>
                +
              </Button>
            </div>
          </div>

          {(version === "v3" || version === "v5") && (
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
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter a name for v3 or v5 UUID"
                />
              </div>
            </>
          )}

          <Textarea 
            value={uuids.join("\n")} 
            readOnly 
            className="font-mono min-h-[120px]" 
            placeholder="Generated UUIDs will appear here..."
          />

          <div className="flex gap-2">
            <Button onClick={handleGenerate} variant="default" size="lg" className="flex-1">
              <RefreshCw className="w-5 h-5 mr-2" />
              Regenerate
            </Button>
            <CopyButton
              text={uuidText}
              successMessage="UUIDs copied to clipboard!"
              variant="outline"
              size="lg"
              disabled={!uuidText}
            />
          </div>
            </TabsContent>
            
            <TabsContent value="validate" className="space-y-4">
              <div className="space-y-3">
                <label className="text-sm font-medium">UUID to Validate</label>
                <div className="flex gap-2">
                  <Input
                    value={validateInput}
                    onChange={(e) => setValidateInput(e.target.value)}
                    placeholder="Enter UUID to validate (e.g., 550e8400-e29b-41d4-a716-446655440000)"
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
                        <div>
                          <p className="font-semibold text-green-600">Valid UUID</p>
                          {detectedVersion && (
                            <p className="text-sm text-muted-foreground">
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
            </TabsContent>
          </Tabs>
      </CardContent>
    </Card>
  )
}

