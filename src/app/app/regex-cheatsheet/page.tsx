"use client"

import * as React from "react"
import { Regex, Search, Copy, Check, Play } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tab"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { regexData, type RegexSection } from "./regex-data"

export default function RegexCheatsheet() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [copiedExpression, setCopiedExpression] = React.useState<string | null>(null)
  const [testRegex, setTestRegex] = React.useState("")
  const [testString, setTestString] = React.useState("Hello World! 123")
  const [regexError, setRegexError] = React.useState<string | null>(null)
  const [matches, setMatches] = React.useState<RegExpMatchArray | null>(null)
  const [matchDetails, setMatchDetails] = React.useState<any[]>([])

  // Filter regex data based on search query
  const filteredData = React.useMemo(() => {
    if (!searchQuery.trim()) return regexData

    const query = searchQuery.toLowerCase()
    return regexData
      .map((section) => {
        const filteredEntries = section.entries.filter(
          (entry) =>
            entry.expression.toLowerCase().includes(query) ||
            entry.description.toLowerCase().includes(query)
        )

        const filteredSubsections = section.subsections?.map((subsection) => ({
          ...subsection,
          entries: subsection.entries.filter(
            (entry) =>
              entry.expression.toLowerCase().includes(query) ||
              entry.description.toLowerCase().includes(query)
          ),
        }))

        return {
          ...section,
          entries: filteredEntries,
          subsections: filteredSubsections?.filter((sub) => sub.entries.length > 0),
        }
      })
      .filter(
        (section) =>
          section.entries.length > 0 ||
          (section.subsections && section.subsections.length > 0)
      )
  }, [searchQuery])

  // Handle regex testing
  React.useEffect(() => {
    if (!testRegex.trim()) {
      setRegexError(null)
      setMatches(null)
      setMatchDetails([])
      return
    }

    try {
      const regex = new RegExp(testRegex, "g")
      const allMatches = [...testString.matchAll(regex)]
      const simpleMatches = testString.match(regex)

      setMatches(simpleMatches)
      setRegexError(null)

      const details = allMatches.map((match, index) => ({
        index,
        match: match[0],
        indexInString: match.index,
        groups: match.groups || {},
        input: match.input,
      }))
      setMatchDetails(details)
    } catch (error) {
      setRegexError(error instanceof Error ? error.message : "Invalid regex")
      setMatches(null)
      setMatchDetails([])
    }
  }, [testRegex, testString])

  const handleCopy = (expression: string) => {
    navigator.clipboard.writeText(expression)
    setCopiedExpression(expression)
    setTimeout(() => setCopiedExpression(null), 2000)
  }

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
                Regular Expression quick reference guide with interactive tester
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="cheatsheet" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="cheatsheet">Cheatsheet</TabsTrigger>
                <TabsTrigger value="tester">Regex Tester</TabsTrigger>
              </TabsList>

              <TabsContent value="cheatsheet" className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search expressions or descriptions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {searchQuery && (
                  <div className="text-sm text-muted-foreground">
                    Found {filteredData.reduce((acc, section) => {
                      const sectionCount = section.entries.length
                      const subsectionCount = section.subsections?.reduce(
                        (subAcc, sub) => subAcc + sub.entries.length,
                        0
                      ) || 0
                      return acc + sectionCount + subsectionCount
                    }, 0)} results
                  </div>
                )}

                <div className="p-6">
              {/* Regex Sections */}
              {filteredData.map((section: RegexSection, index: number) => (
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
                          <TableCell className="font-mono">
                            <div className="flex items-center gap-2">
                              <span>{entry.expression}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleCopy(entry.expression)}
                                title="Copy expression"
                              >
                                {copiedExpression === entry.expression ? (
                                  <Check className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
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
                                <TableCell className="font-mono">
                                  <div className="flex items-center gap-2">
                                    <span>{entry.expression}</span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => handleCopy(entry.expression)}
                                      title="Copy expression"
                                    >
                                      {copiedExpression === entry.expression ? (
                                        <Check className="h-3 w-3 text-green-600" />
                                      ) : (
                                        <Copy className="h-3 w-3" />
                                      )}
                                    </Button>
                                  </div>
                                </TableCell>
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
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      MDN Documentation
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://regexplained.com"
                      className="text-primary hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      RegExplained
                    </a>
                  </li>
                </ul>
              </section>
                </div>
              </TabsContent>

              <TabsContent value="tester" className="space-y-4">
                <div className="space-y-4">
                  {/* Regex Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Regular Expression</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter regex pattern (e.g., /\\d+/g)"
                        value={testRegex}
                        onChange={(e) => setTestRegex(e.target.value)}
                        className="font-mono"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopy(testRegex)}
                        disabled={!testRegex}
                        title="Copy regex"
                      >
                        {copiedExpression === testRegex ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {regexError && (
                      <Alert variant="destructive">
                        <AlertDescription>{regexError}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* Test String Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Test String</label>
                    <Textarea
                      placeholder="Enter text to test against the regex..."
                      value={testString}
                      onChange={(e) => setTestString(e.target.value)}
                      className="font-mono min-h-[100px]"
                    />
                  </div>

                  {/* Results */}
                  {testRegex && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        <h3 className="text-lg font-semibold">Match Results</h3>
                      </div>

                      {matches ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Badge variant="default">
                              {matches.length} {matches.length === 1 ? "match" : "matches"} found
                            </Badge>
                          </div>

                          {/* Highlighted Matches */}
                          <div className="rounded-lg border p-4 bg-muted/50">
                            <div className="text-sm font-medium mb-2">Matches in text:</div>
                            <div className="font-mono text-sm whitespace-pre-wrap break-words">
                              {matchDetails.length > 0
                                ? (() => {
                                    let result = ""
                                    let lastIndex = 0
                                    matchDetails.forEach((detail) => {
                                      result += testString.slice(
                                        lastIndex,
                                        detail.indexInString
                                      )
                                      result += `<mark class="bg-yellow-400 dark:bg-yellow-600 px-1 rounded">${detail.match}</mark>`
                                      lastIndex = (detail.indexInString || 0) + detail.match.length
                                    })
                                    result += testString.slice(lastIndex)
                                    return <span dangerouslySetInnerHTML={{ __html: result }} />
                                  })()
                                : testString}
                            </div>
                          </div>

                          {/* Match Details */}
                          <div className="space-y-2">
                            <div className="text-sm font-medium">Match Details:</div>
                            <div className="space-y-2">
                              {matchDetails.map((detail, index) => (
                                <div
                                  key={index}
                                  className="rounded-lg border p-3 bg-card text-sm"
                                >
                                  <div className="font-mono">
                                    <Badge variant="secondary" className="mr-2">
                                      Match {index + 1}
                                    </Badge>
                                    <span className="text-primary">{detail.match}</span>
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Position: {detail.indexInString} -{" "}
                                    {(detail.indexInString || 0) + detail.match.length - 1}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Alert>
                          <AlertDescription>No matches found</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}

                  {/* Quick Examples */}
                  <div className="mt-6 space-y-2">
                    <div className="text-sm font-medium">Quick Examples:</div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { regex: "\\d+", desc: "Numbers" },
                        { regex: "[A-Za-z]+", desc: "Letters" },
                        { regex: "\\w+@\\w+\\.\\w+", desc: "Email" },
                        { regex: "^https?://", desc: "URL" },
                      ].map((example) => (
                        <Button
                          key={example.regex}
                          variant="outline"
                          size="sm"
                          onClick={() => setTestRegex(example.regex)}
                          className="text-xs"
                        >
                          {example.desc}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

