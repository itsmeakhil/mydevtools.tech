"use client"

import * as React from "react"
import { Heart } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CronInput } from "./cron-input"
import { commonPatterns, interpretCron } from "./cron-utils"

export default function CrontabGenerator() {
  const [verbose, setVerbose] = React.useState(false)
  const [use24Hour, setUse24Hour] = React.useState(true)
  const [daysStartAtZero, setDaysStartAtZero] = React.useState(false)
  const [isFavorite, setIsFavorite] = React.useState(false)
  const [cronParts, setCronParts] = React.useState({
    minute: "*",
    hour: "*",
    dayOfMonth: "*",
    month: "*",
    dayOfWeek: "*",
  })

  const handlePartChange = (part: keyof typeof cronParts, value: string) => {
    setCronParts((prev) => ({ ...prev, [part]: value }))
  }

  const handlePatternSelect = (pattern: string) => {
    const selectedPattern = commonPatterns.find((p) => p.name === pattern)
    if (selectedPattern) {
      const [minute, hour, dom, month, dow] = selectedPattern.cron.split(" ")
      setCronParts({
        minute,
        hour,
        dayOfMonth: dom,
        month,
        dayOfWeek: dow,
      })
    }
  }

  const cronString = `${cronParts.minute} ${cronParts.hour} ${cronParts.dayOfMonth} ${cronParts.month} ${cronParts.dayOfWeek}`
  const description = interpretCron(cronString, use24Hour)

  return (
    <div className="container mx-auto p-4">
      <Card className="mx-auto max-w-5xl shadow-sm">
        <CardHeader className="relative pb-2">
          <div className="absolute right-6 top-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFavorite(!isFavorite)}
              className="text-muted-foreground hover:text-primary"
            >
              <Heart className={isFavorite ? "fill-current" : ""} />
            </Button>
          </div>
          <h1 className="text-center text-3xl font-semibold">Crontab generator</h1>
          <p className="text-center text-muted-foreground mt-2">
            Validate and generate crontab and get the human-readable description of the cron schedule.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-muted p-6">
            <div className="grid grid-cols-5 gap-4 mb-4">
              <CronInput
                value={cronParts.minute}
                onChange={(v) => handlePartChange("minute", v)}
                label="Minute"
                min={0}
                max={59}
              />
              <CronInput
                value={cronParts.hour}
                onChange={(v) => handlePartChange("hour", v)}
                label="Hour"
                min={0}
                max={23}
              />
              <CronInput
                value={cronParts.dayOfMonth}
                onChange={(v) => handlePartChange("dayOfMonth", v)}
                label="Day (Month)"
                min={1}
                max={31}
              />
              <CronInput
                value={cronParts.month}
                onChange={(v) => handlePartChange("month", v)}
                label="Month"
                min={1}
                max={12}
              />
              <CronInput
                value={cronParts.dayOfWeek}
                onChange={(v) => handlePartChange("dayOfWeek", v)}
                label="Day (Week)"
                min={0}
                max={6}
              />
            </div>
            <div className="text-center font-mono text-xl mb-4">{cronString}</div>
            <p className="text-center text-muted-foreground">{description}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="pattern" className="flex-1">
                Common Patterns
              </Label>
              <Select onValueChange={handlePatternSelect}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select pattern" />
                </SelectTrigger>
                <SelectContent>
                  {commonPatterns.map((pattern) => (
                    <SelectItem key={pattern.name} value={pattern.name}>
                      {pattern.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="verbose" className="flex-1">
                Verbose
              </Label>
              <Switch id="verbose" checked={verbose} onCheckedChange={setVerbose} />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="24hour" className="flex-1">
                Use 24 hour time format
              </Label>
              <Switch id="24hour" checked={use24Hour} onCheckedChange={setUse24Hour} />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="daysStart" className="flex-1">
                Days start at 0
              </Label>
              <Switch id="daysStart" checked={daysStartAtZero} onCheckedChange={setDaysStartAtZero} />
            </div>

            <div className="space-y-6 mt-8 border-t pt-6">
              <div className="rounded-lg bg-muted p-4">
                <h3 className="text-lg font-semibold mb-2">Crontab Format</h3>
                <pre className="text-xs font-mono">
                  {`┌──────────── [optional] seconds (0 - 59)
| ┌────────── minute (0 - 59)
| | ┌──────── hour (0 - 23)
| | | ┌────── day of month (1 - 31)
| | | | ┌──── month (1 - 12) OR jan,feb,mar,apr ...
| | | | | ┌── day of week (0 - 6, sunday=0) OR sun,mon ...
| | | | | |
* * * * * * command`}
                </pre>
                
              </div>

              <div className="rounded-lg bg-muted p-4">
                <h3 className="text-lg font-semibold mb-2">Special Characters</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-4 py-2 text-left text-sm font-medium">SYMBOL</th>
                        <th className="px-4 py-2 text-left text-sm font-medium">MEANING</th>
                        <th className="px-4 py-2 text-left text-sm font-medium">EXAMPLE</th>
                        <th className="px-4 py-2 text-left text-sm font-medium">EQUIVALENT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="px-4 py-2 text-sm">*</td>
                        <td className="px-4 py-2 text-sm">Any value</td>
                        <td className="px-4 py-2 text-sm">* * * *</td>
                        <td className="px-4 py-2 text-sm">Every minute</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm">-</td>
                        <td className="px-4 py-2 text-sm">Range of values</td>
                        <td className="px-4 py-2 text-sm">1-10 * * *</td>
                        <td className="px-4 py-2 text-sm">Minutes 1 through 10</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm">,</td>
                        <td className="px-4 py-2 text-sm">List of values</td>
                        <td className="px-4 py-2 text-sm">1,10 * * *</td>
                        <td className="px-4 py-2 text-sm">At minutes 1 and 10</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm">/</td>
                        <td className="px-4 py-2 text-sm">Step values</td>
                        <td className="px-4 py-2 text-sm">*/10 * * *</td>
                        <td className="px-4 py-2 text-sm">Every 10 minutes</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <h3 className="text-lg font-semibold mb-2">Common Patterns</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-4 py-2 text-left text-sm font-medium">PATTERN</th>
                        <th className="px-4 py-2 text-left text-sm font-medium">DESCRIPTION</th>
                        <th className="px-4 py-2 text-left text-sm font-medium">EQUIVALENT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {commonPatterns.map((pattern) => (
                        <tr key={pattern.name}>
                          <td className="px-4 py-2 text-sm font-mono">{pattern.name}</td>
                          <td className="px-4 py-2 text-sm">{pattern.description}</td>
                          <td className="px-4 py-2 text-sm font-mono">{pattern.cron}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

