import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Toaster } from 'sonner'
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { Geist_Mono as NextGeistMono } from 'next/font/google'

import "./globals.css";

const geistMono = NextGeistMono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap'
})

export const metadata: Metadata = {
  title: "MyDevTools - Essential tools for Developers",
  keywords: [
    "Developer Tools",
    "JSON Formatter",
    "YAML to JSON Converter",
    "To-Do App",
    "Note-Taking",
    "Developer Productivity",
    "MyDevTools",
  ],
  description: "Your Ultimate Developer Toolkit Streamline your development workflow with MyDevTools, an all-in-one platform built for developers. From intuitive to-do lists and random note-taking features to essential utilities like JSON/YAML converters, formatters, and more, MyDevTools simplifies your daily coding tasks. Boost productivity, stay organized, and access a growing suite of tools tailored to meet the needs of modern developers—all in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn(
      geistMono.variable
    )}>
      <body suppressHydrationWarning className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
          {children}
          <Analytics />
          <SpeedInsights />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
