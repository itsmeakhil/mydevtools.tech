"use client"

import * as React from "react"
import { FileSpreadsheet, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type JsonData = Record<string, string | number | boolean | string[]>

export function JsonToCsv() {
    const [jsonInput, setJsonInput] = React.useState("")
    const [previewData, setPreviewData] = React.useState<JsonData[]>([])
    const [headers, setHeaders] = React.useState<string[]>([])
    const [error, setError] = React.useState<string | null>(null)

    const processJson = (jsonString: string) => {
        try {
            if (!jsonString.trim()) {
                setError(null)
                setPreviewData([])
                setHeaders([])
                return
            }

            const parsed = JSON.parse(jsonString)
            const data = Array.isArray(parsed) ? parsed : parsed.users ? parsed.users : [parsed]

            if (data.length > 0) {
                const headers = Object.keys(data[0])
                setHeaders(headers)
                setPreviewData(data)
                setError(null)
            } else {
                setError("The JSON array is empty")
                setPreviewData([])
                setHeaders([])
            }
        } catch {
            setError("Invalid JSON format. Please check your input.")
            setPreviewData([])
            setHeaders([])
        }
    }

    const downloadCsv = () => {
        if (!previewData.length) return

        const csvContent = [
            headers.join(","),
            ...previewData.map((row) =>
                headers
                    .map((header) => {
                        const value = row[header]
                        return Array.isArray(value) ? value.join(";") : String(value)
                    })
                    .join(","),
            ),
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const link = document.createElement("a")
        link.href = URL.createObjectURL(blob)
        link.download = "converted.csv"
        link.click()
    }

    return (
        <Card className="border shadow-lg w-full bg-gradient-to-br from-card to-card/50 backdrop-blur overflow-hidden">
            <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg font-bold">Convert JSON to CSV</CardTitle>
                        <CardDescription className="mt-0.5 text-sm">
                            Convert JSON data to CSV format with a live preview.
                        </CardDescription>
                    </div>
                    <div className="hidden sm:flex items-center justify-center w-9 h-9 bg-primary/10 rounded-full">
                        <FileSpreadsheet className="h-4 w-4 text-primary" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                {/* JSON Input */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-foreground">
                            Your JSON content
                        </label>
                        <span className="text-xs text-muted-foreground">Input</span>
                    </div>
                    <div className="relative">
                        <textarea
                            className={`w-full font-mono text-base sm:text-xs p-3 bg-muted/30 rounded-lg resize-none focus:outline-none border transition-colors min-h-[150px] sm:min-h-[250px] ${error ? 'border-destructive' : 'border-border focus:border-primary/50'
                                }`}
                            value={jsonInput}
                            onChange={(e) => {
                                setJsonInput(e.target.value)
                                processJson(e.target.value)
                            }}
                            placeholder='{"users": [{"name": "John", "age": 30}, {"name": "Jane", "age": 25}]}'
                        />
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-xs text-destructive font-medium">⚠️ {error}</p>
                    </div>
                )}

                {/* Preview and Download */}
                {previewData.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xs font-semibold text-foreground">CSV Preview</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {previewData.length} row{previewData.length !== 1 ? 's' : ''} • {headers.length} column{headers.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                            <Button onClick={downloadCsv} size="sm" className="gap-1.5 h-8 text-xs">
                                <Download className="h-3.5 w-3.5" />
                                Download CSV
                            </Button>
                        </div>

                        <div className="rounded-lg border overflow-auto max-h-[350px] bg-muted/30">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        {headers.map((header) => (
                                            <TableHead key={header} className="font-semibold text-xs h-8">{header}</TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {previewData.map((row, i) => (
                                        <TableRow key={i}>
                                            {headers.map((header) => (
                                                <TableCell key={header} className="font-mono text-xs py-2">
                                                    {Array.isArray(row[header]) ? row[header].join("; ") : String(row[header])}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
