"use client"

import * as React from "react"
import { FileSpreadsheet, Copy, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export function CsvToJson() {
    const [csvInput, setCsvInput] = React.useState("")
    const [jsonOutput, setJsonOutput] = React.useState("")
    const [error, setError] = React.useState<string | null>(null)

    const processCsv = (csvString: string) => {
        try {
            if (!csvString.trim()) {
                setError(null)
                setJsonOutput("")
                return
            }

            // Parse CSV
            const lines = csvString.trim().split("\n")
            if (lines.length < 2) {
                setError("CSV must have at least a header row and one data row")
                setJsonOutput("")
                return
            }

            // Get headers from first line
            const headers = lines[0].split(",").map(h => h.trim())

            // Parse data rows
            const data = lines.slice(1).map(line => {
                const values = line.split(",").map(v => v.trim())
                const obj: Record<string, string> = {}

                headers.forEach((header, index) => {
                    obj[header] = values[index] || ""
                })

                return obj
            })

            setJsonOutput(JSON.stringify(data, null, 2))
            setError(null)
        } catch (err) {
            setError("Invalid CSV format. Please check your input.")
            setJsonOutput("")
        }
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(jsonOutput)
            toast.success("Copied to clipboard")
        } catch {
            toast.error("Failed to copy to clipboard")
        }
    }

    return (
        <Card className="border shadow-lg w-full bg-gradient-to-br from-card to-card/50 backdrop-blur overflow-hidden">
            <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg font-bold">Convert CSV to JSON</CardTitle>
                        <CardDescription className="mt-0.5 text-sm">
                            Convert CSV data to JSON format.
                        </CardDescription>
                    </div>
                    <div className="hidden sm:flex items-center justify-center w-9 h-9 bg-primary/10 rounded-full">
                        <ArrowRight className="h-4 w-4 text-primary" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <div className="grid gap-4 lg:grid-cols-2">
                    {/* Input Section */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-foreground">
                                Your CSV content
                            </label>
                            <span className="text-xs text-muted-foreground">Input</span>
                        </div>
                        <Textarea
                            placeholder="name,age,city&#10;John,30,New York&#10;Jane,25,London"
                            className="font-mono text-xs min-h-[400px] resize-none border focus:border-primary/50 bg-muted/30 transition-colors"
                            value={csvInput}
                            onChange={(e) => {
                                setCsvInput(e.target.value)
                                processCsv(e.target.value)
                            }}
                        />
                    </div>

                    {/* Output Section */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-foreground">
                                Converted JSON
                            </label>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Output</span>
                                {jsonOutput && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCopy}
                                        className="h-7 gap-1 text-xs"
                                    >
                                        <Copy className="h-3 w-3" />
                                        Copy
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="relative">
                            <Textarea
                                readOnly
                                placeholder="Enter your CSV to see the JSON conversion"
                                className={`font-mono text-xs min-h-[400px] resize-none border bg-muted/30 ${error ? 'border-destructive text-destructive' : 'border-border'
                                    }`}
                                value={error || jsonOutput}
                            />
                            {error && (
                                <div className="absolute bottom-3 left-3 right-3 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
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
