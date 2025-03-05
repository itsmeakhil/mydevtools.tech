import type React from "react"
import "@/app/globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "./theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MAC Address Lookup Tool",
  description: "Find the vendor and manufacturer of a device by its MAC address",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
  <div>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
  </div>
      
      
  )
}

