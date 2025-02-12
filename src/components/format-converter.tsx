"use client"

import * as React from "react"
import { Copy, Heart } from "lucide-react"
// import { useTheme } from "next-themes"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { converters } from "../lib/converters"
import type { ConversionType, ConversionConfig } from "../app/app/types/converter"

interface FormatConverterProps {
  type: ConversionType
  config: ConversionConfig
}

export function FormatConverter({ type, config }: FormatConverterProps) {
  const [input, setInput] = React.useState("")
  const [output, setOutput] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
//   const { theme } = useTheme()

  const handleConversion = React.useCallback(() => {
    if (!input.trim()) {
      setOutput("")
      setError(null)
      return
    }

    try {
      const converter = converters[type]
      const result = converter(input)
      setOutput(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed")
      setOutput("")
    }
  }, [input, type])

  React.useEffect(() => {
    handleConversion()
  }, [handleConversion])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output)
      toast.success("Copied to clipboard")
    } catch  {
      toast.error("Failed to copy to clipboard")
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-8">
        <div>
          <CardTitle className="text-2xl font-bold">{config.title}</CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </div>
        <Button variant="ghost" size="icon">
          <Heart className="h-4 w-4" />
          <span className="sr-only">Add to favorites</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {config.inputLabel}
            </label>
            <Textarea
              placeholder={config.inputPlaceholder}
              className="font-mono min-h-[400px] resize-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mt-2">
                {config.outputLabel}
              </label>
              {output && (
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              )}
            </div>
            <Textarea
              readOnly
              placeholder={config.outputPlaceholder}
              className="font-mono min-h-[400px] resize-none"
              value={error || output}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
