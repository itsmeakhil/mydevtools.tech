"use client"

import * as React from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface DiffResult {
  type: "added" | "removed" | "modified" | "unchanged"
  key: string
  value: unknown
  oldValue?: unknown
  indent: number
  isArray?: boolean
}

export default function JsonDiff() {
  const [isFavorite, setIsFavorite] = React.useState(false)
  const [showDifferences, setShowDifferences] = React.useState(false)
  const [firstJson, setFirstJson] = React.useState("")
  const [secondJson, setSecondJson] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [diffOutput, setDiffOutput] = React.useState<string>("")

  type JsonValue = string | number | boolean | null | { [key: string]: JsonValue } | JsonValue[];
  
  const compareObjects = React.useCallback(
    (obj1: JsonValue, obj2: JsonValue, indent = 1, isArrayItem = false): DiffResult[] => {
      const results: DiffResult[] = []

      if (Array.isArray(obj1) || Array.isArray(obj2)) {
        const arr1 = Array.isArray(obj1) ? obj1 : []
        const arr2 = Array.isArray(obj2) ? obj2 : []
        const maxLength = Math.max(arr1.length, arr2.length)

        for (let i = 0; i < maxLength; i++) {
          if (i < arr1.length && i < arr2.length) {
            results.push(...compareObjects(arr1[i], arr2[i], indent + 1, true))
          } else if (i < arr2.length) {
            // Added item
            results.push({
              type: "added",
              key: "",
              value: arr2[i],
              indent: indent + 1,
              isArray: true,
            })
          } else if (i < arr1.length) {
            // Removed item
            results.push({
              type: "removed",
              key: "",
              value: arr1[i],
              indent: indent + 1,
              isArray: true,
            })
          }
        }
        return results
      }

      if (typeof obj1 !== "object" || typeof obj2 !== "object" || obj1 === null || obj2 === null) {
        return [
          {
            type: obj1 === obj2 ? "unchanged" : "modified",
            key: "",
            value: obj2,
            oldValue: obj1,
            indent,
            isArray: isArrayItem,
          },
        ]
      }

      const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})])

      allKeys.forEach((key) => {
        if (!(key in obj1)) {
          results.push({
            type: "added",
            key,
            value: obj2[key],
            indent,
            isArray: isArrayItem,
          })
        } else if (!(key in obj2)) {
          results.push({
            type: "removed",
            key,
            value: obj1[key],
            indent,
            isArray: isArrayItem,
          })
        } else if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
          if (
            typeof obj1[key] === "object" &&
            typeof obj2[key] === "object" &&
            obj1[key] !== null &&
            obj2[key] !== null
          ) {
            results.push(...compareObjects(obj1[key], obj2[key], indent + 1))
          } else {
            results.push({
              type: "modified",
              key,
              value: obj2[key],
              oldValue: obj1[key],
              indent,
              isArray: isArrayItem,
            })
          }
        } else if (!showDifferences) {
          results.push({
            type: "unchanged",
            key,
            value: obj1[key],
            indent,
            isArray: isArrayItem,
          })
        }
      })

      return results
    },
    [showDifferences],
  )

  const generateDiffOutput = React.useCallback((diffs: DiffResult[]): string => {
    let output = "{\n"

    diffs.forEach((diff, index) => {
      const indent = "  ".repeat(diff.indent)
      const isLast = index === diffs.length - 1

      let line = ""
      if (diff.isArray && !diff.key) {
        line = indent + "{\n"
        const objectToUse = diff.type === "modified" ? diff.oldValue : diff.value;
        const content = (typeof objectToUse === 'object' && objectToUse !== null ? Object.entries(objectToUse) : [])
          .map(([key, value]) => `${indent}  "${key}": ${JSON.stringify(value)}`)
          .join(",\n")

        if (diff.type === "added") {
          line = `<span class="bg-green-500/20">${line}${content}\n${indent}}</span>`
        } else if (diff.type === "removed") {
          line = `<span class="bg-red-500/20">${line}${content}\n${indent}}</span>`
        } else if (diff.type === "modified") {
          const newContent = Object.entries(diff.value as Record<string, unknown>)
            .map(([key, value]) => `${indent}  "${key}": ${JSON.stringify(value)}`)
            .join(",\n")
          line = `${line}${content}\n${indent}},\n${indent}{\n${newContent}\n${indent}}`
        } else {
          line = `${line}${content}\n${indent}}`
        }
      } else if (diff.key) {
        const keyPart = `${indent}"${diff.key}": `
        if (Array.isArray(diff.value) || Array.isArray(diff.oldValue)) {
          // Handle array values
          line = `${keyPart}[\n`
          if (diff.type === "added") {
            line = `<span class="bg-green-500/20">${keyPart}${JSON.stringify(diff.value)}</span>`
          } else if (diff.type === "removed") {
            line = `<span class="bg-red-500/20">${keyPart}${JSON.stringify(diff.value)}</span>`
          } else if (diff.type === "modified") {
            line = `${keyPart}<span class="bg-red-500/20">${JSON.stringify(diff.oldValue)}</span> <span class="bg-green-500/20">${JSON.stringify(diff.value)}</span>`
          } else {
            line = `${keyPart}${JSON.stringify(diff.value)}`
          }
        } else {
          if (diff.type === "modified") {
            line = `${keyPart}<span class="bg-red-500/20">${JSON.stringify(diff.oldValue)}</span> <span class="bg-green-500/20">${JSON.stringify(diff.value)}</span>`
          } else if (diff.type === "added") {
            line = `<span class="bg-green-500/20">${keyPart}${JSON.stringify(diff.value)}</span>`
          } else if (diff.type === "removed") {
            line = `<span class="bg-red-500/20">${keyPart}${JSON.stringify(diff.value)}</span>`
          } else {
            line = `${keyPart}${JSON.stringify(diff.value)}`
          }
        }
      }

      output += line + (isLast ? "" : ",\n")
    })

    output += "\n}"
    return output
  }, [])

  React.useEffect(() => {
    try {
      const obj1 = JSON.parse(firstJson || "{}")
      const obj2 = JSON.parse(secondJson || "{}")

      const diffs = compareObjects(obj1, obj2)
      const output = generateDiffOutput(diffs)
      setDiffOutput(output)
      setError(null)
    } catch  {
      setError("Invalid JSON format")
      setDiffOutput("")
    }
  }, [firstJson, secondJson, compareObjects, generateDiffOutput])

  return (
    <div className="container mx-auto p-4">
      <Card className="relative overflow-hidden rounded-xl border shadow-sm dark:bg-gray-900">
        <div className="p-6">
          {/* Header Section */}
          <div className="relative mb-6">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0"
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart className={isFavorite ? "fill-current text-red-500" : ""} />
            </Button>
            <div className="text-center">
              <h1 className="mb-2 text-3xl font-bold">JSON diff</h1>
              <p className="text-muted-foreground">Compare two JSON objects and get the differences between them.</p>
            </div>
          </div>

          {/* JSON Input Section */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstJson">Your first JSON</Label>
              <Textarea
                id="firstJson"
                className="min-h-[300px] font-mono"
                placeholder="Paste your first JSON here..."
                value={firstJson}
                onChange={(e) => setFirstJson(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondJson">Your JSON to compare</Label>
              <Textarea
                id="secondJson"
                className="min-h-[300px] font-mono"
                placeholder="Paste your second JSON here..."
                value={secondJson}
                onChange={(e) => setSecondJson(e.target.value)}
              />
            </div>
          </div>

          {/* Controls Section */}
          <div className="mt-6 flex items-center justify-end space-x-2">
            <Label htmlFor="show-differences" className="text-sm">
              Only show differences
            </Label>
            <Switch id="show-differences" checked={showDifferences} onCheckedChange={setShowDifferences} />
          </div>

          {/* Diff Output Section */}
          <div className="mt-6 rounded-lg border bg-card p-4">
            {error ? (
              <div className="text-destructive">{error}</div>
            ) : (
              <pre className="max-h-[400px] overflow-auto whitespace-pre font-mono text-sm leading-relaxed bg-gray-50 dark:bg-gray-900 p-4">
                <code
                  dangerouslySetInnerHTML={{
                    __html: diffOutput,
                  }}
                />
              </pre>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

