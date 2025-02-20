"use client"

import * as React from "react"
import { Heart } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type JsonData = Record<string, string | number | boolean | string[]>

export default function JsonToCsvConverter() {
  const [jsonInput, setJsonInput] = React.useState("")
  const [previewData, setPreviewData] = React.useState<JsonData[]>([])
  const [headers, setHeaders] = React.useState<string[]>([])
  const [isFavorite, setIsFavorite] = React.useState(false)
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
    <div className="container mx-auto p-4 max-w-7xl">
      <Card className="p-6 relative border shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4"
          onClick={() => setIsFavorite(!isFavorite)}
        >
          <Heart className={`h-5 w-5 ${isFavorite ? "fill-primary" : ""}`} />
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Convert JSON to CSV</h1>
          <p className="text-muted-foreground">
            Click your JSON below to edit. Please{" "}
            <a href="#" className="text-blue-500 hover:underline">
              report bugs and send feedback
            </a>{" "}
            on GitHub.
          </p>
        </div>

        <div className="space-y-6">
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
        </div>
      </Card>
    </div>
  )
}

