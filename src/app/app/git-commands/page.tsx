"use client"

import * as React from "react"
import { Copy, GitBranch } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { gitCommands } from "./git-commands"

export default function GitCommandExplorer() {
  const [typeSpeed, setTypeSpeed] = React.useState(false)
  const [selectedCommand, setSelectedCommand] = React.useState<string>("")
  const [selectedOption, setSelectedOption] = React.useState<string>("")
  const [selectedSubOption, setSelectedSubOption] = React.useState<string>("")
  const [displayedCommand, setDisplayedCommand] = React.useState("")

  const getCommand = () => {
    if (!selectedCommand || !selectedOption) return ""
    const command = gitCommands[selectedCommand as keyof typeof gitCommands]?.options[selectedOption as keyof (typeof gitCommands)[keyof typeof gitCommands]['options']] as { command: string } | { options: Record<string, { command: string }> }
    if (typeof command === "object" && command !== null && "options" in command && command.options) {
      return selectedSubOption ? command.options[selectedSubOption]?.command : ""
    }
    return (command as { command: string })?.command || ""
  }

  const currentCommand = getCommand()

  React.useEffect(() => {
    if (!currentCommand) {
      setDisplayedCommand("")
      return
    }

    setDisplayedCommand("")
    let index = 0
    const speed = typeSpeed ? 10 : 50 // Fast: 10ms, Normal: 50ms

    const timer = setInterval(() => {
      if (index < currentCommand.length) {
        setDisplayedCommand((prev) => prev + currentCommand[index])
        index++
      } else {
        clearInterval(timer)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [currentCommand, typeSpeed])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <div className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
                <div className="p-2 bg-primary/10 rounded-lg shadow-sm">
                  <GitBranch className="h-5 w-5 text-primary" />
                </div>
                Git Command Explorer
              </CardTitle>
              <CardDescription className="mt-2">
                Find the right commands you need without digging through the web.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Type Speed Toggle */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 bg-muted/50 rounded-lg p-1">
                <span className="text-sm text-muted-foreground px-2">Normal type speed</span>
                <Switch checked={typeSpeed} onCheckedChange={setTypeSpeed} />
                <span className="text-sm text-muted-foreground px-2">Fast type speed</span>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-sm font-medium">I want to:</p>
                <Select
                  value={selectedCommand}
                  onValueChange={(value) => {
                    setSelectedCommand(value)
                    setSelectedOption("")
                    setSelectedSubOption("")
                  }}
                >
                  <SelectTrigger className="h-12 font-mono">
                    <SelectValue placeholder="Select command..." />
                  </SelectTrigger>
                  <SelectContent 
                  position="popper" 
                  side="bottom" 
                  align="start"
                  className="max-h-[200px]">
                    {Object.entries(gitCommands).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedCommand && (
                  <Select
                    value={selectedOption}
                    onValueChange={(value) => {
                      setSelectedOption(value)
                      setSelectedSubOption("")
                    }}
                  >
                    <SelectTrigger className="h-12 font-mono">
                      <SelectValue placeholder="Select option..." />
                    </SelectTrigger>
                    <SelectContent 
                    position="popper" 
                    side="bottom" 
                    align="start"
                    className="max-h-[200px]">
                      {Object.entries(gitCommands[selectedCommand as keyof typeof gitCommands].options).map(
                        ([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {typeof value === "object" && "label" in value ? value.label : key}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                )}

                {selectedOption &&
                  typeof gitCommands[selectedCommand as keyof typeof gitCommands].options[selectedOption as keyof (typeof gitCommands)[keyof typeof gitCommands]['options']] === "object" &&
                  "options" in (gitCommands[selectedCommand as keyof typeof gitCommands].options[selectedOption as keyof (typeof gitCommands)[keyof typeof gitCommands]['options']]) && (
                    <Select value={selectedSubOption} onValueChange={setSelectedSubOption}>
                      <SelectTrigger className="h-12 font-mono">
                        <SelectValue placeholder="Select sub-option..." />
                      </SelectTrigger>
                      <SelectContent 
                      position="popper" 
                      side="bottom" 
                      align="start"
                      className="max-h-[200px]">
                        {Object.entries(
                          (gitCommands[selectedCommand as keyof typeof gitCommands].options[selectedOption as keyof (typeof gitCommands)[keyof typeof gitCommands]['options']] as { options: Record<string, { label: string; command: string }> }).options,
                        ).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {(value as { label: string; command: string }).label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
              </div>

              <div className="space-y-4">
                <p className="text-sm font-medium">Usage</p>
                <div className="relative group">
                  <div className="min-h-32 bg-zinc-900 rounded-lg border-l-4 border-zinc-700 p-4 font-mono text-white overflow-auto">
                    {displayedCommand}
                    <span className="animate-pulse">|</span>
                  </div>
                  {currentCommand && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => copyToClipboard(currentCommand)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

