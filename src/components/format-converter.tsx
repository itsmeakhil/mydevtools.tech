"use client"

import * as React from "react"
import { Copy, ArrowRight } from "lucide-react"
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
    } catch {
      toast.error("Failed to copy to clipboard")
    }
  }

  return (
    <Card className="border-2 shadow-xl w-full bg-gradient-to-br from-card to-card/50 backdrop-blur overflow-hidden">
      <CardHeader className="pb-6 bg-gradient-to-r from-primary/5 to-primary/10 border-b">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl font-bold">{config.title}</CardTitle>
            <CardDescription className="mt-1.5 text-base">{config.description}</CardDescription>
          </div>
          <div className="hidden sm:flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
            <ArrowRight className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground">
                {config.inputLabel}
              </label>
              <span className="text-xs text-muted-foreground">Input</span>
            </div>
            <div className="relative">
              <Textarea
                placeholder={config.inputPlaceholder}
                className="font-mono text-sm min-h-[500px] resize-none border-2 focus:border-primary/50 bg-muted/30 transition-colors"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>
          </div>

          {/* Output Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground">
                {config.outputLabel}
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Output</span>
                {output && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="h-8 gap-1.5"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </Button>
                )}
              </div>
            </div>
            <div className="relative">
              <Textarea
                readOnly
                placeholder={config.outputPlaceholder}
                className={`font-mono text-sm min-h-[500px] resize-none border-2 bg-muted/30 ${error ? 'border-destructive text-destructive' : 'border-border'
                  }`}
                value={error || output}
              />
              {error && (
                <div className="absolute bottom-4 left-4 right-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-xs text-destructive font-medium">⚠️ Conversion Error</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
