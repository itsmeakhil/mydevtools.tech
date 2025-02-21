"use client"

import * as React from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { regexData, type RegexSection } from "./regex-data"

export default function RegexCheatsheet() {
  const [isFavorited, setIsFavorited] = React.useState(false)

  if (!regexData || regexData.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <Card className="p-6">
          <p className="text-center text-muted-foreground">No regex data available.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <Card className="relative">
        <div className="p-6">
          {/* Header with favorite button */}
          <div className="absolute right-6 top-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFavorited(!isFavorited)}
              className="text-muted-foreground hover:text-primary"
            >
              <Heart className={isFavorited ? "fill-current" : ""} />
            </Button>
          </div>

          {/* Title and Description */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">JavaScript Regex Cheatsheet</h1>
            <p className="text-muted-foreground">Regular Expression quick reference guide</p>
          </div>

          {/* Regex Sections */}
          {regexData.map((section: RegexSection, index: number) => (
            <section key={index} className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{section.name}</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Expression</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {section.entries.map((entry, entryIndex) => (
                    <TableRow key={entryIndex}>
                      <TableCell className="font-mono">{entry.expression}</TableCell>
                      <TableCell>{entry.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {section.notes && (
                <div className="mt-4 text-sm text-muted-foreground">
                  <p className="font-medium mb-2">Notes:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    {section.notes.map((note, noteIndex) => (
                      <li key={noteIndex}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
              {section.subsections &&
                section.subsections.map((subsection, subIndex) => (
                  <div key={subIndex} className="mt-6">
                    <h3 className="text-lg font-medium mb-3">{subsection.name}</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[200px]">Expression</TableHead>
                          <TableHead>Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subsection.entries.map((entry, entryIndex) => (
                          <TableRow key={entryIndex}>
                            <TableCell className="font-mono">{entry.expression}</TableCell>
                            <TableCell>{entry.description}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {subsection.notes && (
                      <div className="mt-4 text-sm text-muted-foreground">
                        <p className="font-medium mb-2">Notes:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          {subsection.notes.map((note, noteIndex) => (
                            <li key={noteIndex}>{note}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
            </section>
          ))}

          {/* References */}
          <section className="mt-8">
            <h2 className="text-xl font-semibold mb-4">References and Tools</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <a
                  href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions"
                  className="text-primary hover:underline"
                >
                  MDN Documentation
                </a>
              </li>
              <li>
                <a href="https://regexplained.com" className="text-primary hover:underline">
                  RegExplained
                </a>
              </li>
            </ul>
          </section>
        </div>
      </Card>
    </div>
  )
}

