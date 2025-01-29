"use client"

import * as React from "react"
import { Copy, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useToast } from "../../../../hooks/use-toast"
import { useULID } from "./hooks/use-ulid"
import type { ULIDGeneratorProps } from "./types/ulid"

export default function ULIDGenerator({ initialQuantity = 1 }: ULIDGeneratorProps) {
  const { toast } = useToast()
  const { format, quantity, setFormat, setQuantity, generateIds, getFormattedOutput } = useULID(initialQuantity)

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

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl font-bold tracking-tight">ULID generator</CardTitle>
        <CardDescription>
          Generate random Universally Unique Lexicographically Sortable Identifier (ULID).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
      </CardContent>
    </Card>
  )
}

