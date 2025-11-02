"use client"

import * as React from "react"
import { FileSpreadsheet } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type JsonData = Record<string, string | number | boolean | string[]>

export default function JsonToCsvConverter() {
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <div className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
                <div className="p-2 bg-primary/10 rounded-lg shadow-sm">
                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                </div>
                Convert JSON to CSV
              </CardTitle>
              <CardDescription className="mt-2">
                Convert JSON data to CSV format with a live preview.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">

          <div className="min-h-[400px] font-mono text-sm p-4 bg-muted rounded-lg relative">
            <textarea
              className={`w-full h-full absolute inset-0 p-4 bg-transparent resize-none focus:outline-none ${
                error ? 'border-red-500 border-2' : ''
              }`}
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value)
                processJson(e.target.value)
              }}
              placeholder="Paste your JSON here..."
            />
          </div>

          {error && (
            <div className="p-4 text-red-500 bg-red-50 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {previewData.length > 0 && (
            <>
              <div className="flex justify-center">
                <Button variant="outline" onClick={downloadCsv}>
                  Download CSV
                </Button>
              </div>

              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHead key={header}>{header}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((row, i) => (
                      <TableRow key={i}>
                        {headers.map((header) => (
                          <TableCell key={header}>
                            {Array.isArray(row[header]) ? row[header].join("; ") : String(row[header])}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

