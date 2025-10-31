"use client"

import { useCallback, useEffect } from 'react'
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { ToolHeader } from "@/components/tools/tool-header"
import { CopyButton } from "@/components/tools/copy-button"
import { v1, v3, v4, v5, v6, v7 } from "uuid"

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

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <Card className="max-w-4xl mx-auto">
        <ToolHeader
          title="UUIDs generator"
          description="Generate Universally Unique Identifiers (UUIDs) of various versions."
          toolId="0-0"
        />
        <CardContent className="space-y-4">
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

          <Textarea value={uuids.join("\n")} readOnly className="font-mono h-24" />

          <div className="flex gap-2">
            <Button onClick={handleGenerate} variant="default" size="sm">
              Regenerate
            </Button>
            <CopyButton
              text={uuidText}
              successMessage="UUIDs copied to clipboard!"
              variant="outline"
              size="sm"
              disabled={!uuidText}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

