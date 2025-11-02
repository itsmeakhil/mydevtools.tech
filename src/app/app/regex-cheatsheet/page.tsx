"use client"

import * as React from "react"
import { Regex } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { regexData, type RegexSection } from "./regex-data"

export default function RegexCheatsheet() {

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <div className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
                <div className="p-2 bg-primary/10 rounded-lg shadow-sm">
                  <Regex className="h-5 w-5 text-primary" />
                </div>
                JavaScript Regex Cheatsheet
              </CardTitle>
              <CardDescription className="mt-2">
                Regular Expression quick reference guide
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-6">
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

