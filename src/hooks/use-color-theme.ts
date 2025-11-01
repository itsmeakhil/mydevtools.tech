"use client"

import { useEffect, useState } from "react"

export type ColorTheme = 
  | "blue" 
  | "purple" 
  | "green" 
  | "orange" 
  | "red" 
  | "pink" 
  | "cyan" 
  | "indigo"

const COLOR_THEME_KEY = "app-color-theme"

export function useColorTheme() {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>("blue")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(COLOR_THEME_KEY) as ColorTheme | null
    if (stored && isValidColorTheme(stored)) {
      setColorThemeState(stored)
      applyColorTheme(stored)
    } else {
      // Apply default blue theme on first load
      applyColorTheme("blue")
    }
  }, [])

  const setColorTheme = (theme: ColorTheme) => {
    setColorThemeState(theme)
    localStorage.setItem(COLOR_THEME_KEY, theme)
    applyColorTheme(theme)
  }

  return { colorTheme, setColorTheme, mounted }
}

function isValidColorTheme(theme: string): theme is ColorTheme {
  return ["blue", "purple", "green", "orange", "red", "pink", "cyan", "indigo"].includes(theme)
}

function applyColorTheme(theme: ColorTheme) {
  const root = document.documentElement
  root.classList.remove("blue", "purple", "green", "orange", "red", "pink", "cyan", "indigo")
  root.classList.add(theme)
}

