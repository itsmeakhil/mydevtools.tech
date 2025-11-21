"use client"

import * as React from "react"
import { FileSpreadsheet, Copy } from "lucide-react"
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
        <Card className="border-2 shadow-lg w-full">
            <CardHeader>
                <div className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
                        <div className="p-2 bg-primary/10 rounded-lg shadow-sm">
                            <FileSpreadsheet className="h-5 w-5 text-primary" />
                        </div>
                        Convert CSV to JSON
                    </CardTitle>
                    <CardDescription className="mt-2">
                        Convert CSV data to JSON format.
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Your CSV content
                        </label>
                        <Textarea
                            placeholder="name,age,city&#10;John,30,New York&#10;Jane,25,London"
                            className="font-mono min-h-[470px] resize-none"
                            value={csvInput}
                            onChange={(e) => {
                                setCsvInput(e.target.value)
                                processCsv(e.target.value)
                            }}
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Converted JSON
                            </label>
                            {jsonOutput && (
                                <Button variant="ghost" size="sm" onClick={handleCopy}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy
                                </Button>
                            )}
                        </div>
                        <Textarea
                            readOnly
                            placeholder="Enter your CSV to see the JSON conversion"
                            className="font-mono min-h-[470px] resize-none"
                            value={error || jsonOutput}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
