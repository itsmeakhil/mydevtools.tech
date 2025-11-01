"use client"

import * as React from "react"
import { Check, Palette } from "lucide-react"
import { useColorTheme, type ColorTheme } from "@/hooks/use-color-theme"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const colors: { name: ColorTheme; light: string; dark: string }[] = [
  { name: "blue", light: "hsl(217.2, 91.2%, 59.8%)", dark: "hsl(217.2, 91.2%, 59.8%)" },
  { name: "purple", light: "hsl(258.3, 89.5%, 66.3%)", dark: "hsl(258.3, 89.5%, 66.3%)" },
  { name: "green", light: "hsl(142.1, 76.2%, 36.3%)", dark: "hsl(142.1, 70.6%, 45.3%)" },
  { name: "orange", light: "hsl(24.6, 95%, 53.1%)", dark: "hsl(24.6, 95%, 53.1%)" },
  { name: "red", light: "hsl(0, 72.2%, 50.6%)", dark: "hsl(0, 72.2%, 50.6%)" },
  { name: "pink", light: "hsl(340.7, 82.1%, 52.7%)", dark: "hsl(340.7, 82.1%, 52.7%)" },
  { name: "cyan", light: "hsl(199.1, 89.1%, 48.2%)", dark: "hsl(199.1, 89.1%, 48.2%)" },
  { name: "indigo", light: "hsl(239.4, 83.9%, 66.7%)", dark: "hsl(239.4, 83.9%, 66.7%)" },
]

export function ColorPicker() {
  const { colorTheme, setColorTheme, mounted } = useColorTheme()

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 md:h-9 md:w-9"
        disabled
      >
        <Palette className="h-4 w-4 md:h-5 md:w-5" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 md:h-9 md:w-9"
          aria-label="Color theme"
        >
          <Palette className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {colors.map((color) => (
          <DropdownMenuItem
            key={color.name}
            onClick={() => setColorTheme(color.name)}
            className="flex items-center justify-between gap-3 cursor-pointer px-3 py-2.5"
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "h-4 w-4 rounded-full border-2 border-border shadow-sm",
                  "dark:hidden"
                )}
                style={{ backgroundColor: color.light }}
              />
              <div
                className={cn(
                  "h-4 w-4 rounded-full border-2 border-border shadow-sm",
                  "hidden dark:block"
                )}
                style={{ backgroundColor: color.dark }}
              />
              <span className="capitalize text-sm font-medium">{color.name}</span>
            </div>
            {colorTheme === color.name && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

