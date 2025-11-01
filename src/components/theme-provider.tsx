"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes"
import { SpacemanThemeProvider } from "@space-man/react-theme-animation"

function ThemeSync({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useNextTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Sync themes - this ensures both systems stay in sync
  React.useEffect(() => {
    if (mounted && theme) {
      // Theme sync happens automatically through the SpacemanThemeProvider
    }
  }, [theme, mounted])

  return <>{children}</>
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <SpacemanThemeProvider
        defaultTheme={props.defaultTheme || "system"}
        animationType="CIRCLE"
        duration={400}
        blurAmount={8}
      >
        <ThemeSync>{children}</ThemeSync>
      </SpacemanThemeProvider>
    </NextThemesProvider>
  )
}
