"use client"

import React from "react"
import { Code2, Search } from "lucide-react"

import { Button } from "../../button"
import { Input } from "../../input"
import { ScrollArea } from "../../scroll-area"
import { Switch } from "../../switch"

interface CustomClassPopoverContentProps {
  searchQuery: string
  setSearchQuery: (value: string) => void
  devMode: boolean
  setDevMode: (value: boolean) => void
  filteredClasses: any[]
  onApplyClass: (className: string) => void
}

export function CustomClassPopoverContent({
  searchQuery,
  setSearchQuery,
  devMode,
  setDevMode,
  filteredClasses,
  onApplyClass,
}: CustomClassPopoverContentProps) {
  return (
    <div className="space-y-3">
      {/* Dev Mode Toggle */}
      <div className="flex items-center justify-between border-b pb-2">
        <div className="flex items-center gap-2">
          <Code2 className="text-muted-foreground h-4 w-4" />
          <span className="text-sm font-medium">Dev Mode</span>
        </div>
        <Switch
          checked={devMode}
          onCheckedChange={setDevMode}
          aria-label="Toggle dev mode"
        />
      </div>

      <div className="relative">
        <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
        <Input
          autoFocus
          placeholder={
            devMode
              ? "Search classes... (e.g., 'text', 'bg', 'flex')"
              : "Search styles... (e.g., 'red', 'bold', 'shadow')"
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {devMode ? (
            // Dev Mode: Show Tailwind classes
            <>
              {filteredClasses.map((group) => (
                <div key={group.category}>
                  <h4 className="text-muted-foreground mb-2 text-xs font-semibold">
                    {group.category}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(group as any).classes.map((cls: string) => (
                      <Button
                        key={cls}
                        variant="outline"
                        size="sm"
                        onClick={() => onApplyClass(cls)}
                        className="h-6 px-2 text-xs"
                      >
                        {cls}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </>
          ) : (
            // User Mode: Show user-friendly names
            <>
              {filteredClasses.map((group) => (
                <div key={group.category}>
                  <h4 className="text-muted-foreground mb-2 text-xs font-semibold">
                    {group.category}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(group as any).items.map(
                      (item: { label: string; value: string }) => (
                        <Button
                          key={item.value}
                          variant="outline"
                          size="sm"
                          onClick={() => onApplyClass(item.value)}
                          className="h-6 px-2 text-xs"
                          title={`Applies: ${item.value}`}
                        >
                          {item.label}
                        </Button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
          {filteredClasses.length === 0 && (
            <div className="text-muted-foreground py-8 text-center text-sm">
              No classes found matching &quot;{searchQuery}&quot;
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
