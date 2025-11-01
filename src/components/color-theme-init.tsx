"use client"

import { useColorTheme } from "@/hooks/use-color-theme"

export function ColorThemeInit() {
  const { mounted } = useColorTheme()
  
  // This component ensures the color theme hook runs on mount
  // but doesn't render anything
  return null
}

