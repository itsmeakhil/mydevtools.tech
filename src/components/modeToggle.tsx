"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = theme === "dark"

  const toggleTheme = (checked: boolean) => {
    setTheme(checked ? "dark" : "light")
  }

  if (!mounted) {
    return (
      <SwitchPrimitives.Root
        className={cn(
          "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-input shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
          "data-[state=checked]:bg-primary"
        )}
        disabled
      >
        <SwitchPrimitives.Thumb
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform flex items-center justify-center",
            "data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
          )}
        >
          <Sun className="h-3.5 w-3.5 text-orange-500" />
        </SwitchPrimitives.Thumb>
      </SwitchPrimitives.Root>
    )
  }

  return (
    <SwitchPrimitives.Root
      checked={isDark}
      onCheckedChange={toggleTheme}
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-input shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-primary"
      )}
      aria-label="Toggle theme"
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform flex items-center justify-center",
          "data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
        )}
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5 text-primary transition-all" />
        ) : (
          <Sun className="h-3.5 w-3.5 text-orange-500 transition-all" />
        )}
      </SwitchPrimitives.Thumb>
    </SwitchPrimitives.Root>
  )
}
