"use client"

import React, { useState } from "react"
import { AlertCircle, Table } from "lucide-react"

import { Button } from "../button"
import { Checkbox } from "../checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../dialog"
import { Input } from "../input"
import { Label } from "../label"
import { Textarea } from "../textarea"
import { StructuralNode } from "./types"
import {
  isMarkdownTable,
  parseMarkdownTable,
} from "./utils/markdown-table-parser"

interface TableDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateTable: (rows: number, cols: number) => void
  onImportMarkdown: (table: StructuralNode) => void
}

export function TableDialog({
  open,
  onOpenChange,
  onCreateTable,
  onImportMarkdown,
}: TableDialogProps) {
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(3)
  const [useMarkdown, setUseMarkdown] = useState(false)
  const [markdownText, setMarkdownText] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleCreate = () => {
    if (useMarkdown) {
      // Parse and import markdown
      const result = parseMarkdownTable(markdownText)
      if (result.success && result.table) {
        onImportMarkdown(result.table)
        onOpenChange(false)
        // Reset
        setMarkdownText("")
        setUseMarkdown(false)
        setError(null)
      } else {
        setError(result.error || "Failed to parse markdown table")
      }
    } else {
      // Create empty table
      if (rows > 0 && cols > 0 && rows <= 20 && cols <= 10) {
        onCreateTable(rows, cols)
        onOpenChange(false)
        // Reset to defaults
        setRows(3)
        setCols(3)
        setError(null)
      }
    }
  }

  const handleMarkdownChange = (value: string) => {
    setMarkdownText(value)
    setError(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Table className="h-5 w-5" />
            Create Table
          </DialogTitle>
          <DialogDescription>
            Create a new table or import from markdown
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Markdown checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="markdown"
              checked={useMarkdown}
              onCheckedChange={(checked: boolean) => {
                setUseMarkdown(checked as boolean)
                setError(null)
              }}
            />
            <Label
              htmlFor="markdown"
              className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I have a markdown table
            </Label>
          </div>

          {useMarkdown ? (
            <>
              {/* Markdown input */}
              <div className="grid gap-2">
                <Label htmlFor="markdown-input">Paste Markdown Table</Label>
                <Textarea
                  id="markdown-input"
                  placeholder={`| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |`}
                  value={markdownText}
                  onChange={(e) => handleMarkdownChange(e.target.value)}
                  className="max-h-[400px] min-h-[150px] font-mono text-xs"
                />
                <div className="text-muted-foreground text-xs">
                  Paste your markdown table above. Must include header and
                  separator rows.
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="text-destructive bg-destructive/10 flex items-start gap-2 rounded p-2 text-xs">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Manual input */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rows" className="text-right">
                  Rows
                </Label>
                <Input
                  id="rows"
                  type="number"
                  min="1"
                  max="20"
                  value={rows}
                  onChange={(e) => setRows(parseInt(e.target.value) || 1)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cols" className="text-right">
                  Columns
                </Label>
                <Input
                  id="cols"
                  type="number"
                  min="1"
                  max="10"
                  value={cols}
                  onChange={(e) => setCols(parseInt(e.target.value) || 1)}
                  className="col-span-3"
                />
              </div>
              <div className="text-muted-foreground px-1 text-xs">
                Maximum: 20 rows × 10 columns
              </div>
            </>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={
              useMarkdown
                ? !markdownText.trim() || !isMarkdownTable(markdownText)
                : rows <= 0 || cols <= 0 || rows > 20 || cols > 10
            }
          >
            {useMarkdown ? "Import Table" : "Create Table"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
